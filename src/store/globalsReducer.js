import { createAction, createReducer } from '@reduxjs/toolkit'
import { getObject, getCommunity, getGroups, getUser, getAuthor, getCommunityViews, getCommunities,  getUserCommunities} from './api.js'
import { fetchAuthors } from './userReducer.js';
import { fetchScaffolds } from  './scaffoldReducer.js'
import { fetchViewNotes, fetchBuildsOn, setCheckedNotes, fetchSupports } from './noteReducer.js'
export const setGlobalToken = createAction('SET_TOKEN')
export const setCommunity = createAction('SET_COMMUNITY')
export const setCommunityId = createAction('SET_COMMUNITY_ID')
export const setViewId = createAction('SET_VIEW_ID')
export const setLoggedUser = createAction('SET_AUTHOR')
export const setView = createAction('SET_VIEW')
export const setAuthor = createAction('SET_AUTHOR')
export const setViews = createAction('SET_VIEWS')
export const editCommunity = createAction('EDIT_COMMUNITY')
export const setUserId = createAction('SET_USERID')
export const setIsAuthenticated = createAction('SET_ISAUTHENTICATED')
export const setCommunities = createAction('SET_COMMUNITIES')
export const setUserCommunities = createAction('SET_USER_COMMUNITIES')
export const dateFormatOptions = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: true
};

const initState = {
    token: sessionStorage.getItem("token"),
    communityId: null,
    viewId: null,
    contextId: '',
    user: null,
    view: null,
    views: [],
    community: null,
    userId: '',
    isAuthenticated: sessionStorage.getItem("token") ? true: false,
    communities: [],
    userCommunities: [],
    servers: [
        {
            id: 0,
            key: "kf6.ikit.org",
            value: "https://kf6.ikit.org"

        },
        {
            id: 1,
            key: "kf6-stage.ikit.org",
            value: "https://kf6-stage.ikit.org"

        },
        {
            id: 2,
            key: "kf6-stage.rit.albany.edu",
            value: "https://kf6-stage.rit.albany.edu"

        },
        {
            id: 3,
            key: "kf.rdc.nie.edu.sg",
            value: "https://kf.rdc.nie.edu.sg"

        },
        // {
        //     id: 4,
        //     key: "localhost 9000",
        //     value: "http://localhost:9000"

        // },
    ]
}

export const globalsReducer = createReducer(initState, {
    [setGlobalToken]: (state, action) => {
        state.token = action.payload
        state.isAuthenticated = state.token ? true : false
    },
    [setIsAuthenticated]: (state, action) => {
        state.isAuthenticated = state.token ? true : false
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
    [setLoggedUser]: (state, action) => {
        state.user = action.payload
    },
    [setView]: (state, action) => {
        state.view = action.payload
    },
    [setViews]: (state, action) => {
        state.views = action.payload
    },
    [setCommunity]: (state, action) => {
        state.community = action.payload
        state.communityId = action.payload._id
        state.contextId = action.payload.rootContextId
    },
    [editCommunity]: (state, action) => {
        state.community = { ...state.community, ...action.payload }
    },
    [setCommunities]: (state, action) => {
        state.communities = action.payload
    },
    [setUserCommunities]: (state, action) => {
        state.userCommunities = action.payload
    },
    [setAuthor]: (state, action) => {
        state.author = action.payload
    },
});

export const fetchAuthor = (communityId) => {
    return dispatch => {
        console.log("Fetch author")
        return getAuthor(communityId).then(res => {
            dispatch(setAuthor(res.data));
        })
    }
}
export const fetchCommunities = () => {
    return async dispatch => {
        const communities = await getCommunities()
        dispatch(setCommunities(communities))
    }
}

export const fetchUserCommunities = () => {
    return async dispatch => {
        const communities = await getUserCommunities()
        dispatch(setUserCommunities(communities))
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

export const fetchLoggedUser = () => async (dispatch) => {
    const user = await getUser()
    dispatch(setUserId(user._id))
    dispatch(setLoggedUser(user))
}

export const fetchCommunityViews = (communityId) => async (dispatch) => {
    const views = await getCommunityViews(communityId)
    dispatch(setViews(views))
}

export const fetchViewCommunityData = (viewId) => async (dispatch) => {

    //GET LIST OF ALL COMMUNITIES
    dispatch(fetchCommunities())
    //GET USER'S REGISTERED COMMUNITIES
    // dispatch(fetchUserCommunities())
    dispatch(setCheckedNotes([]))
    const view = await getObject(viewId)
    dispatch(setView(view))
    dispatch(setViewId(view._id))
    dispatch(fetchViewNotes(view._id))
    const commId = view.communityId
    const community = (await getCommunity(commId)).data
    dispatch(setCommunity(
        { groups: [], ...community }
    ))
    dispatch(fetchBuildsOn(commId))
    dispatch(fetchAuthor(commId))
    dispatch(fetchCommunityViews(commId))
    dispatch(fetchAuthors(commId))
    dispatch(fetchScaffolds(commId, community.rootContextId))
    dispatch(fetchSupports(commId))
}
