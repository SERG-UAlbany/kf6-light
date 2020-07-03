import React, { Component } from 'react';
import Notes from './Notes/Notes';
import { Col, Row } from 'react-bootstrap';
class ListOfNotes extends Component {

    constructor(props) {
        super(props);
        this.state = {
            token: sessionStorage.getItem('token'),
            noteLinks: this.props.noteLinks,
        };
        this.getNotes = this.getNotes.bind(this)
    }

    componentDidMount() {
    }

    // getProps = (noteLinks) => {
    //     console.log("noteLinks",noteLinks.length);
    //     if(noteLinks.length >0 && this.state.noteLinks.length === 0){
    //         this.setState({
    //             noteLinks: noteLinks,
    //         })
    //         console.log("SSSS ",this.state.noteLinks);
    //     }

    // }

    getNotes() {
        const notes = []
        for (let noteId in this.props.hierarchy) {
            if (noteId in this.props.notes)
                notes.push(this.props.notes[noteId])
        }
        //TODO sort them
        return notes
    }

    render() {
        // let note;
        // if (this.props.noteObj || this.props.hNoteObj) {

        //     if (Array.isArray(this.props.hNoteObj)) {
        //         console.log("Its Array",this.props.hNoteObj);

        //     } else {
        //         console.log("kot knt",this.props.noteObj);
        //         note = <Notes noteId={this.props.noteObj.to} authors={this.props.noteObj._to.authors} title={this.props.noteObj._to.title} created={this.props.noteObj.created}/>

        //     }

        // }
        const notes = this.getNotes()

        return (<>
            {
                notes.map((note, i) => {
                    const children = this.props.hierarchy[note._id].children
                    return <div className="shadow p-3 mb-5 rounded">
                        <Notes key={i} note={note} children={children} notes={this.props.notes} showContent={this.props.showContent} />
                    </div>
                })
            }
            {/* {this.props.hNotes ?(
                this.props.hNotes.map((obj, i) => {
                let oneHirarchy;
                let multipleHirarchy;
                if (obj && obj._to && obj._to.title) {
                //1 STEP HIERARCHY
                oneHirarchy = obj;
                return <Notes key={i} oneHirarchy = {oneHirarchy} showContent= {this.props.showContent}/>
                }
                else {
                // MULTIPLE
                multipleHirarchy = obj;
                return <Notes key={i} multipleHirarchy = {multipleHirarchy} showContent= {this.props.showContent} />
                }
                })):null} */}

            {/* {this.props.noteLinks ?(
                this.props.noteLinks.map((obj, i) =>{
                let noteObj = obj;
                return <Notes key={i} noteObj = {noteObj} noteId={obj.to} showContent= {this.props.showContent} openNote={this.props.openNote}/>
                })
                )
                :null} */}
            {/* {note} */}
        </>)
    }

}
export default ListOfNotes;
