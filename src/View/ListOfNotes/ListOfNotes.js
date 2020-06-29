import React, { Component } from 'react';
import Notes from './Notes/Notes';

class ListOfNotes extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            token: sessionStorage.getItem('token'),
            noteLinks: this.props.noteLinks,
        };

        console.log("Constructor", this.props);



    }

    componentDidMount() {
        // if(this.state.noteLink){
        //     this.state.noteLinks.forEach(element => {
        //         console.log(element);

        //     });
        // }




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

        return (<>
            {this.props.hNotes ?(
                this.props.hNotes.map((obj, i) => {
                    let oneHirarchy;
                    let multipleHirarchy;
                    if (obj && obj._to && obj._to.title) {
                        //1 STEP HIERARCHY
                        oneHirarchy = obj;
                        return <Notes oneHirarchy = {oneHirarchy} showContent= {this.props.showContent}/>
                    }
                    else {
                        // MULTIPLE
                        multipleHirarchy = obj;
                        return <Notes multipleHirarchy = {multipleHirarchy} showContent= {this.props.showContent} />
                    }
            })):null}

            {this.props.noteLinks ?(
                this.props.noteLinks.map((obj) =>{
                    let noteObj = obj;
                    return <Notes noteObj = {noteObj} noteId={obj.to} showContent= {this.props.showContent}/>
                })
            )
            :null}
            {/* {note} */}
        </>)
    }

}
export default ListOfNotes;