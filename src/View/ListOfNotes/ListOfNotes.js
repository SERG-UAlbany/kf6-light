import React, { Component } from 'react';
import Notes from './Notes/Notes';
import * as api from '../../store/api';
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
            if (noteId in this.props.notes && this.props.notes[noteId].data.riseabove) {
                let riseAboveObj = { ...this.props.notes[noteId] };
                let riseAboveNotes = this.getRiseAboveData(riseAboveObj.data.riseabove.viewId);
                riseAboveObj.riseAboveNotes = riseAboveNotes;
                notes.push(riseAboveObj)
            } else if (noteId in this.props.notes)
                notes.push(this.props.notes[noteId])
        }
        //TODO sort them
        return notes.sort((a, b) => { return new Date(b.created) - new Date(a.created) })

    }

    getRiseAboveData = (riseAboveLink) => {
        let noteLinks = [];
        let riseAboveNotes = [];
        api.getLinks(riseAboveLink, 'from', 'contains').then(res => {
            noteLinks = res;
            console.log("noteLinks", noteLinks);
            noteLinks.forEach(noteLink => {
                let note = {};
                note._id = noteLink.to;
                note.title = noteLink._to.title;
                riseAboveNotes.push(note);
            });
        })
        console.log("return", riseAboveNotes);
        return riseAboveNotes;
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
export default ListOfNotes;
