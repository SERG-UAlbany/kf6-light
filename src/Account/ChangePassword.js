import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import {Container, Col, Form, FormGroup, Label, Input, Button} from 'reactstrap';
import {apiUrl} from '../store/api.js';

class ChangePassword extends Component {
    token= sessionStorage.getItem("token");
    constructor() {
        super();

        this.state = {
            oldPassword: '',
            newPassword: ''
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

        var config = {
            headers: { Authorization: `Bearer ${this.token}` }
        };

        var changePasswdUrl= `${apiUrl}/users/${sessionStorage.getItem("userId")}/password`;

        //LOGIN RETURNS TOKEN
        Axios.put(changePasswdUrl,this.state,config)
        .then(
            result=>{
                alert("Password is Successfully changed");
            }).catch(
            error=>{
                alert(error);
            })
    }

    render() {
        return (
            <Container>
            <div className="mrg-8-top">
                <Col>
                    <h3>Change Password</h3>
                </Col>
                <Form onSubmit={this.handleSubmit} className="form">
                <Col>
                <FormGroup>
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <Input type="password" id="oldPassword" placeholder="Enter Current Password" name="oldPassword" value={this.state.oldPassword} onChange={this.handleChange} />
                </FormGroup>
                </Col>
                <Col>
                <FormGroup>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input type="password" id="password" placeholder="Enter New Password" name="newPassword" value={this.state.newPassword} onChange={this.handleChange} />
                </FormGroup>
                </Col>
                <Col className="mrg-1-top">
                    <Button>Save</Button>
                </Col>
                </Form>
            </div>    
          </Container>
        );
    }
}

export default ChangePassword;