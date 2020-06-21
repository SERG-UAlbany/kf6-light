import { createAction, createReducer } from '@reduxjs/toolkit';
import {getAuthor, getObject, getCommunity, getGroups} from './api.js'

export const setCommunity = createAction('SET_COMMUNITY')
export const setCommunityId = createAction('SET_COMMUNITY_ID')
export const setViewId = createAction('SET_VIEW_ID')
export const setAuthor = createAction('SET_AUTHOR')
export const setView = createAction('SET_VIEW')
export const editCommunity = createAction('EDIT_COMMUNITY')
export const dateFormatOptions = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: true
};

const initState = {
    communityId: sessionStorage.getItem('communityId'),
    viewId: sessionStorage.getItem('viewId'),
    contextId: '',
    // communityId: '5e445735d525b936837f7450',
    author: {},
    view: null,
    community: null
}

export const globalsReducer = createReducer(initState, {
    [setCommunityId]: (state, action) => {
        state.communityId = action.payload
    },
    [setViewId]: (state, action) => {
        state.viewId = action.payload
    },
    [setAuthor]: (state, action) => {
        state.author = action.payload
    },
    [setView]: (state, action) => {
        state.view = action.payload
    },
    [setCommunity]: (state, action) => {
        state.community = action.payload
        state.contextId = action.payload.rootContextId
    },
    [editCommunity]: (state, action) => {
        state.community = {...state.community, ...action.payload}
    }
});

export const fetchAuthor = (communityId) => {
    return dispatch => {
        return getAuthor(communityId).then( res => {
            dispatch(setAuthor(res.data));
        })
    }
}

export const fetchView = (viewId) => {
    return dispatch => {
        return getObject(viewId).then( res => {
            dispatch(setView(res.data))
        })
    }
}

export const fetchCommunity = (communityId) => {
    return dispatch => {
        return getCommunity(communityId).then( res => {
            dispatch(setCommunity(
                {groups: [], ...res.data}
            ))
        })
    }
}

export const fetchCommGroups = (communityId) => async (dispatch) => {
    const groups = await getGroups(communityId)
    dispatch(editCommunity({groups}))
}
