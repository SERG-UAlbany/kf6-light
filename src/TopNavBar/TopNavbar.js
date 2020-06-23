import React, { Component } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import {Col, Form, FormGroup, Input} from 'reactstrap';
import { removeToken } from '../store/api.js'
import Axios from 'axios';
import {apiUrl} from '../store/api.js';

class TopNavbar extends Component {

  constructor() {
    super();

    this.state={
        loggedIn: sessionStorage.getItem('token') ? true: false,
        userName: null,
        token : sessionStorage.getItem('token'),
        myViews : [],
        viewId : sessionStorage.getItem('viewId'),
        viewTitle : sessionStorage.getItem("viewTitle")? sessionStorage.getItem("viewTitle") :'welcome',
        communityId : sessionStorage.getItem('communityId'),
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount(){

    //SET HEADER WITH TOKEN BEARER
    var config = {
      headers: { Authorization: `Bearer ${this.state.token}` }
    };

    // GET FULL NAME
    Axios.get(`${apiUrl}/users/me`, config)
            .then(
                result=>{
                    this.setState({
                        userName: result.data.firstName+ " "+ result.data.lastName,
                     })
                     
                     sessionStorage.setItem("userId", result.data._id);

                    }).catch(
                    error=>{
                    });
    
    //GET USER'S VIEWS
    if(this.state.communityId){
      var viewUrl= `${apiUrl}/communities/${this.state.communityId}/views`;
      
      Axios.get(viewUrl, config)
      .then(
          result=>{
            this.setState({
              myViews: result.data
            })
          }).catch(
              error=>{
                  // alert(error);
              });
    }
    
  }

    logout(){
        sessionStorage.removeItem('token');
        removeToken()
        var n = sessionStorage.length;
        while(n--) {
          var key = sessionStorage.key(n);
          if(/foo/.test(key)) {
      sessionStorage.removeItem(key);
  }  
}
    }

    handleChange(e) {
      e.persist();
      let target = e.target;
      let value = target.value;

      sessionStorage.setItem("viewId", value);
      
      this.setState({
        viewId: value,
      });

      var config = {
        headers: { Authorization: `Bearer ${this.state.token}` }
      };

      var viewUrl= `${apiUrl}/objects/${target.value}`;

      Axios.get(viewUrl, config)
        .then(
          result=>{
            console.log(result.data);
            
               this.setState({
                   viewTitle: result.data.title,
                })
                
                sessionStorage.setItem("viewTitle", result.data.title);
              
          }).catch(
              error=>{
                  alert(error);
              });      
  }

    handleSubmit(e) {
      e.preventDefault();
      
      console.log('The form was submitted with:');
      console.log(this.state);
    
    }

    render() {
        return (
            <Navbar bg="dark" variant="dark" fixed="top">
            <Navbar.Brand href="#community-manager">KF6 Light</Navbar.Brand>
            {this.state.loggedIn ? 
            (
              <Nav className="mr-auto">
              <span className="mrg-105-top white">{this.state.viewTitle}</span>
              <Form onSubmit={this.handleSubmit} className="mrg-1-top">
                    <Col>
                    <FormGroup>
                    {/* <Label>Select Community</Label> */}
                        <Input type="select" name="viewId" value={this.state.viewId} onChange={this.handleChange}>{
                            this.state.myViews.map((obj) => {
                                return <option key={obj.title} value={obj._id}> {obj.title} </option>
                            })
                        }</Input>
                    </FormGroup>
                    </Col>
                </Form>
            </Nav>
            ):
            (
              <Nav className="mr-auto">
              <Nav.Link href="#signup">Signup</Nav.Link>
              <Nav.Link href="/">Login</Nav.Link>
            </Nav>
            )}
            
            {this.state.loggedIn ? (
              <>
                <Nav.Link href="#change-password"><i className="fas fa-cog white"></i></Nav.Link>
                <span className="white"> {this.state.userName} </span>                
                <Button variant="outline-secondary" href="/" onClick={this.logout}>Logout</Button>
              </>
            ):null}

            </Navbar>
        );
    }
}

export default TopNavbar;
