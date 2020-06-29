import React, { Component } from 'react';
import Axios from 'axios';
import { Container, Col, Row, Form, FormGroup, Label, Input } from 'reactstrap';
import { Button } from 'react-bootstrap';
import { apiUrl } from '../store/api.js'
import { connect } from 'react-redux'
import { setCommunityId, setViewId } from '../store/globalsReducer.js'

class CommunityManager extends Component {

    constructor(props) {
        super(props);

        this.state = {
            communitites: [],
            password: '',
            communityId: '',
            welcomeId: '',
            userId: sessionStorage.getItem("userId"),
            token: sessionStorage.getItem("token"),
            registrations: [],
            success: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;

        this.setState({
            [name]: value
        });
        console.log("state",this.state);
        
    }

    handleSubmit(e) {
        e.preventDefault();
        // console.log(this.props.viewId);
        // console.log(this.props.viewId);

        //REGISTER NEW COMMUNITY TO AUTHOR
        let registerUrl = `${apiUrl}/authors`;
        let data = { "communityId": this.state.communityId, "registrationKey": this.state.password, "userId": this.state.userId };
        let config = {
            headers: { Authorization: `Bearer ${this.state.token}` }
        };

        Axios.post(registerUrl, data, config)
            .then(
                result => {
                    this.setState({
                        success: true,
                    });
                }).catch(
                    error => {
                        alert("Please try again!");
                    })

    }

    componentDidMount() {
        //GET LIST OF ALL COMMUNITIES
        Axios.get(`${apiUrl}/communities`)
            .then(
                result => {
                    let communityData = result.data;
                    this.setState({
                        communitites: communityData,
                    })
                    if(communityData[0]){
                        this.setState({
                            communityId : communityData[0]._id,
                        })
                        this.props.setCommunityId(communityData[0]._id);
                        
                    }
                }).catch(
                    error => {
                        alert("Communities Failed, Please reload the page! ");
                    }
                );

        //GET USER'S REGISTERED COMMUNITIES
        Axios.get(`${apiUrl}/users/myRegistrations`, this.config)
            .then(
                result => {
                    let userRegistrations = result.data;
                    this.setState({
                        registrations: userRegistrations,
                    })
                }).catch(
                    error => {
                        alert("User Registrations Failed, Please reload the page!");
                    }
                );
    }

    enterCommunity(myCommunity) {
        let id = myCommunity.obj.communityId;
        sessionStorage.setItem('communityId', myCommunity.obj.communityId)
        // SET GLOBAL COMMUNITYID
        this.props.setCommunityId(id)
        let myState = {
            communityId: id,
            welcomeId: ''
        }

        //SET HEADER WITH TOKEN BEARER
        let config = {
            headers: { Authorization: `Bearer ${this.state.token}` }
        };

        //GET USER'S VIEWS
        var viewUrl = `${apiUrl}/communities/${id}/views`;

        Axios.get(viewUrl, config)
            .then(
                result => {
                    myState.welcomeId = result.data[0]._id;
                    sessionStorage.setItem('viewId', result.data[0]._id);
                    // SET GLOBAL VIEWID
                    this.props.setViewId(result.data[0]._id)
                    this.props.history.push({ pathname: "/view", state: myState });
                }).catch(
                    error => {
                        alert(error);
                    });

    }

    render() {
        return (
            <Container>
                <div className="mrg-4-top">

                    <Container className="mrg-2-top">
                        <h6>My Knowledge Building Communities</h6>
                        {this.state.registrations.map((obj, id) => {
                            return <Row key={id} value={obj.communityId} className="mrg-05-top">
                                <Col>{obj._community.title}</Col>
                                <Col><Button variant="outline-secondary" onClick={() => this.enterCommunity({ obj })}>Enter Community</Button></Col>
                            </Row>
                        })}
                    </Container>

                    <Form onSubmit={this.handleSubmit} className="form">
                        <Col>
                            <FormGroup>
                                <Label>Register Community</Label>
                                <Input type="select" name="communityId" id="communityId" value={this.state.communityId} onChange={this.handleChange}>{
                                    this.state.communitites.map((obj) => {
                                        return <option key={obj._id} value={obj._id}>{obj.title}</option>
                                    })
                                }</Input>
                            </FormGroup>
                            <FormGroup>
                                <Label>Registration Key</Label>
                                <Input type="password" name="password" placeholder="Enter Registration Key" id="password" value={this.state.password} onChange={this.handleChange} />
                            </FormGroup>
                        </Col>
                        <Col>
                            <Button variant="secondary" onClick={this.handleSubmit}>Submit</Button>
                        </Col>
                    </Form>

                </div>
            </Container>);
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
    }
}

const mapDispatchToProps = {
    setCommunityId,
    setViewId,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CommunityManager)
/* export default CommunityManager; */
