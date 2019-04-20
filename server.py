from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.datastructures import ImmutableMultiDict
import json


app = Flask(__name__)
CORS(app)


#connecting to MySQL database
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="YOUR_DATABASE_PASSWD",
        auth_plugin='mysql_native_password',
        database='DATABASE_NAME'
    )
    print("\nConnected to database SUCCESSFULLY\n")
except Exception as e:
    print("\nERROR in connecting with database:\n", e)
mycursor = db.cursor()



#api for handeling build_new_form request and creare DB table 
@app.route("/", methods=["GET", "POST"])
def index():
    if request.form:
        data = ImmutableMultiDict(request.form)
        obj = list(data.to_dict(flat=False).keys())[0]
        req_data = json.loads(obj)

        #sql query for creating tables
        table_name = req_data['form_title']
        questions = []
        init_values = []

        table_query = f"CREATE TABLE {table_name} (id INT AUTO_INCREMENT PRIMARY KEY"
        question_query = f"INSERT INTO {table_name} ("
        form_fields = req_data['form_fields']

        
        for field in form_fields:
            questions.append(field['title'])
            q_type = field['q_type']
            column_name = field['q_type'] + str(field['q_id'])
            question_query += f"{column_name},"

            if (q_type == "paragraph"):
                table_query += f", {column_name} VARCHAR(300)"
            else:
                table_query += f", {column_name} VARCHAR(128)"

            #initial values of different fields
            if (q_type == "multiplechoice"):
                options = field['options']
                options = ",".join(options)
                init_values.append(options)
            elif (q_type == "dropdown"):
                options = field['options']
                options = ",".join(options)
                init_values.append(options)
            elif (q_type == "range"):
                min = field['min']
                max = field['max']
                init_values.append((",".join([min, max])))
            else:
                init_values.append("")    
           
        table_query += ")"

        #create database table
        mycursor.execute(table_query)
        db.commit()

        #add questions entry to the table
        total_question = len(form_fields)
        question_query = question_query[:-1] + ") VALUES (" + "%s,"*total_question 
        question_query = question_query[:-1] + ")"

        #sql query to add questions to db table
        try:
            mycursor.execute(question_query, tuple(questions))
            db.commit()
        except Exception as e:
            print(e)

        #sql query to add initial values to db table
        try:
            mycursor.execute(question_query, tuple(init_values))
            db.commit()
        except Exception as e:
            print(e)    
 
    return '{"status_code": "200 OK", "message": "Form table created successfully"}'



#api for sharing form_url and handleing new response
@app.route("/form/<form_title>", methods=["GET", "POST"])
def show_form(form_title):
    if request.form:
        data = ImmutableMultiDict(request.form)
        obj = list(data.to_dict(flat=False).keys())[0]
        req_data = json.loads(obj)
        response_data = req_data['response']

        #sql query for inserting new response to db
        insert_query = f"INSERT INTO {form_title} ("
        response_list = []

        for field in response_data:
            response_list.append(field['response'])
            insert_query += f"{field['q_type']},"

        total_question = len(response_data)
        insert_query = insert_query[:-1] + ") VALUES (" + "%s,"*total_question
        insert_query = insert_query[:-1] + ")"

        #execute insert query
        try:
            mycursor.execute(insert_query, tuple(response_list))
            db.commit()
        except Exception as e:
            print(e)
            return '{"status_code": "400 Bad request", "message": "Some unexpected ERROR occured"}'
    
        return '{"status_code": "200 OK", "message": "Response added successfully"}'


    #if get request made then return form_fields (questions_list)
    q_list_query = f'SELECT * FROM {form_title} WHERE id=1'
    q_init_value_query = f'SELECT * FROM {form_title} WHERE id=2'
    q_type_query = f'SHOW COLUMNS FROM {form_title}'
    try:
        result = []

        mycursor.execute(q_list_query)
        questions_list = mycursor.fetchone()
        db.commit()

        mycursor.execute(q_init_value_query)
        init_values_list = mycursor.fetchone()
        db.commit()
        
        mycursor.execute(q_type_query)
        i = 1
        for x in mycursor:
            if (x[0] != 'id'):
                result.append({"q_type": x[0], "q_title": questions_list[i], "response": "", "init_val": init_values_list[i]})
                i +=1
        db.commit()

        res = {"status_code": "200 OK", "message": result}

        return jsonify(res)
    except Exception as e:
        return '{"status_code": "400 Bad Request", "message": "No such FORM found"}'


#api for getting form_responses
@app.route("/data/<form_title>", methods=["GET"])
def get_response(form_title):
    respose_query = f"SELECT * FROM {form_title} WHERE id>2"
    q_list_query = f'SELECT * FROM {form_title} WHERE id=1'

    try:
        mycursor.execute(respose_query)
        response_list = mycursor.fetchall()
        db.commit()
        
        mycursor.execute(q_list_query)
        questions_list = mycursor.fetchone()
        db.commit()

    except Exception as e:
        print(e)  
        return '{"status_code": "400 Bad request", "message": "No such entry found"}'  

    response_data = {"status_code": "200 OK", "q_list": questions_list, "responses": response_list}

    return jsonify(response_data)


if __name__ == '__main__':
 app.run(debug=True)