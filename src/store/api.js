import axios from 'axios';

export const url = 'https://kf6-stage.ikit.org'
// export const url = "http://localhost:8000"
export const apiUrl = `${url}/api`;


export function setToken(token) {
    console.log("Setting token")
    axios.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;
}

export const removeToken = () => {
    delete axios.defaults.headers.common.Authorization
}


const token = sessionStorage.getItem('token');
if (token){
    setToken(token)
}

//Contribution
export const postContribution = (communityId, obj) => {
    return axios.post(`${apiUrl}/contributions/${communityId}`, obj);//, {mode: 'cors'});
}

//Community
export const getCommunity = (communityId) => {
    return axios.get(`${apiUrl}/communities/${communityId}`);//, {mode: 'cors'});
}
export const getGroups = async (communityId) => {
    return (await axios.get(`${apiUrl}/communities/${communityId}/groups`)).data
}

//Links
export const getLinks = async (objectId, direction, type) => {
    let links = await axios.get(`${apiUrl}/links/${direction}/${objectId}`);
    links = links.data;
    if (type) {
        links = links.filter(function (each) {
            return each.type === type;
        });
    }
    return links
}

export const postLink = async (fromId, toId, type, data) => {
    return (await axios.post(`${apiUrl}/links`, {from: fromId, to: toId, type:type, data:data})).data
}

export const deleteLink = async (linkId) => {
    return (await axios.delete(`${apiUrl}/links/${linkId}`).data)
}

//Object
export const getObject = (objectId) => {
    return axios.get(`${apiUrl}/objects/${objectId}`);
}

export const putObject = async (object, communityId, objectId) => {
    return (await axios.put(`${apiUrl}/objects/${communityId}/${objectId}`, object)).data
}

//Record
export const read = (communityId, objectId) => {
    return axios.post(`${apiUrl}/records/read/${communityId}/${objectId}`)
}

export const postAttachment = (communityId, authorId) => {
    var newobj = {
        communityId: communityId,
        type: 'Attachment',
        title: 'an Attachment',
        authors: [authorId],
        status: 'unsaved',
        permission: 'protected',
        data: {
            version: 0
        }
    };
    return axios.post(`${apiUrl}/contributions/${communityId}`, newobj)
}

export const postContribObject = async (communityId, obj) => {
    return (await axios.post(`${apiUrl}/contributions/${communityId}`, obj)).data
}

//Author
export const getAuthor = (communityId) => {
    return axios.get(`${apiUrl}/authors/${communityId}/me`)
}
export const getCommunityAuthors = async (communityId) => {
    return (await axios.get(`${apiUrl}/communities/${communityId}/authors`)).data
}

//Records
export const getRecords = async (contribId) => {
    return (await axios.get(`${apiUrl}/records/object/${contribId}`)).data
}

export const uploadFile = (file, onProgress) => {
    var formData = new FormData();
    formData.append("file", file);
    return axios.post(`${apiUrl}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            // ...config.headers
        },
        onUploadProgress: onProgress,
    })
}

// export default {url, apiUrl, postContribution, getCommunity,
//                 getLinks, getObject, createAttachment,
//                 getAuthor, uploadFile, putObject,
//                 postLink, deleteLink, getCommunityAuthors,
//                 getRecords, read
//                }
