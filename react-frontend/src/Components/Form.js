import React, { Component } from 'react';

const styles = {
    titleBox: {
        width: '100%',
        height: "100px",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '2px solid violet'
    },
    questionBox: {
        width: '80%',
        height: "100px",
        display: "flex",
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'left',
    },
    question: {
        fontSize: '20px',
        fontWeight: '500',
    },
    textArea: {
        border: '1px solid',
        width: '50vw'
    },
}

var newResponse = [];

class Form extends Component {
    constructor(props) {
        super(props);
        this.state ={is_loading: true, question_list: [], invalid_url: false};

        this.submitForm = this.submitForm.bind(this);
    }

    componentDidMount() {
        this.fetchForm();
    }

    fetchForm() {
        let { form_title } = this.props.match.params;
        let url = 'http://localhost:5000/form/' + form_title;

        fetch(url)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            if (response.status_code == "200 OK") {
                newResponse = response.message;
                this.setState({is_loading: false, question_list: response.message});
            } else {
                this.setState({invalid_url: true, is_loading: false});
            }
        })
        .catch(err => {
            console.log(err.message);
        });
    }

    submitForm() {
        let { form_title } = this.props.match.params;
        
        for (let i=0; i< newResponse.length; i++) {
            let value = document.getElementById(newResponse[i].q_type).value;
            newResponse[i].response = value;
        }

        console.log(newResponse);
        let requestBody = {
            "form_title": form_title,
            "response": newResponse
        };
        let url = "http://localhost:5000/form/" + form_title;
        fetch(url, {
            method: "post",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(response => {
            if (response.status_code == "200 OK") {
                alert(response.message);
                for (let i=0; i< newResponse.length; i++) {
                    document.getElementById(newResponse[i].q_type).value = "";
                    newResponse[i].response = "";
                }
                alert("Create another Response");
            }
        })
        .catch(error => {
            console.log(error.message);
        });
    }

    render() {
        let { form_title } = this.props.match.params;
         form_title = form_title.split("_");
         form_title.pop();
         form_title = form_title.join(" ").toUpperCase();
        if (this.state.is_loading) {
            return (
                <div className="container">
                    <p>Loading Form {form_title}...</p>
                </div>
            );
        }
        else if (this.state.invalid_url) {
            return (
                <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <h3>Invalid Form details. No such form found.</h3>
                </div>
            );
        }
        console.log(newResponse);
        return (
            <div className="container">
               {/* Form title */}
                <div style={styles.titleBox}>
                    <h1>{form_title}</h1>
                </div>

                {/* Render form fields */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    {this.state.question_list.map((item, i) => {
                        if (item.q_type.includes("short")) {
                            return (
                                <div key={item.q_type} style={styles.questionBox}>
                                    <p style={styles.question}>
                                        {item.q_title}
                                    </p>
                                    <input id={item.q_type} placeholder="Short Answer Text" />
                                </div>
                            );
                        }
                        else if (item.q_type.includes("paragraph")) {
                            return (
                                <div key={item.q_type} style={styles.questionBox}>
                                    <p style={styles.question}>
                                        {item.q_title}
                                    </p>
                                    <textarea id={item.q_type} placeholder="Long Answer Text" />
                                </div>
                            );
                        }
                        else if (item.q_type.includes("dropdown")) {
                            let options = item.init_val.split(",")
                            return (
                                <div key={item.q_type} style={styles.questionBox}>
                                    <p style={styles.question}>
                                        {item.q_title}
                                    </p>
                                    <select id={item.q_type}>
                                        {options.map((item, i) => {
                                            return (
                                                <option key={item} value={item}>{item}</option>
                                            );
                                        })}
                                    </select>

                                </div>
                            );
                        }
                        else if (item.q_type.includes("multiplechoice")) {
                            let options = item.init_val.split(",")
                            return (
                                <div key={item.q_type} style={styles.questionBox}>
                                    <p style={styles.question}>
                                        {item.q_title}
                                    </p>
                                    <select id={item.q_type} multiple>
                                        {options.map((item, i) => {
                                            return (
                                                <option key={item} value={item}>{item}</option>
                                            );
                                        })}
                                    </select>

                                </div>
                            );
                        }
                        else if (item.q_type.includes("checkbox")) {
                            return (
                                <div key={item.q_type} style={styles.questionBox}>
                                    <p style={styles.question}>
                                        {item.q_title}
                                    </p>
                                    <input id={item.q_type} type='checkbox' />
                                </div>
                            );
                        }
                        else if (item.q_type.includes("range")) {
                            let option = item.init_val.split(",")
                            let min = String(parseInt(option[0]))
                            let max = String(parseInt(option[1]))
                            return (
                                <div key={item.q_type} style={styles.questionBox}>
                                    <p style={styles.question}>
                                        {item.q_title}
                                    </p>
                                    <input id={item.q_type} type="range" min={min} max={max} />
                                </div>
                            );
                        }
                    })}


                    {/* Submit Form button */}
                    {this.state.question_list.length >= 1 && 
                        <div style={{width: '80%', float: 'left'}}>
                            <button onClick={(e) => this.submitForm(e)} style={{width: '120px', height: '30px', color: 'aqua', backgroundColor: 'black', borderRadius: '5px', fontSize: '18px', marginTop: '10px', marginBottom: '10px'}}>Submit</button>
                        </div>
                    }
                </div>
            </div>
        )
        
    }
}

export default Form;