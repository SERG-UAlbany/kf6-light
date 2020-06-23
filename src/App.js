import React, {useEffect} from 'react';
import { HashRouter as Router, Route} from 'react-router-dom';
import ReactNotification from 'react-notifications-component';

import Login from './Account/Login';
import SignUp from './Account/SignUp';
import CommunityManager from './CommunityManager/CommunityManager';
import TopNavbar from './TopNavBar/TopNavbar';
import View from './View/View';
import NewNote from './components/newNote/NewNote'
import ChangePassword from './Account/ChangePassword';
import TestComponent from './components/test/TestComponent'
import { setToken } from './store/api.js'

import 'react-notifications-component/dist/theme.css'
import './App.css';

function App() {

    useEffect(()=> {
        const token = sessionStorage.getItem('token');
        if (token){
            setToken(token)
        }
    })

    return (
        <div>
            <ReactNotification />
            <TopNavbar></TopNavbar>
            <Router>
                <Route exact path="/" component={Login}>
                </Route>
                <Route path="/signup" component={SignUp}>
                </Route>
                <Route path="/community-manager" component={CommunityManager}>
                </Route>
                <Route path="/view" component={View}>      
                </Route>
                <Route path="/new-note" component={NewNote}>
                </Route>
                <Route path="/change-password" component={ChangePassword}>      
                </Route>
                <Route path="/test" component={TestComponent}>
                </Route>
            </Router>
        </div>
    );
}

export default App;
