import { createAction, createReducer } from '@reduxjs/toolkit';
import { openDialog, openDrawDialog, closeDialog } from './dialogReducer.js'
import { preProcess, postProcess } from './kftag.service.js'
import * as api from './api.js'
import { addNotification } from './notifier.js'
import { dateFormatOptions } from './globalsReducer.js'

export const addNote = createAction('ADD_NOTE')
export const removeNote = createAction('REMOVE_NOTE')
export const editNote = createAction('EDIT_NOTE')
export const addDrawing = createAction('ADD_DRAWING')
export const removeDrawing = createAction('REMOVE_DRAWING')
export const editSvg = createAction('EDIT_SVG')
export const addAttachment = createAction('ADD_ATTACHMENT')
export const removeAttachment = createAction('REMOVE_ATTACHMENT')
export const setAttachments = createAction('SET_ATTACHMENTS')
export const setWordCount = createAction('SET_WORDCOUNT')
export const setLinks = createAction('SET_CONNECTIONS')
export const setRecords = createAction('SET_RECORDS')
export const removeContribAuthor = createAction('REMOVE_CONTRIB_AUTHOR')
export const addContribAuthor = createAction('ADD_CONTRIB_AUTHOR')

// export const postContribution = createAction('POST_CONTRIBUTION')

// let noteCounter = 0
const initState = {drawing: '', attachments: {}}

export const noteReducer = createReducer(initState, {
    [addNote]: (notes, action) => {
        notes[action.payload._id] = action.payload
    },
    [removeNote]: (notes, action) => {
        delete notes[action.payload]
    },
    [editNote]: (notes, action) => {
        let note = notes[action.payload._id];
        notes[action.payload._id] = Object.assign({}, note, action.payload)
    },
    [addDrawing]: (notes, action) => {
        notes.drawing = action.payload
    },
    [removeDrawing]: (notes, action) => {
        notes.drawing = '';
    },
    [editSvg]: (notes, action) => {
        notes[action.payload.noteId].editSvg = action.payload.svg
    },
    [addAttachment]: (state, action) => {
        let note = state[action.payload.noteId]
        note.attachments.push(action.payload.attachment._id)
        state.attachments[action.payload.attachment._id] = action.payload.attachment
    },
    [removeAttachment]: (notes, action) => {
        let note = notes[action.payload.noteId]
        note.attachments = note.attachments.filter((att) => att.id !== action.payload.attId)
    },
    [setAttachments]: (state, action) => {
        let note = state[action.payload.contribId]
        note.attachments = action.payload.attachments.map((att)=> att._id)
        action.payload.attachments.forEach((att) => {
            state.attachments[att._id] = att
        })
    },
    [setWordCount]: (state, action) => {
        let note = state[action.payload.contribId]
        note.wordCount = action.payload.wc
    },
    [setLinks]: (state, action) => {
        let contrib = state[action.payload.contribId]
        if (action.payload.direction === 'from'){
            contrib.fromLinks = action.payload.links
        }else{
            contrib.toLinks = action.payload.links
        }
    },
    [setRecords]: (state, action) => {
        let note = state[action.payload.contribId]
        note.records = action.payload.records
    },
    [addContribAuthor]: (state, action) => {
        let contrib = state[action.payload.contribId]
        contrib.authors = [...contrib.authors, action.payload.author]
    },
    [removeContribAuthor]: (state, action) => {
        let contrib = state[action.payload.contribId]
        contrib.authors = contrib.authors.filter((auth) => auth !== action.payload.author)
    }
});

const createNote = (communityId, authorId, contextMode, fromId, content) => {
    if (!content){ content = ''}
    if (contextMode && !contextMode.permission){
        window.alert('invalid mode object')
        return
    }
    let mode = {}
    if (contextMode && contextMode.permission === 'private'){
        mode.permission = contextMode.permission;
        mode.group = contextMode.group;
        mode._groupMembers = contextMode._groupMembers;
    } else {
        mode.permission = 'protected';
        mode.group = undefined;
        mode._groupMembers = [];
    }
    let title = contextMode && contextMode.title ? contextMode.title : '';
    let status = contextMode && contextMode.status ? contextMode.status : 'unsaved';

    const newobj = {
        communityId: communityId,
        type: 'Note',
        title: title,
        /* 6.6 the default title was changed to blank by Christian */
        authors: [authorId],
        status: status,
        permission: mode.permission,
        group: mode.group,
        _groupMembers: mode._groupMembers,
        data: {
            body: contextMode && contextMode.body ? contextMode.body : ''
        },
        buildson: fromId,
        langInNote: []

    }

    //save google document id, createdBy and coauthors, current doc permission granted
    if (contextMode && contextMode.docId) {
        newobj.docId = contextMode.docId;
        var myself = newobj.authors[0];
        if (contextMode.coauthors) {
            var ca = contextMode.coauthors.split(',');
            for (var i = 0; i < ca.length; i++) {
                if (ca[i] !== myself) {
                    newobj.authors.push(ca[i]);
                }
            }
        }
        if (contextMode.createdBy) {
            newobj.createdBy = contextMode.createdBy;
        }
        newobj.docShared = [myself];
        newobj.text4search = contextMode.text4search;
    }

    return newobj
}

export const newNote = (view, communityId, authorId) => dispatch => {
    const mode = {permission: view.permission, group: view.group, _groupMembers: view._groupMembers }
    const newN = createNote(communityId, authorId, mode);

    return api.postContribution(communityId, newN).then((res) => {
        const note = {attachments: [], fromLinks:[], toLinks:[], records: [], group: null, ...res.data}
        const pos = {x: 100, y:100}
        api.postLink(view._id, note._id, 'contains', pos)

        //TODO saveContainsLinktoITM x2

        dispatch(addNote(note))

        dispatch(openDialog({title: 'New Note',
                             confirmButton: 'create',
                             noteId: note._id,
                            }))
    })

}

export const editSvgDialog = (noteId, svg) => dispatch => {
    dispatch(editSvg({noteId, svg}))
    dispatch(openDrawDialog(noteId))
}

export const attachmentUploaded = (noteId, attachment, inline, x, y) => dispatch => {

    return api.postLink(noteId, attachment._id, 'attach').then((res) => {

        // TODO dispatch(getLinksFrom(noteId))
        dispatch(addAttachment({noteId, attachment}))

    });
}

export const fetchAttachments = (contribId) => async dispatch => {
    const link_atts = await api.getLinks(contribId, 'from', 'attach')
    const promises = link_atts.map((attach) => api.getObject(attach.to))
    let attachments = await Promise.all(promises)
    attachments = attachments.map((att) => att.data)
    dispatch(setAttachments({contribId, attachments}))
}

export const postContribution = (contribId, dialogId) => async (dispatch, getState) => {
    const state = getState()
    let contrib = state.notes[contribId]
    contrib = Object.assign({}, contrib)
    contrib.data = Object.assign({}, contrib.data)
    if (!contrib.title){
        addNotification({title: 'Error Saving Note!', type:'danger', message:'Title is required'})
        return
    }
    //TODO sync checking?
    //TODO status.contribution = 'saving'
    if (contrib.type === 'Note') {
        // TODO if isGoogleDoc
        // const isNewNote = contrib.status === 'unsaved'
        contrib.status = 'active'
        const jq = await postProcess(contrib.data.body, contrib._id, contrib.toLinks, contrib.fromLinks)
        dispatch(fetchLinks(contribId, 'from'))
        dispatch(fetchLinks(contribId, 'to'))

        const text = jq.html()
        contrib.data.body = text
        const newNote = await api.putObject(contrib, contrib.communityId, contrib._id)
        dispatch(editNote(newNote))

        if (dialogId !== undefined)
            dispatch(closeDialog(dialogId))
        addNotification({title: 'Saved!', type:'success', message:'Contribution created!'})
    }
}

export const fetchLinks = (contribId, direction) => async (dispatch) => {
    const links = await api.getLinks(contribId, direction)
    dispatch(setLinks({contribId, direction, links}))
}

export const fetchRecords = (contribId) => async (dispatch, getState) => {
    const authors = getState().users
    const records = await api.getRecords(contribId)
    const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
    records.forEach((record) => {
        if (authors[record.authorId]){
            const author =  authors[record.authorId]
            record['author'] = `${author.firstName} ${author.lastName}`
        }else{
            record['author'] = 'NA'
        }
        record['date'] = formatter.format(new Date(record.timestamp))
    })
    dispatch(setRecords({contribId, records}))
}

export const openContribution = (contribId) => async (dispatch, getState) => {

    const [contrib, fromLinks, toLinks] = await Promise.all([api.getObject(contribId),
                                                            api.getLinks(contribId, 'from'),
                                                            api.getLinks(contribId, 'to')])

    const note = {attachments: [], fromLinks, toLinks, records: [], ...contrib.data}
    const noteBody = preProcess(note.data.body, toLinks, fromLinks)
    note.data.body = noteBody
    dispatch(addNote(note))
    dispatch(fetchAttachments(contribId))
    dispatch(openDialog({title: 'Edit Note',
                         confirmButton: 'edit',
                         noteId: note._id,
                        }))

    if (note.status === 'active'){
         api.read(note.communityId, note._id)
    }
}
