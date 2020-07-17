import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Card, Button } from 'react-bootstrap';
import { openContribution } from '../../store/noteReducer'
import './RiseAboveView.css';

class RiseAboveView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            riseAboveNotes: [],
        }
        this.editNote = this.editNote.bind(this)
    }
    componentDidMount() {
        if (this.props.riseAboveViewId) {
            let notes = this.props.riseAboveViewNotes[this.props.riseAboveViewId].map((noteId) => this.props.riseAboveNotes[noteId])
            this.setState({
                riseAboveNotes: notes
            })
        }
    }
    editNote = (noteId) => {
        this.props.openContribution(noteId)
    }
    render() {
        return (
            <Col>
                <Row>
                    <Col className="">
                        <Card className="pd-05">
                            <Card.Title>RiseAbove Notes</Card.Title>
                            <Card.Body className="mrg-05-top">
                                {this.state.riseAboveNotes ?
                                    (<>
                                        {this.state.riseAboveNotes.map((note, i) => {
                                            return <Row key={i}><Button variant="light">{note.title}</Button></Row>
                                            // return <Row key={i}><Button variant="light" onClick={() => this.editNote(note._id)}>{note.title}</Button></Row>
                                        })}
                                    </>)
                                    : null}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Col>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        riseAboveViewNotes: state.notes.riseAboveViewNotes,
        riseAboveNotes: state.notes.riseAboveNotes
    }
}

const mapDispatchToProps = {
    openContribution
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RiseAboveView)

