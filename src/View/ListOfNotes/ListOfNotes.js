import React, { Component } from 'react';
import Notes from './Notes/Notes';
import { connect } from 'react-redux'
class ListOfNotes extends Component {

    constructor(props) {
        super(props);
        this.getNotes = this.getNotes.bind(this)
    }

    componentDidMount() {
    }

    getNotes() {
        const notes = []
        for (let noteId in this.props.hierarchy) {
            if (noteId in this.props.notes)
                notes.push(this.props.notes[noteId])
            // else if (noteId in this.props.riseAboveNotes) //Check if is from a riseabove
            //     notes.push(this.props.riseAboveNotes[noteId])
        }
        //TODO sort them
        return notes.sort((a, b) => { return new Date(b.created) - new Date(a.created) })

    }

    render() {
        const notes = this.props.noteLinks || this.getNotes()
        return (<>
            {
                notes.map((note, i) => {
                    const children = this.props.hierarchy && this.props.hierarchy[note._id].children
                    return <div key={i} className="shadow p-3 mb-5 rounded">
                        <Notes note={note} children={children} notes={this.props.notes} />
                    </div>
                })
            }
        </>)
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        notes: state.notes.viewNotes,
        riseAboveNotes: state.notes.riseAboveNotes
    }
}

const mapDispatchToProps = {
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ListOfNotes)
