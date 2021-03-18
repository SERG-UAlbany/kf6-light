import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import store from './store/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import WebSocketProvider from './WebSocket.js'

ReactDOM.render(
    <Provider store={store}>
        <WebSocketProvider>
            <App />
        </WebSocketProvider>
    </Provider>,
    document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
