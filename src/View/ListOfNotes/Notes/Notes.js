import React, { Component } from 'react';
import Axios from 'axios';
import { apiUrl } from '../../../store/api';
import { Col, Row } from 'react-bootstrap';
import Author from '../../../components/Author/Author';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { Button, Collapse } from 'react-bootstrap';
import { Link } from "react-router-dom";

class Notes extends Component {
    open = false;
    constructor(props) {
        super(props);
        this.state = {
            token: sessionStorage.getItem('token'),
            note: {},
            showNote: false,
        };
    }

    componentDidMount() {
        // console.log("NOTES AND PROPS", this.props.noteId);
        // let config = {
        //     headers: { Authorization: `Bearer ${this.token}` }
        // };

        // let linksFromNote = `${apiUrl}/links/from/${this.props.noteId}`;
        // Axios.get(linksFromNote, config).then(
        //     result => {
        //         // console.log("LINKS FROM", result.data.length);
        //         if (result.data.length === 0) {
        //             this.setState({
        //                 showNote: true,
        //             })
        //         }
        //         else { 
        //             //
        //         }
        //     }
        // )

    }

    setOpen = (value) => {
        this.open = value;
    }

    render() {
        // console.log("prp", this.props);

        let note;
        if (this.props.noteObj && this.props.noteObj._to && this.props.noteObj._to.title) {
            // console.log("NOTEJS", this.props.noteObj);
            note = <div>
                <Row className="mrg-05-top">
                    <Col className="primary-bg-200 rounded mrg-1-bot">
                        <Row className="pd-05">
                            <Col className="primary-800 font-weight-bold"> {this.props.noteObj._to.title}</Col>
                            <Col md="2">
                                <Form className="mrg-1-min pd-2-right">
                                    <FormGroup>
                                        <Input type="checkbox" ref={this.props.noteObj.to} onChange={e => this.props.showContent(e, this.props.noteObj.to)} />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row className="primary-600 sz-075 pd-05">
                            <Col><Author authorId={this.props.noteObj._to.authors} />&nbsp; {this.props.noteObj._to.created}
                            </Col>
                            <Col md="3">
                                {/* <Button size='sm' onClick={() => this.buildOn(this.props.noteObj.to)}>BuildOn</Button> */}
                                <Button size='sm' className='ml-1' onClick={() => this.openNote(this.props.noteObj.to)}><i className="fa fa-pencil"></i></Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        }
        else if (this.props.oneHirarchy && this.props.oneHirarchy._to && this.props.oneHirarchy._to.title && this.props.oneHirarchy._to.created && this.props.oneHirarchy._from && this.props.oneHirarchy._from.title && this.props.oneHirarchy._to.created) {
            note = <div>
                <Row className="mrg-05-top">
                    <Col className="mr-auto primary-bg-200 rounded mrg-1-bot">
                        <Row className="pd-05">
                            <Col md="10" className="primary-800 font-weight-bold">
                                <Link onClick={() => this.setOpen(!this.open)} aria-controls="example-collapse-text" aria-expanded={this.open}><i className="fa fa-chevron-right"></i>
                                </Link>
                                {this.props.oneHirarchy._to.title}</Col>
                            <Col md="2">
                                <Form className="mrg-1-min pd-2-right">
                                    <FormGroup>
                                        <Input type="checkbox" ref={this.props.oneHirarchy.to} onChange={e => this.props.showContent(e, this.props.oneHirarchy.to)} />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row className="primary-600 sz-075 pd-05">
                            <Col><Author authorId={this.props.oneHirarchy._to.authors} />&nbsp; {this.props.oneHirarchy._to.created}</Col>
                            <Col md="2">
                                {/* <Button onClick={() => this.buildOn(this.props.oneHirarchy.to)}>BuildOn</Button> */}
                            </Col>
                        </Row>
                        <Collapse in={this.open}>
                            <Row>
                                <Col md="1"></Col>
                                <Col>
                                    <Row className="pd-05 border-left border-primary">
                                        <Col className="primary-800 font-weight-bold">{this.props.oneHirarchy._from.title}</Col>
                                        <Col md="2">
                                            <Form className="mrg-1-min">
                                                <FormGroup>
                                                    <Input className="pd-left" type="checkbox" ref={this.props.oneHirarchy.from} onChange={e => this.props.showContent(e, this.props.oneHirarchy.from)} />
                                                </FormGroup>
                                            </Form>
                                        </Col>
                                    </Row>
                                    <Row className="primary-600 sz-075 pd-05 border-left border-primary">
                                        <Col><Author authorId={this.props.oneHirarchy._from.authors} />&nbsp; {this.props.oneHirarchy._from.created}</Col>
                                        <Col md="2">
                                            {/* <Button onClick={() => this.buildOn(this.props.oneHirarchy.from)}>BuildOn</Button> */}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                        </Collapse>
                    </Col>
                </Row>
            </div>
        }

        else if (this.props.multipleHirarchy && this.props.multipleHirarchy[0] && this.props.multipleHirarchy[0]._to && this.props.multipleHirarchy[0]._to.title && this.props.multipleHirarchy[0]._to.created) {
            note = <div>
                <Row className="mrg-05-top">
                    <Col className="primary-bg-200 rounded mrg-1-bot">
                        <Row>
                            <Col>
                                <Row className="pd-05">
                                    <Col md="10" className="primary-800 font-weight-bold">
                                        <Link onClick={() => this.setOpen(!this.open)} aria-controls="example-collapse-text" aria-expanded={this.open}><i className="fa fa-chevron-right"></i>
                                        </Link>
                                        {this.props.multipleHirarchy[0]._to.title}</Col>
                                    <Col md="2">
                                        <Form className="mrg-1-min pd-2-right">
                                            <FormGroup>
                                                <Input type="checkbox" ref={this.props.multipleHirarchy[0].to} onChange={e => this.props.showContent(e, this.props.multipleHirarchy[0].to)} />
                                            </FormGroup>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row className="primary-600 sz-075 pd-05">
                                    <Col><Author authorId={this.props.multipleHirarchy[0]._to.authors} />&nbsp; {this.props.multipleHirarchy[0]._to.created}</Col>
                                    <Col md="2">
                                        {/* <Button onClick={() => this.buildOn(this.props.multipleHirarchy[0].to)}>BuildOn</Button> */}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        {this.props.multipleHirarchy.map((subObj, j) => {
                            return <Collapse in={this.open}>
                                <Row key={j}>
                                    <Col md="1">
                                    </Col>
                                    <Col>
                                        {this.props.multipleHirarchy[0] && this.props.multipleHirarchy[0]._to && this.props.multipleHirarchy[0]._to.title && subObj && subObj._from && subObj._from.created ? (<>
                                            <Row className="pd-05 border-left border-primary">
                                                <Col className="primary-800 font-weight-bold">{subObj._from.title}</Col>
                                                <Col md="2">
                                                    <Form className="mrg-1-min">
                                                        <FormGroup>
                                                            <Input className="pd-left" type="checkbox" ref={subObj.from} onChange={e => this.props.showContent(e, subObj.from)} />
                                                        </FormGroup>
                                                    </Form>
                                                </Col>
                                            </Row>
                                            <Row className="primary-600 sz-075 pd-05 border-left border-primary">
                                                <Col><Author authorId={subObj._from.authors} />&nbsp; {subObj._from.created}
                                                </Col>
                                                <Col md="2">
                                                    {/* <Button onClick={() => this.buildOn(subObj.from)}>BuildOn</Button> */}
                                                </Col>
                                            </Row></>) : (<></>)}
                                    </Col>
                                </Row>
                            </Collapse>
                        })}
                    </Col>
                </Row>
            </div >
        }
        return (<>
            {note}
        </>)
    }

}
export default Notes;