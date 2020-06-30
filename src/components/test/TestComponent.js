import React, {useEffect} from 'react';
import AttachArea from '../attachmentArea/AttachArea.js'
import AttachPanel from '../attachmentCollapse/AttachPanel.js'
import { useSelector, useDispatch } from 'react-redux';
import { fetchAuthors } from '../../store/userReducer.js'

const TestComponent= props => {
    const note = {id: 1, title:'hola', content: 'asdf', attachments: []}
    const communityId = useSelector((state) => state.globals.communityId)
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('use effect')
        dispatch(fetchAuthors(communityId))
        /* dispatch(fetchAuthor(communityId)); */
    }, [dispatch, communityId]);

    return (
        <div style={{marginTop: '100px'}}>
            <AttachArea note={note}></AttachArea>
            <AttachPanel></AttachPanel>
        </div>
    )

};

export default TestComponent;
