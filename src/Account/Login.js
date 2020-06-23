import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import {Container, Col, Form, FormGroup, Label, Input, Button} from 'reactstrap';
import {url, setToken} from '../store/api.js'

class Login extends Component {
    constructor() {
        super();

        this.state = {
            userName: '',
            password: ''
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

    handleSubmit(e) {
        e.preventDefault();

        console.log('The form was submitted with:');
        console.log(this.state);

        //LOGIN RETURNS TOKEN
        Axios.post(
            `${url}/auth/local`,
            this.state)
            .then((response)=>{
                console.log(response.data.token);
                this.token= response.data.token;

                //SET TOKEN
                sessionStorage.setItem('token',this.token);
                setToken(this.token)
                //NAVIGATE TO COMMUNITY MANAGER
                this.props.history.push("/community-manager");
            })
            .catch((error)=>{
                if(error.message){
                    console.log(error);
                    alert("Please enter Valid username and password");
                }
            }

            );
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

export default Login;
