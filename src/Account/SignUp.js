import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import Axios from 'axios';
import { Container, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import Recaptcha from 'react-recaptcha';
import { apiUrl } from '../store/api.js';

class SignUp extends Component {
  constructor() {
    super();

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      userName: '',
      password: '',
      registrationKey: '',
      isVerified: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
  }

  //HANDLES THE REALTIME CHANGING VALUE
  handleChange(e) {
    let target = e.target;
    let name = target.name;
    let value = target.value;

    //NAME IS ATTRIBUTE NAME AND VALUE IS ATTRIBUTE VALUE
    this.setState({
      [name]: value
    });
  }

  //HANDLE SUBMIT
  handleSubmit(e) {
    e.preventDefault();

    console.log('The form was submitted with:');
    console.log(this.state);

    Axios.post(
      `${apiUrl}/users`,
      this.state)
      .then((response) => {
        console.log(response.data.token);
        this.token = response.data.token;

        //SET TOKEN
        sessionStorage.setItem('token', this.token);
        //NAVIGATE TO COMMUNITY MANAGER TEMP
        this.props.history.push('/community-manager')
      })
      .catch((error) => {
        if (error.message) {
          console.log(error.message);
          alert("Enter Valid Username and Password");
        }
      });
  }

  verifyCallback() {
    this.setState({
      isVerified: true,
    });

  }

  callback() {
    console.log("Callback");
  }

  render() {
    const siteKey = "6LfcR60ZAAAAALR4zc7tMUf8g_et0e1LIVM8oEv_";
    const copySecretKey = "6LfcR60ZAAAAAAivWWevSsTC-Lv2-m8E8Vm9uw0x";
    const recaptcha = <Recaptcha
      sitekey={siteKey}
      render="explicit"
      verifyCallback={this.verifyCallback}
    />
    return (
      <Container>
        <div className="mrg-4-top">
          <Col>
            <h3>SignUp</h3>
          </Col>
          <Form onSubmit={this.handleSubmit} class="form">
            <Col>
              <FormGroup>
                <Label htmlFor="firstName">First Name</Label>
                <Input type="text" id="firstName" placeholder="Enter First Name" name="firstName" value={this.state.firstName} onChange={this.handleChange} />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label htmlFor="lastName">Last Name</Label>
                <Input type="text" id="lastName" placeholder="Enter Last Name" name="lastName" value={this.state.lastName} onChange={this.handleChange} />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Enter Email" name="email" value={this.state.email} onChange={this.handleChange} />
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
            <Col className="mrg-2-top mrg-105-bot">
                {recaptcha}
            </Col>
            <Col>
              <Button className="" disabled={!this.state.isVerified}>New Account</Button>
            </Col>
            <Col className="mrg-1-top">
              <Link to="/" className="FormField__Link">If you already have an account, please Signin</Link>
            </Col>
          </Form>
        </div>
      </Container>
    );
  }
}

export default SignUp;