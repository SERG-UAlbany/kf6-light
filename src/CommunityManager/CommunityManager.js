import React, { Component } from 'react';
import Axios from 'axios';
import { Container, Col, Row, Form, FormGroup, Label, Input } from 'reactstrap';
import { Button } from 'react-bootstrap';
import { BallBeat } from 'react-pure-loaders';
import { connect } from 'react-redux'
import { apiUrl } from '../store/api.js'
import { setCommunityId, setViewId, setViews, fetchView, setView } from '../store/globalsReducer.js'

class CommunityManager extends Component {

    constructor(props) {
        super(props);

        this.state = {
            communitites: [],
            password: '',
            token: sessionStorage.getItem("token"),
            registrations: [],
            success: false,
            loading: true,
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
    }

    handleSubmit(e) {
        e.preventDefault();

        //REGISTER NEW COMMUNITY TO AUTHOR
        let registerUrl = `${apiUrl}/authors`;
        let data = { "communityId": this.state.communityId, "registrationKey": this.state.password, "userId": this.props.userId };
        let config = {
            headers: { Authorization: `Bearer ${this.props.token}` }
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
                    let communityId = communityData[0]._id;
                    this.setState({
                        communitites: communityData,
                    })
                    if (communityId) {
                        this.setState({
                            communityId: communityId,
                        })
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
                    userRegistrations = userRegistrations.sort((a, b) => a._community.title.localeCompare(b._community.title));
                    this.setState({
                        registrations: userRegistrations,
                        loading: false,
                    })
                }).catch(
                    error => {
                        alert("User Registrations Failed, Please reload the page!");
                    }
                );
    }

    enterCommunity(myCommunity) {
        let communityId = myCommunity.obj.communityId;
        // SET COMMUNITYID
        sessionStorage.setItem('communityId', myCommunity.obj.communityId);
        this.props.setCommunityId(communityId);

        //SET HEADER WITH TOKEN BEARER
        let config = {
            headers: { Authorization: `Bearer ${this.state.token}` }
        };

        //GET USER'S VIEWS
        var viewUrl = `${apiUrl}/communities/${communityId}/views`;

        Axios.get(viewUrl, config)
            .then(
                result => {
                    let welcomeId = result.data[0]._id;
                    let views = result.data;
                    console.log("views", views);

                    // SET VIEWID
                    sessionStorage.setItem('viewId', welcomeId);
                    this.props.setViewId(welcomeId);
                    //NAVIGATE TO VIEW
                    this.props.history.push({ pathname: `/view/${welcomeId}` });
                }).catch(
                    error => {
                        alert(error);
                    });

    }

    render() {
        return (
            <>
                {
                    this.state.loading ? (
                        //SHOW LOADING UNTIL COMMUNITITES ARE GOT
                        < Container >
                            <div className="mrg-16-top mrg-auto d-flex justify-content-center">
                                <BallBeat
                                    color={'#000000'}
                                    loading={true}
                                />
                            </div>
                        </Container>
                    )
                        :
                        (
                            < Container >
                                <div className="mrg-4-top">

                                    <Container className="mrg-2-top">
                                        <h6>My Knowledge Building Communities</h6>
                                        {
                                            this.state.registrations.map((obj, id) => {
                                                return <Row key={id} value={obj.communityId} className="mrg-05-top">
                                                    <Col>{obj._community.title}</Col>
                                                    <Col><Button variant="outline-secondary" onClick={() => this.enterCommunity({ obj })}>Enter Community</Button></Col>
                                                </Row>
                                            })
                                        }
                                    </Container >

                                    <Form onSubmit={this.handleSubmit} className="form mrg-1-top mrg-1-bot">
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

                                </div >
                            </Container >
                        )
                }
            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        token: state.globals.token,
        userId: state.globals.userId
    }
}

const mapDispatchToProps = {
    setCommunityId,
    setViewId,
    setViews,
    fetchView,
    setView
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CommunityManager)
/* export default CommunityManager; */
