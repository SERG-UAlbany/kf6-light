import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Axios from 'axios'
import { Container, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap'

import { url, setToken, setServer } from '../store/api'
import { setGlobalToken, fetchLoggedUser } from '../store/globalsReducer'
import {WebSocketContext} from '../WebSocket.js'

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: '',
            password: '',
            server: localStorage.getItem("server") ? localStorage.getItem("server") : "kf6.ikit.org",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        let target = e.target;
        let name = target.name;
        let value = target.value;

        this.setState({
            [name]: value
        });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        let token = '';
        let loginObj = {};
        loginObj.userName = this.state.userName;
        loginObj.password = this.state.password;

        //SET SERVER IN API
        let result = await setServer(this.state.server);
        if (result) {
            Axios.post(`${url}/auth/local`, loginObj)
                .then((response) => {
                    token = response.data.token;

                    //SET TOKEN
                    sessionStorage.setItem('token', token);
                    this.props.setGlobalToken(token);
                    setToken(token); //set token on api header

                    this.props.fetchLoggedUser()

                    this.context.openConnection();
                    //NAVIGATE TO COMMUNITY MANAGER
                    this.props.history.push("/community-manager");
                })
                .catch((error) => {
                    if (error.message) {
                        alert("Please enter Valid username and password");
                    }
                }

                );
        }


    }

    render() {
        return (
            <Container>
                <div className="mrg-4-top">
                    <Col>
                        <h3>Login</h3>
                    </Col>
                    <Form onSubmit={this.handleSubmit} className="form">
                        <Col>
                            <FormGroup>
                                <Label>Server</Label>
                                <Input type="select" id="server" name="server" value={this.state.server} onChange={this.handleChange} >
                                    {this.props.servers.map((server) => {
                                        return <option key={server.key} value={server.value}>{server.key}</option>
                                    })}

                                </Input>
                            </FormGroup>
                        </Col>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="userName">Username</Label>
                                <Input type="text" id="userName" placeholder="Enter Username" name="userName" value={this.state.userName} onChange={this.handleChange} />
                            </FormGroup>
                        </Col>
                        <Col>
                            <FormGroup>
                                <Label htmlFor="password">Password</Label>
                                <Input type="password" id="password" placeholder="Enter Password" name="password" value={this.state.password} onChange={this.handleChange} />
                            </FormGroup>
                        </Col>
                        <Col className="mrg-1-top">
                            <Button>Login</Button>
                        </Col>
                        <Col className="mrg-1-top">
                            <Link to="/signup">If you don't have an account, please SignUp</Link>
                        </Col>
                    </Form>
                </div>
            </Container>
        );
    }
}
Login.contextType = WebSocketContext;

const mapStateToProps = (state, ownProps) => {
    return {
        token: state.globals.token,
        servers: state.globals.servers,
    }
}

const mapDispatchToProps = {
    setGlobalToken,
    fetchLoggedUser
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login);
