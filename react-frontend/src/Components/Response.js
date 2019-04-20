import React, { Component } from 'react';


const styles = {
    titleBox: {
        width: '100%',
        height: "100px",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '2px solid violet'
    }
};

class Response extends Component {
    constructor(props) {
        super(props);
        this.state = {is_loading: true, question_list: [], response_list: [], invalid_url: false};
    }

    componentDidMount() {
        this.fetchResponse();
    }

    fetchResponse() {
        let { table_name } = this.props.match.params;
        let url = 'http://localhost:5000/data/' + table_name.trim();
        fetch(url)
        .then(response => response.json())
        .then(response => {
            if (response.status_code == "200 OK") {
                this.setState({is_loading: false, question_list: response.q_list, response_list: response.responses});
            } else {
                this.setState({is_loading: false, invalid_url: true});
            }
        })
        .catch(err => {
            console.log(err.message);
        });


    }

    render() {
        let { table_name } = this.props.match.params;
        table_name = table_name.split("_");
        table_name.pop();
        table_name = table_name.join(" ").toUpperCase();
        if (this.state.is_loading) {
            return (
                <div className="container">
                    <p>Loading Form {table_name}...</p>
                </div>
            );
        }
        else if (this.state.invalid_url) {
            return (
                <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <h3>Invalid Form details. No response found.</h3>
                </div>
            );
        }
        return (
            <div className="container">
                {/* Form title */}
                <div style={styles.titleBox}>
                        <h1>{table_name}</h1>
                </div>

                {/* Response table */}
                <div className="container">
                    <table className="table table-striped">
                        <thead className="thead-dark">
                            <tr>
                                {this.state.question_list.map((item, i) => {
                                    if (i != 0) {
                                        return (
                                            <th scope="col">
                                                {item}
                                            </th>
                                        );
                                    }
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.response_list.map((item, i) => {
                                return (
                                    <tr>
                                        {item.map((res, i) => {
                                            if (i != 0) {
                                                return (
                                                    <td>
                                                        {res}
                                                    </td>
                                                );
                                            }
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default Response;