import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Axios from 'axios';
import { Container, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import Recaptcha from 'react-recaptcha';
import { apiUrl, setToken, setServer } from '../store/api.js';
import { setGlobalToken, fetchLoggedUser } from '../store/globalsReducer'

class SignUp extends Component {
  constructor() {
    super();

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      userName: '',
      password: '',
      // registrationKey: '', //For users who can't use Google ReCaptcha
      isVerified: false,
      registrationKey: '',
      server: localStorage.getItem("server") ? localStorage.getItem("server") : "kf6.ikit.org",
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

    this.setState({
      [name]: value
    });
  }

  //HANDLE SUBMIT
  handleSubmit = async (e) => {
    e.preventDefault();
    let signUpObj = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      userName: this.state.userName,
      password: this.state.password,
      isVerified: false,
    }

    if (this.state.server === "https://kf.rdc.nie.edu.sg" || this.state.server === "https://kf6-stage.rit.albany.edu") {
      signUpObj = { ...signUpObj, registrationKey: this.state.registrationKey }
    }

    let result = await setServer(this.state.server);
    if (result) {
      //POST NEW USER
      Axios.post(
        `${apiUrl}/users`,
        signUpObj)
        .then((response) => {
          console.log(response.data.token);
          let token = response.data.token;

          //SET TOKEN
          sessionStorage.setItem('token', token);
          this.props.setGlobalToken(token);
          setToken(token); //set token on api header

          //FETCH LOGED USER
          this.props.fetchLoggedUser()

          //NAVIGATE TO COMMUNITY MANAGER
          this.props.history.push('/community-manager')
        })
        .catch((error) => {
          if (error.message) {
            alert("Enter Valid Username and Password", error);
          }
        });

    }


  }

  //RECAPTCHA CALLBACK
  verifyCallback() {
    this.setState({
      isVerified: true,
    });

  }

  callback() {
    // console.log("Callback");
  }

  render() {
    const siteKey = "6LfcR60ZAAAAALR4zc7tMUf8g_et0e1LIVM8oEv_";
    // RECAPTCHA
    let registrationCheckPoint = <>
      <Col className="mrg-2-top mrg-105-bot">
        <Recaptcha
          sitekey={siteKey}
          render="explicit"
          verifyCallback={this.verifyCallback}
        />
      </Col>
      <Col>
        <Button className="" disabled={!this.state.isVerified}>New Account</Button>
      </Col>
    </>
    // REGISTRATION KEY
    if (this.state.server === "https://kf.rdc.nie.edu.sg" || this.state.server === "https://kf6-stage.rit.albany.edu") {
      registrationCheckPoint =
        <>
          <Col className="mrg-2-top mrg-105-bot">
            <FormGroup>
              <Label htmlFor="registrationKey">Registration Key</Label>
              <Input type="password" id="registrationKey" placeholder="Enter Registration Key" name="registrationKey" value={this.state.registrationKey} onChange={this.handleChange} />
            </FormGroup>
          </Col>
          <Col>
            <Button className="" disabled={this.state.registrationKey === ''}>New Account</Button>
          </Col>
        </>
    }
    return (
      <Container>
        <div className="mrg-4-top">
          <Col>
            <h3>SignUp</h3>
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
            {registrationCheckPoint}
            <Col className="mrg-1-top">
              <Link to="/" className="FormField__Link">If you already have an account, please Signin</Link>
            </Col>
          </Form>
        </div>
      </Container >
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    servers: state.globals.servers,
  }
}

const mapDispatchToProps = {
  setGlobalToken,
  fetchLoggedUser,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp);
