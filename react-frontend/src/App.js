import React, { Component } from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import FormBuilder from './Components/FormBuilder';
import Response from './Components/Response';
import Form from './Components/Form';

class App extends Component {
  render() {
    return (
      <Router>
         <div>
           <Route exact path="/" component={FormBuilder} />
           <Route exact path="/createform" component={FormBuilder} />
           <Route exact path="/form/:form_title" component={Form} />
           <Route exact path="/data/:table_name" component={Response} />
         </div>
      </Router>
    );
  }
}

export default App;
