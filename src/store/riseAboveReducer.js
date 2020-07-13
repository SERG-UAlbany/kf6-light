import { createAction, createReducer } from '@reduxjs/toolkit';
import * as api from './api.js'
import { addNotification } from './notifier.js'
import { dateFormatOptions } from './globalsReducer.js'
import { error } from 'jquery';

export const addNote = createAction('ADD_NOTE')
const initState = {

}

export const riseAboveReducer = createReducer(initState, {});

export const createRiseAbove = (view, communityId, author, notes) => dispatch => {
    let object = {};
    let riseAboveId;
    let riseAboveNoteId;
    let viewId = view._id;
    object.authors = author.split(',')
    object.communityId = communityId;
    object.permission = view.permission ? view.permission : "public";
    object.status = "active"
    object.title = "riseabove:"
    object.type = "View"
    object._groupMembers = view._groupMembers;
    console.log("OBJECT", object);
    //CONTRIBUTE RISEABOVE VIEW
    api.postContribObject(communityId, object).then(response => {
        riseAboveId = response._id;
        console.log("Response", response);
        let note = {};
        note.authors = object.authors;
        note.buildson = null;
        note.communityId = communityId;
        note.data = { body: "" };
        note.langInNote = [];
        note.permission = "protected";
        note.status = "unsaved";
        note.title = "";
        note.type = "Note";
        note._groupMembers = view._groupMembers;
        console.log("NOTE", note);
        //CONTRIBUTE RISEABOVE NOTE
        api.postContribObject(communityId, note).then(noteResponse => {
            console.log("noteResponse", noteResponse);
            riseAboveNoteId = noteResponse._id;
            noteResponse.data.riseabove = { viewId };
            noteResponse.status = "active";
            noteResponse.title = "Riseabove"
            console.log("noteResponse noteResponse", noteResponse);
            api.putObject(noteResponse, communityId, riseAboveNoteId).then(putResponse => {
                console.log("putResponse", putResponse);
                //POST API LINKS
                let pos = { x: 200, y: 200 }
                api.postLink(viewId, riseAboveNoteId, 'contains', pos).then(res => {
                    console.log("NOTE LINK PSTED");
                    notes.forEach(note => {
                        console.log("Mari note", note._id);
                        let pos = { x: 20, y: 20 }
                        api.postLink(riseAboveId, note._id, 'contains', pos).then(res => {
                            console.log("LINK PAN POST THIA");
                            //EITHER AND THEN DELETE
                            api.getLinkForObj(note._id).then(linkRes => {
                                let links = linkRes.data;
                                let link = links.filter(obj => {
                                    return obj.from.includes(viewId)
                                })
                                console.log("DELETE LINK", link[0]._id);
                                api.deleteLink(link[0]._id);
                            })
                        })
                    });
                })
            })
        }).catch(error => {
            console.log("error", error);
        })

    }).catch(error => {
        console.log("Error", error);
    });

    //RESPONSE
    // authors: ["5ec633bf9d463143d4866593"]
    // comments: ""
    // communityId: "5ec633bf9d463143d4866592"
    // created: "2020-07-13T04:16:07.626Z"
    // createdBy: ""
    // docId: ""
    // docShared: []
    // favAuthors: []
    // keywords: []
    // langInNote: []
    // modified: "2020-07-13T04:16:07.626Z"
    // permission: "public"
    // status: "active"
    // title: "riseabove:"
    // type: "View"
    // visitorRole: false
    // wordCount: 0
    // __t: "KContribution"
    // __v: 0
    // _groupMembers: []
    // _id: "5f0be007f671d71182755955"

}
