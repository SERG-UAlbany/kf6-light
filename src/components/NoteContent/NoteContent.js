import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, } from 'react-bootstrap';
import { Form, FormGroup, Input, Alert } from 'reactstrap';
import Axios from 'axios';

import './NoteContent.css';
import { apiUrl } from '../../store/api.js';
import { openContribution } from '../../store/noteReducer'

class NoteContent extends Component {
    noteList = [];
    constructor(props) {
        super(props);
        this.state = {
            token: sessionStorage.getItem('token'),
            addView: this.props.viewId,
            communityId: sessionStorage.getItem('communityId'),
            visible: false,
            viewError: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    componentDidMount() {

        //SET HEADER WITH TOKEN BEARER
        var config = {
            headers: { Authorization: `Bearer ${this.state.token}` }
        };

        //GET USER'S VIEWS
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

    handleChange(e) {
        e.persist();
        let target = e.target;
        let id = target.value;

        this.setState({
            addView: id,
        });

    }

    handleSubmit = (e) => {
        if (this.props.viewId === this.state.addView) {
            this.setState({
                viewError: true,
            })
            window.setTimeout(() => {
                this.setState({ viewError: false })
            }, 1500)
        }
        else {
            const topleft = { x: 1000, y: 1000 };
            let url = `${apiUrl}/links`;
            let config = {
                headers: { Authorization: `Bearer ${this.state.token}` }
            };
            this.props.checkedNotes.forEach(note => {
                const ref = this.props.viewLinks.filter((lnk) => lnk.to === note._id)[0]
                topleft.x = Math.min(topleft.x, ref.data.x);
                topleft.y = Math.min(topleft.y, ref.data.y);
            })
            this.props.checkedNotes.forEach(note => {
                let noteId = note._id;
                let query = {
                    "from": this.state.addView,
                    "to": noteId,
                    "type": "contains",
                    'data': topleft
                };
                Axios.post(url, query, config).then(
                    res => {
                        // console.log("AZIOX POST DONE");
                        this.setState({ visible: true }, () => {
                            window.setTimeout(() => {
                                this.setState({ visible: false })
                            }, 1000)
                        });

                    }
                );
            });
        }



        // POST LINKS ALERT THEY'RE ADDED TO VIEW TITLE

    }

    openNote = (contribId) => {
        this.props.openContribution(contribId);
    }

    render() {

        return (
            <>
                <Form className="mrg-1-top">
                    <Row>
                        <Col md="8">
                            <FormGroup>
                                {/* <Label>Select Community</Label> */}
                                <Input type="select" name="viewId" onChange={this.handleChange}>{
                                    this.props.views.map((obj, i) => {
                                        return <option key={i} value={obj._id}> {obj.title} </option>
                                    })
                                }</Input>
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <Button onClick={this.handleSubmit} >Add to View</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Alert color="danger" isOpen={this.state.viewError} >
                                Please select a Different View.
                            </Alert>
                            <Alert color="info" isOpen={this.state.visible} >
                                Notes added to View!
                            </Alert>
                        </Col>
                    </Row>
                </Form>
                {this.props.checkedNotes.map(
                    (obj, i) => {
                        let data;

                        if (this.props.query && obj.data.English) {
                            let innerHTML = obj.data.English;
                            let index = innerHTML.indexOf(this.props.query);
                            if (index >= 0) {
                                data = innerHTML.substring(0, index) + "<span class='highlight'>" + innerHTML.substring(index, index + this.props.query.length) + "</span>" + innerHTML.substring(index + this.props.query.length);
                            }
                        } else if (this.props.query && obj.data.body) {
                            let innerHTML = obj.data.body;
                            let index = innerHTML.indexOf(this.props.query);
                            if (index >= 0) {
                                data = innerHTML.substring(0, index) + "<span class='highlight'>" + innerHTML.substring(index, index + this.props.query.length) + "</span>" + innerHTML.substring(index + this.props.query.length);
                            }
                        }

                        return <>
                            <Row className="min-height-2 mrg-05 border rounded mrg-1-bot pd-1" key={i}>
                                <Col>
                                    <Row>
                                        <Col md="10" className="pd-1 primary-800 font-weight-bold">{obj.title}</Col>
                                        <Col md="2"><Button variant="outline-secondary" className="circular-border float-right" onClick={() => this.props.closeNote(obj._id)}><i className="fas fa-times"></i></Button></Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <span className="pd-1" dangerouslySetInnerHTML={{ __html: data ? (data) : (obj.data.English ? obj.data.English : obj.data.body) }} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Button className="float-right mrg-1-left" variant="outline-info" onClick={() => this.props.buildOn(obj._id)}>BuildOn</Button>
                                            <Button className="float-right" variant="outline-info" onClick={() => this.openNote(obj._id)}>Edit Note</Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                        </>
                    }
                )}
            </>
        )
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        viewId: state.globals.viewId,
        views: state.globals.views,
        checkedNotes: state.notes.checkedNotes,
        viewLinks: state.notes.viewLinks
    }
}

const mapDispatchToProps = {
    openContribution
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NoteContent);
