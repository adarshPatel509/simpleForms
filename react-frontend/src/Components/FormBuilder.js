import React, { Component,  } from 'react';

const styles = {
    titleBox: {
        width: '100%',
        height: "150px",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleInput: {
        borderWidth: '0px',
        borderBottom: '2px solid',
        fontSize: "25px",
        textAlign: "center",
        width: "350px",
        height: "60px",
        fontWeight: 'bold'
    },
    addFieldsBox: {
        position: "absolute",
        top: "50px",
        right: "1vw",
        display: "flex",
        flexDirection: 'column',
        height: '200px',
        alignItems: 'center',
        zIndex: '1000',
        padding: "20px",
    },
    addIcon: {
        fontSize: "50px",
        color: '#8f0ab7',
        cursor: "pointer",
    },
    questionBox: {
        width: '90%',
        height: "150px",
        display: "flex",
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: "3px solid #4295f4"
    },
    question: {
        borderWidth: '0px',
        borderBottom: '1px solid',
        width: '50vw',
        fontWeight: '500'
    },
    textArea: {
        border: '1px solid',
        width: '50vw'
    },
    multipleChoiceBox: {
        width: '90%',
        height: "250px",
        display: "flex",
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: "3px solid #4295f4"
    },
    option: {
        borderWidth: '0px',
        borderBottom: '1px solid',
        width: '20vw',
    }
} 

var allQuestionsList = [];

// Form fields data format
// [{"q_type": 'shortanswer', "title": "What date would u prefer for treart?"}, 
// {"q_type": 'paragraph', "title": "Give proper reason for any other date?"},
// {"q_type": 'checkbox', "title": "Are u coming?"},
// {"q_type": 'multiplechoice', "title": "Cities that u would like to visit?", "options": ["", "", "", ""]},
// {"q_type": 'dropdown', "title": "Select one from the dropdown?", "options": ["", "", "", ""]},
// {"q_type": 'range', "title": "Rate us between 1 to 100?", "min": 0, "max": 100}]

class FormBuilder extends Component {
    constructor(props) {
        super(props);
        this.state = {title: '', add_field: '', pop_fields_box: 'none', question_list: []};

        this.handleTitle = this.handleTitle.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.popFiledsBox = this.popFiledsBox.bind(this);
        this.addNewField = this.addNewField.bind(this);
        this.createForm = this.createForm.bind(this);
    }

    handleTitle(event) {
        this.setState({title: event.target.value});
    }

    popFiledsBox() {
        this.setState({pop_fields_box: "block"});
    }

    handleSelect(event) {
        this.setState({add_field: event.target.value});
        console.log(event.target.value);
    }

    addNewField() {
        let qid = Math.ceil(Math.random()*987)+ Math.floor(123*Math.random()) + Math.ceil(456*Math.random());

        if (this.state.add_field === "paragraph") {
            this.setState({
                question_list: [...this.state.question_list, {"q_type": "paragraph", "q_id": qid}],
                pop_fields_box: "none"
            });
            allQuestionsList.push({"q_type": "paragraph", "q_id": qid, "title": ""});
        }
        else if (this.state.add_field === "multiplechoice") {
            this.setState({
                question_list: [...this.state.question_list, {"q_type": "multiplechoice", "q_id": qid}],
                pop_fields_box: "none"
            });
            allQuestionsList.push({"q_type": "multiplechoice", "q_id": qid, "title": "", "options": ["", "", "", ""]});
        }
        else if (this.state.add_field === "checkbox") {
            this.setState({
                question_list: [...this.state.question_list, {"q_type": "checkbox", "q_id": qid}],
                pop_fields_box: "none"
            });
            allQuestionsList.push({"q_type": "checkbox", "q_id": qid, "title": ""});
        }
        else if (this.state.add_field === "dropdown") {
            this.setState({
                question_list: [...this.state.question_list, {"q_type": "dropdown", "q_id": qid}],
                pop_fields_box: "none"
            });
            allQuestionsList.push({"q_type": "dropdown", "q_id": qid, "title": "", "options": ["", "", "", ""]});
        }
        else if (this.state.add_field === "range") {
            this.setState({
                question_list: [...this.state.question_list, {"q_type": "range", "q_id": qid}],
                pop_fields_box: "none"
            });
            allQuestionsList.push({"q_type": "range", "q_id": qid, "title": "", "min": "", "max": ""});
        }
        else {
            this.setState({
                question_list: [...this.state.question_list, {"q_type": "shortanswer", "q_id": qid}],
                pop_fields_box: "none"
            });
            allQuestionsList.push({"q_type": "shortanswer", "q_id": qid, "title": ""});
        }
    }

    createForm() {
        console.log(allQuestionsList);
        let title = this.state.title.trim();

        //remove special characters from title
        while (title.slice(-1).toLowerCase() == title.slice(-1).toUpperCase()) {
            title = title.slice(0,-1);
        }
        title = title.split(" ").join("_").toLowerCase();
        let id = Math.ceil(Math.random()*987)+ Math.floor(123*Math.random()) + Math.ceil(456*Math.random());
        title = title + "_" + String(id);
        
        let requestBody = {
            "form_title": title,
            "form_fields": allQuestionsList
        };
        fetch("http://localhost:5000", {
            method: "post",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(response => {
            console.log(response);
            let redirect_url = "/form/" + title;
            this.props.history.push(redirect_url);  //redirect to created from_url
        })
        .catch(error => {
            console.log(error.message);
        });
    }

   

    render() {
        console.log(allQuestionsList);
        return (
           <div className="container">

               {/* form title */}
               <div style={styles.titleBox}>
                    <input style={styles.titleInput} type="text" value={this.state.title} placeholder="Untitled Form" onChange={this.handleTitle} id="title" />
               </div>

               {/* add from fields floating box */}
               <div style={styles.addFieldsBox}>
                    <h3>Add New Field</h3>
                    <i onClick={this.popFiledsBox} style={styles.addIcon} className="fa fa-plus-circle faa-tada animated-hover" aria-hidden="true"></i>
                    <div id="formFieldBox" style={{marginTop: '20px', display: `${this.state.pop_fields_box}`}}>
                        <select value={this.state.value} onChange={this.handleSelect}>
                            <option value="shortanswer">Short Answer</option>
                            <option value="paragraph">Paragraph</option>
                            <option value="multiplechoice">Multiple Choice</option>
                            <option value="checkbox">CheckBoxes</option>
                            <option value="dropdown">DropDown</option>
                            <option value="range">Range</option>
                        </select>
                        <br/>
                        <button onClick={(e) => this.addNewField(e)} style={{width: '80px', height: '30px', color: 'aqua', backgroundColor: 'black', borderRadius: '5px', fontSize: '18px', marginTop: '5px'}}>Add</button>
                    </div>
               </div>

                
                {/* Render all questions */}
                <div className="container" style={{marginBottom: '5px'}}>
                    {this.state.question_list.map((item, i) => {
                        if (item.q_type === "shortanswer") {
                            return <ShortAnswer qid={item.q_id} key={item.q_id} />;
                        } 
                        else if (item.q_type === "paragraph") {
                            console.log("Entered");
                            return <Paragraph qid={item.q_id} key={item.q_id} />;
                        }
                        else if (item.q_type === "checkbox") {
                            return <CheckBox qid={item.q_id} key={item.q_id} />;
                        }
                        else if (item.q_type === "multiplechoice") {
                            return <MultipleChoice qid={item.q_id} key={item.q_id} />;
                        }
                        else if (item.q_type === "dropdown") {
                            return <DropDown qid={item.q_id} key={item.q_id} />;
                        }
                        else if (item.q_type === "range") {
                            return <Range qid={item.q_id} key={item.q_id} />;
                        }
                    })}
                </div> 

                {/* Crete Form button */}
                {this.state.question_list.length >= 1 && 
                    <div className="container">
                        <button onClick={(e) => this.createForm(e)} style={{width: '120px', height: '30px', color: 'aqua', backgroundColor: 'black', borderRadius: '5px', fontSize: '18px', marginTop: '10px', marginBottom: '10px'}}>CreateForm</button>
                    </div>
                }

           </div>
        );
    }
}


class ShortAnswer extends Component {
    constructor(props) {
        super(props);
        let qid = this.props.qid;
        let obj = allQuestionsList.find(o => o.q_id == qid);
        this.state = {"title": obj.title};

        this.handleTitle = this.handleTitle.bind(this);
    }

    handleTitle(event) {
        this.setState({title: event.target.value});
        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].title = event.target.value;
    }

    render() {
        return (
            <div className="card" style={styles.questionBox}>
                <label>
                    <input style={styles.question} placeholder="Question" onChange={this.handleTitle} value={this.state.title} />
                </label>
                <br/>
                <label>
                    <input disabled style={styles.question} placeholder="Short Answer Text" />
                </label>
            </div>
        );
    }
}

class Paragraph extends Component {
    constructor(props) {
        super(props);
        let qid = this.props.qid;
        let obj = allQuestionsList.find(o => o.q_id == qid);
        this.state = {"title": obj.title};
        
        this.handleTitle = this.handleTitle.bind(this);
    }

    handleTitle(event) {
        this.setState({title: event.target.value});
        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].title = event.target.value;
    }

    render() {
        return (
            <div className="card" style={styles.questionBox}>
                <label>
                    <input style={styles.question} placeholder="Question" onChange={this.handleTitle} value={this.state.title} />
                </label>
                <br/>
                <label>
                    <textarea disabled style={styles.textArea} placeholder="Long Answer Text" />
                </label>
            </div>
        );
    }
}

class MultipleChoice extends Component {
    constructor(props) {
        super(props);
        let qid = this.props.qid;
        let obj = allQuestionsList.find(o => o.q_id == qid);
        this.state = {"title": obj.title, "options": obj.options};

        this.handleTitle = this.handleTitle.bind(this);
    }

    handleTitle(event) {
        this.setState({title: event.target.value});

        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].title = event.target.value;
    }

    optionValue(event, i) {
        let value = event.target.value;
        let options = this.state.options;
        options[i] = value;
        this.setState({options: options});

        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].options = options;
    }

    render() {
        return (
            <div className="card" style={styles.multipleChoiceBox}>
                <label>
                    <input style={styles.question} placeholder="Question" onChange={this.handleTitle} value={this.state.title} />
                </label>
                 {this.state.options.map((option, i) => {
                     return <input key={i + 1} style={styles.option} onChange={(e) => this.optionValue(e, i)} placeholder={"Choice " + (i+1)} value={option} />;
                 })}
            </div>
        );
    }
}

class CheckBox extends Component {
    constructor(props) {
        super(props);
        let qid = this.props.qid;
        let obj = allQuestionsList.find(o => o.q_id == qid);
        this.state = {"title": obj.title};
        
        this.handleTitle = this.handleTitle.bind(this);
    }

    handleTitle(event) {
        this.setState({title: event.target.value});
        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].title = event.target.value;
    }

    render() {
        return (
            <div className="card" style={styles.questionBox}>
                <label>
                    <input style={styles.question} placeholder="Question" onChange={this.handleTitle} value={this.state.title} />
                </label>
                <label>
                    CheckBox 
                    <input style={{fontSize: '20px'}} disabled type="checkbox" />
                </label>
                
            </div>
        );
    }
}

class DropDown extends Component {
    constructor(props) {
        super(props);
        let qid = this.props.qid;
        let obj = allQuestionsList.find(o => o.q_id == qid);
        this.state = {"title": obj.title, "options": obj.options};

        this.handleTitle = this.handleTitle.bind(this);
    }

    handleTitle(event) {
        this.setState({title: event.target.value});

        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].title = event.target.value;
    }

    optionValue(event, i) {
        let value = event.target.value;
        let options = this.state.options;
        options[i] = value;
        this.setState({options: options});

        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].options = options;
    }

    render() {
        return (
            <div className="card" style={styles.multipleChoiceBox}>
                <label>
                    <input style={styles.question} placeholder="Question" onChange={this.handleTitle} value={this.state.title} />
                </label>
                 {this.state.options.map((option, i) => {
                     return <input key={i + 1} style={styles.option} onChange={(e) => this.optionValue(e, i)} placeholder={"Option " + (i+1)} value={option} />;
                 })}
            </div>
        );
    }
}

class Range extends Component {
    constructor(props) {
        super(props);

        let qid = this.props.qid;
        let obj = allQuestionsList.find(o => o.q_id == qid);
        this.state = {"title": obj.title, "min": obj.min, "max": obj.max};

        this.handleTitle = this.handleTitle.bind(this);
        this.handleMin = this.handleMin.bind(this);
        this.handleMax = this.handleMax.bind(this);
    }

    handleTitle(event) {
        this.setState({title: event.target.value});
        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].title = event.target.value;
    }

    handleMin(event) {
        this.setState({min: event.target.value});
        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].min = event.target.value;
    }

    handleMax(event) {
        this.setState({max: event.target.value});
        let index = allQuestionsList.findIndex(obj => obj.q_id == this.props.qid);
        allQuestionsList[index].max = event.target.value;
    }

    render() {
        return (
            <div className="card" style={styles.questionBox}>
                <label>
                    <input style={styles.question} placeholder="Question" onChange={this.handleTitle} value={this.state.title} />
                </label>
                    <input style={styles.option} placeholder="Minimun eg:0" onChange={this.handleMin} value={this.state.min} />
                    <input style={styles.option} placeholder="Maximum eg:10" onChange={this.handleMax} value={this.state.max} />
            </div>
        );
    }
}


export default FormBuilder;