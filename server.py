from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import request
from flask import jsonify
from flask_cors import CORS
from werkzeug.datastructures import ImmutableMultiDict
import json


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:passwd@localhost/db_name'  #Cofigure Password and DB_name
CORS(app)
db = SQLAlchemy(app) 

#DataBase Schema
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(128), nullable=False)
    q_id = db.Column(db.String(50), nullable=False)
    q_title = db.Column(db.String(150), nullable=False)
    q_options = db.Column(db.String(150), nullable=True)

    def __init__(self, form_id, q_id, q_title, q_options):
        self.form_id = form_id
        self.q_id = q_id
        self.q_title = q_title
        self.q_options = q_options

    def __repr__(self):
        return '<Question %r>' % self.form_id   

class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String(128), nullable=False)
    q_id = db.Column(db.String(50), nullable=False)
    q_response = db.Column(db.String(200), nullable=True)

    def __init__(self, form_id, q_id, q_response):
        self.form_id = form_id
        self.q_id = q_id
        self.q_response = q_response

    def __repr__(self):
        return '<Response %r>' % self.form_id  


#make Models migration
db.create_all()  
db.session.commit()


#api for handeling build_new_form request and crearting DB entry 
@app.route("/", methods=["GET", "POST"])
def index():
    if request.form:
        data = ImmutableMultiDict(request.form)
        obj = list(data.to_dict(flat=False).keys())[0]
        req_data = json.loads(obj)

        questions_list = req_data['form_fields']
        form_id = req_data['form_title']
        
        for q in questions_list:
            #configure options
            options = ""
            if (q["q_type"] == "multiplechoice" or q["q_type"] == "dropdown"):
                options = ",".join(q["options"])
            if (q["q_type"] == "range"):
                options = str(q["min"]) + "," + str(q["max"])   

            q_id = q["q_type"] + str(q["q_id"])
            q_title = q["title"]

            #add questions of new FROM into DB 
            new_question =  Question(form_id, q_id, q_title, options)
            db.session.add(new_question)
            db.session.commit()

    return '{"status_code": "200 OK", "message": "Form table created successfully"}'



#api for sharing form_url and handleing new response
@app.route("/form/<form_title>", methods=["GET", "POST"])
def show_form(form_title):
    #post req to add new Response into DB
    if request.form:
        data = ImmutableMultiDict(request.form)
        obj = list(data.to_dict(flat=False).keys())[0]
        req_data = json.loads(obj)

        form_id = req_data['form_title']
        response_list = req_data['response']

        try:
            for r in response_list:
                #add FROM response into DB
                new_response = Response(form_id, r['q_type'], r['response'])
                db.session.add(new_response)
                db.session.commit()
            return '{"status_code": "200 OK", "message": "Response added successfully"}'

        except Exception as _:
            return '{"status_code": "500 Internal Server Error", "message": "Unexpected Error Occured"}'  


    #if get request made then return form_fields
    try:
        form_id = form_title
        field_list = Question.query.filter_by(form_id = form_id).all()

        res_data = []

        for q in field_list:
            res_data.append({"q_type": q.q_id, "q_title": q.q_title, "init_val": q.q_options, "response": ""})

        res = {"status_code": "200 OK", "message": res_data}
        if (len(res_data) > 0):
            return jsonify(res)
        else:
            return '{"status_code": "400 Bad request", "message": "No such entry found"}'  

    except Exception as _:
        return '{"status_code": "500 Internal Server Error", "message": "Unexpected Error Occured"}'  



#api for getting form_responses
@app.route("/data/<form_title>", methods=["GET"])
def get_response(form_title):

    form_id = form_title
    questions = Question.query.filter_by(form_id = form_id).all()
    q_list = []    
    res_list = []

    for q in questions:
        q_list.append(q.q_title)
        ans_list = []
        responses = Response.query.filter_by(form_id = form_id).filter_by(q_id = q.q_id).all()
        for r in responses:
            ans_list.append(r.q_response)
        res_list.append(ans_list)

    response_data = {"status_code": "200 OK", "q_list": q_list, "responses": res_list}

    return jsonify(response_data)


if __name__ == '__main__':
 app.run(debug=True)