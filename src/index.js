import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import HttpsRedirect from 'react-https-redirect'
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'
import { Provider } from "react-redux";
import store from './store'
import HomeContainer from './containers/LoginContainer';
import RoomContainer from './containers/RoomContainer';

const routing = (
    <HttpsRedirect>
        <Provider store={store}>
            <App/>
        </Provider>
    </HttpsRedirect>
  )

ReactDOM.render(routing, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
