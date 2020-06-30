import { createAction, createReducer } from '@reduxjs/toolkit'
import { getAuthor, getObject, getCommunity, getGroups, getUserId } from './api.js'

export const setGlobalToken = createAction('SET_TOKEN')
export const setCommunity = createAction('SET_COMMUNITY')
export const setCommunityId = createAction('SET_COMMUNITY_ID')
export const setViewId = createAction('SET_VIEW_ID')
export const setAuthor = createAction('SET_AUTHOR')
export const setView = createAction('SET_VIEW')
export const setViews = createAction('SET_VIEWS')
export const editCommunity = createAction('EDIT_COMMUNITY')
export const setNoteContent = createAction('SET_NOTE_CONTENT')
export const setUserId = createAction('SET_USERID')
export const setIsAuthenticated = createAction('SET_ISAUTHENTICATED')
export const dateFormatOptions = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: true
};

const initState = {
    token: '',
    communityId: sessionStorage.getItem('communityId'),
    viewId: sessionStorage.getItem('viewId'),
    contextId: '',
    // communityId: '5e445735d525b936837f7450',
    author: {},
    view: null,
    views: [],
    community: null,
    noteContent: [],
    userId: '',
    IsAuthenticated: false,
}

export const globalsReducer = createReducer(initState, {
    [setGlobalToken]: (state, action) => {
        state.token = action.payload
        console.log("Incoming",action.payload, state.token);
    },
    [setIsAuthenticated]: (state, action) => {
        state.IsAuthenticated = action.payload
        console.log("setIsAuthenticated",action.payload, state.IsAuthenticated);
    },
    [setCommunityId]: (state, action) => {
        state.communityId = action.payload
    },
    [setViewId]: (state, action) => {
        state.viewId = action.payload
    },
    [setUserId]: (state, action) => {
        state.userId = action.payload
    },
    [setAuthor]: (state, action) => {
        state.author = action.payload
    },
    [setView]: (state, action) => {
        state.view = action.payload
    },
    [setViews]: (state, action) => {
        state.views = action.payload
    },
    [setCommunity]: (state, action) => {
        state.community = action.payload
        state.contextId = action.payload.rootContextId
    },
    [editCommunity]: (state, action) => {
        state.community = { ...state.community, ...action.payload }
    },
    [setNoteContent]: (state, action) => {
        state.noteContent = { ...action.payload }
        console.log("state.noteContent", state.noteContent);
    },
});

export const fetchAuthor = (communityId) => {
    return dispatch => {
        return getAuthor(communityId).then(res => {
            dispatch(setAuthor(res.data));
        })
    }
}

export const fetchView = (viewId) => {
    return dispatch => {
        return getObject(viewId).then(res => {
            dispatch(setView(res))
        })
    }
}

export const fetchCommunity = (communityId) => {
    return dispatch => {
        return getCommunity(communityId).then(res => {
            dispatch(setCommunity(
                { groups: [], ...res.data }
            ))
        })
    }
}

export const fetchCommGroups = (communityId) => async (dispatch) => {
    const groups = await getGroups(communityId)
    dispatch(editCommunity({ groups }))
}

export const fetchUserId = () => {
    return dispatch => {
        return getUserId().then(res => {
            dispatch(setUserId(res.data._id))
        })
    }
}
