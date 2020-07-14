import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Form, FormGroup, Input } from 'reactstrap';
import { Button, Collapse } from 'react-bootstrap';
import ListOfNotes from '../ListOfNotes.js'
import { dateFormatOptions } from '../../../store/globalsReducer'
import { updateCheckedNotes } from '../../../store/noteReducer'

class Notes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            note: {},
            showNote: false,
            open: false
        };
        this.checkNote = this.checkNote.bind(this)
    }

    componentDidMount() {
    }

    setOpen = (value) => {
        this.setState((prevState) => {
            return { open: !prevState.open }
        })
    }

    checkNote = (evt, noteId) => {
        this.props.updateCheckedNotes({ noteId, checked: evt.target.checked })
    }

    render() {
        const hasChildren = this.props.children && Object.keys(this.props.children).length !== 0;;
        const icon = this.state.open ? "fa-chevron-down" : "fa-chevron-right"
        const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
        console.log("this.props.note.riseAboveNotes",this.props.note.riseAboveNotes);
        const riseAboveNotes = this.props.note.riseAboveNotes ?
            <>
                {this.props.note.riseAboveNotes.map((note) => <li key={note._id}>{note.title}</li>)}
            </>
            : null;

        return (
            <div>
                <Row className="mrg-05-top">
                    <Col className="mr-auto rounded mrg-1-bot">
                        <Row className="pd-05">
                            <Col md="10" className="primary-800 font-weight-bold">
                                {hasChildren ?
                                    <Button variant='link' onClick={() => this.setOpen(!this.open)} aria-controls="example-collapse-text" aria-expanded={this.state.open}>
                                        <i className={`fa ${icon}`}></i>
                                    </Button>
                                    : null}
                                {this.props.note.title}</Col>
                            <Col md="2">
                                <Form className="mrg-1-min pd-2-right">
                                    <FormGroup>
                                        <Input type="checkbox" checked={this.props.isChecked} ref={this.props.note._id} onChange={e => this.checkNote(e, this.props.note._id)} />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row className="primary-600 sz-075 pd-05">
                            <Col><span> {this.props.author} </span>&nbsp; {formatter.format(new Date(this.props.note.created))}</Col>
                            <Col md="2">
                                {/* <Button onClick={() => this.buildOn(this.props.oneHirarchy.to)}>BuildOn</Button> */}
                            </Col>
                        </Row>
                        {riseAboveNotes}
                        {this.props.children ?
                            <Collapse in={this.state.open}>
                                <Row>
                                    <Col>
                                        <ListOfNotes hierarchy={this.props.children} notes={this.props.notes}></ListOfNotes>
                                    </Col>
                                </Row>
                            </Collapse>
                            : null}
                    </Col>
                </Row>
            </div>
        )
    }

}

const mapStateToProps = (state, ownProps) => {
    const author = state.users[ownProps.note.authors[0]]
    return {
        author: (author && `${author.firstName} ${author.lastName}`) || 'NA',
        isChecked: state.notes.checkedNotes.includes(ownProps.note._id)
    }
}

const mapDispatchToProps = {
    updateCheckedNotes
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Notes)
