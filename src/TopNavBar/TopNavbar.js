import React, { Component } from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { Col, Form, FormGroup, Input } from 'reactstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import Axios from 'axios'

import { removeToken, apiUrl } from '../store/api.js'
import { setViewId } from '../store/globalsReducer'


class TopNavbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      token: sessionStorage.getItem("token") ? sessionStorage.getItem("token") : this.props.token,
      loggedIn: this.props.token ? true : false,
      userName: null,
      myViews: [],
      viewTitle: sessionStorage.getItem("viewTitle") ? sessionStorage.getItem("viewTitle") : 'welcome',
      communityId: this.props.communityId ? this.props.communityId : sessionStorage.getItem("communityId"),
    };
    console.log("constructor state",this.state.token);
    

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.setState({
      // token: sessionStorage.getItem("token"),
      // loggedIn: sessionStorage.getItem("token") || this.props.token ? true : false,
      // communityId: this.props.communityId,
    })
    console.log("Top navbabr", this.state.token, "isAuthenticated", this.state.loggedIn, "CommunityId", this.state.communityId);


    //SET HEADER WITH TOKEN BEARER
    let config = {
      headers: { Authorization: `Bearer ${this.state.token}` }
    };

    // GET FULL NAME
    /* HAVE A CONDITION WHEN USER IS LOGGED IN, THEN ONLY IT SHOWS THE NAME */
    
      Axios.get(`${apiUrl}/users/me`, config)
        .then(
          result => {
            this.setState({
              userName: result.data.firstName + " " + result.data.lastName,
            })

            sessionStorage.setItem("userId", result.data._id);

          }).catch(
            error => {
            });

      //GET USER'S VIEWS
      if (this.state.communityId) {
        console.log("communityId",this.state.communityId, "token",this.state.communityId, "Config", config);
        
        var viewUrl = `${apiUrl}/communities/${this.state.communityId}/views`;

        Axios.get(viewUrl, config)
          .then(
            result => {
              this.setState({
                myViews: result.data
              })
            }).catch(
              error => {
                // alert(error);
              });
      }

  }

  logout() {
    sessionStorage.clear();
    // sessionStorage.removeItem('token');
    // removeToken()
    // var n = sessionStorage.length;
    // while (n--) {
    //   var key = sessionStorage.key(n);
    //   if (/foo/.test(key)) {
    //     sessionStorage.removeItem(key);
    //   }
    // }
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

    var viewUrl = `${apiUrl}/objects/${target.value}`;

    Axios.get(viewUrl, config)
      .then(
        result => {
          console.log(result.data);

          this.setState({
            viewTitle: result.data.title,
          })

          sessionStorage.setItem("viewTitle", result.data.title);

        }).catch(
          error => {
            alert(error);
          });
  }

  handleSubmit(e) {
    e.preventDefault();

    console.log('The form was submitted with:');
    console.log(this.state);

  }

  render() {
    const isLoggedIn = this.state.token ? true : false;
    console.log("rendering loggedin", isLoggedIn);

    return (
      <Navbar bg="dark" variant="dark" fixed="top">
        <Navbar.Brand href="#community-manager">KF6 Light</Navbar.Brand>
        {isLoggedIn ?
          (
            <Nav className="mr-auto">
              <span className="mrg-105-top white">{this.state.viewTitle}</span>
              <Form onSubmit={this.handleSubmit} className="mrg-1-top">
                <Col>
                  <FormGroup>
                    {/* <Label>Select Community</Label> */}
                    <Input type="select" name="viewId" value={this.state.viewId} onChange={this.handleChange}>{
                      this.state.myViews.map((obj) => {
                        return <option key={obj._id} value={obj._id}> {obj.title} </option>
                      })
                    }</Input>
                    {/* <select value={this.state.viewId} onChange={()=>this.handleChange}>
                      {this.state.myViews.map((obj)=>{
                        return <option key={obj._id} value={obj._id}>{obj.title}</option>
                      })}
                    </select> */}
                  </FormGroup>
                </Col>
              </Form>
            </Nav>
          ) :
          (
            <Nav className="mr-auto">
              <Nav.Link href="#signup">Signup</Nav.Link>
              <Nav.Link href="/">Login</Nav.Link>
            </Nav>
          )}

        {isLoggedIn ? (
          <>
            <Nav.Link href="#change-password"><i className="fas fa-cog white"></i></Nav.Link>
            <span className="white"> {this.state.userName} </span>
            <Button variant="outline-secondary" href="/" onClick={this.logout}>Logout</Button>
          </>
        ) : null}

      </Navbar>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    token: state.globals.token,
    communityId: state.globals.communityId,
    viewId: state.globals.viewId,
    isAuthenticated: state.globals.isAuthenticated,
    location: ownProps.location,
  }
}
const mapDispatchToProps = {
  setViewId,

}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNavbar));
