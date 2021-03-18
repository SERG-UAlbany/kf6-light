import React, { useEffect, useContext } from 'react';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
import  { BreakpointProvider } from 'react-socks';

import Login from './Account/Login';
import SignUp from './Account/SignUp';
import CommunityManager from './CommunityManager/CommunityManager';
import TopNavbar from './TopNavBar/TopNavbar';
import View from './View/View';
import NewNote from './components/newNote/NewNote'
import ChangePassword from './Account/ChangePassword';
import TestComponent from './components/test/TestComponent';
import { setToken } from './store/api.js';
import { useDispatch } from 'react-redux';
import { fetchLoggedUser } from './store/globalsReducer.js'
import { WebSocketContext } from './WebSocket.js'

import 'react-notifications-component/dist/theme.css'
import './App.css';

function App() {

    const dispatch = useDispatch();
    const ws = useContext(WebSocketContext);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            setToken(token)
            dispatch(fetchLoggedUser())
            ws.openConnection();
        }
    })

    return (
        <BreakpointProvider>
            <div>
                <ReactNotification />
                <Router>
                    <TopNavbar></TopNavbar>
                    <Switch>
                        <Route exact path="/" component={Login}>
                        </Route>
                        <Route path="/signup" component={SignUp}>
                        </Route>
                        <Route path="/community-manager" component={CommunityManager}>
                        </Route>
                        <Route path="/view/:viewId" component={View}>
                        </Route>
                        <Route path="/new-note" component={NewNote}>
                        </Route>
                        <Route path="/change-password" component={ChangePassword}>
                        </Route>
                        <Route path="/test" component={TestComponent}>
                        </Route>
                    </Switch>
                </Router>
            </div>
        </BreakpointProvider>
    );
}

export default App;
