import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import RoomContainer from './containers/RoomContainer';
import Home from './components/home'
import FullScreenPlayer from './containers/FullScreenPlayer';
import QueueManager from './containers/QueueManager';

export const Routes = () => {
    return (
        <div>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/room"/>
                </Route>
                <Route exact path="/room/:rid/queue" component={QueueManager}/>
                <Route exact path="/room/:rid" component={Home} />
                <Route exact path="/room" component={RoomContainer} />
                {/* <Route exact path="/tv" component={FullScreenPlayer}/> */}
            </Switch>
        </div>
    )
}