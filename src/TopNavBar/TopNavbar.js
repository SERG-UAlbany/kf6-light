import React, { Component } from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { Col, Form, FormGroup, Input } from 'reactstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { removeToken } from '../store/api.js'
import { setViewId, setGlobalToken } from '../store/globalsReducer'
import { setCheckedNotes } from '../store/noteReducer'

class TopNavbar extends Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  logout() {
    sessionStorage.clear();
    removeToken()//remove token from api header
    setGlobalToken(null)//Remove token from store
  }

  handleChange(e) {
    /* e.persist(); */
    let target = e.target;
    let viewId = target.value;
    this.props.setViewId(viewId);
    //EMPTY CHECKEDNOTES
    this.props.setCheckedNotes([]);
    this.props.history.push(`/view/${viewId}`)
  }


  render() {
    const isLoggedIn = this.props.isAuthenticated
    const userName = this.props.user ? `${this.props.user.firstName} ${this.props.user.lastName}` : null
    const isViewUrl = this.props.location.pathname.startsWith('/view/')
    return (
      <Navbar bg="dark" variant="dark" fixed="top">
        <Navbar.Brand href="#community-manager">KF6 Light</Navbar.Brand>
        {isViewUrl ?
          (
            <Nav className="mr-auto">
              <span className="mrg-105-top white">{this.props.view ? this.props.view.title : ''}</span>
              {this.props.view ?
                <Form className="mrg-1-top">
                  <Col>
                    <FormGroup>
                      <Input type="select" name="viewId" value={this.props.view._id} onChange={this.handleChange}>
                        {
                          this.props.views.map((obj) => {
                            return <option key={obj._id} value={obj._id}> {obj.title} </option>
                          })
                        }
                      </Input>
                    </FormGroup>
                  </Col>
                </Form>
                : null}
            </Nav>
          )
          : null}

        {isLoggedIn ? (
          <>
            <Nav className="ml-auto">
              <Nav.Link href="/change-password"><i className="fas fa-cog white"></i></Nav.Link>
              <Nav.Link className="white mr-auto"> {userName} </Nav.Link>
              <Button variant="outline-secondary" className='ml-2' href="/" onClick={this.logout}>Logout</Button>
            </Nav>
          </>
        ) :
          <>
            <Nav className="ml-auto">
              <Nav.Link href="/signup">Signup</Nav.Link>
              <Nav.Link href="/">Login</Nav.Link>
            </Nav>
          </>
        }

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
    user: state.globals.user,
    views: state.globals.views,
    view: state.globals.view
  }
}
const mapDispatchToProps = {
  setViewId,
  setGlobalToken,
  setCheckedNotes
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNavbar));
