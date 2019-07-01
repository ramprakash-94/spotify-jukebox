import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import RoomContainer from './containers/RoomContainer';

export const Routes = () => {
    return (
        <div>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/room"/>
                </Route>
                <Route exact path="/room" component={RoomContainer} />
            </Switch>
        </div>
    )
}