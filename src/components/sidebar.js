import React from "react";
import { slide as Menu } from "react-burger-menu";
import { BrowserRouter as Router, Route, Link, NavLink} from "react-router-dom";
import {withRouter} from 'react-router-dom';

class Sidebar extends React.Component{
  constructor(props){
    super(props)
    this.goToRoom = this.goToRoom.bind(this)
  }
  goToRoom(num){
    this.props.history.push(`/room/3`)
  }
  render(){
    return (
      <Menu {...this.props}>
        <Router>
            <NavLink className="menu-item" to="/room">Home</NavLink>
            <NavLink className="menu-item" to="/">Root</NavLink>
            <NavLink className="menu-item" to="/tv"><p>Full Screen Player</p></NavLink>
            <NavLink className="menu-item" to="/room/1"><p>Room 1</p></NavLink>
            <p className="room-item" onClick={this.goToRoom}>Room 3</p>
        </Router>
      </Menu>
    );
  }
}

export default withRouter(Sidebar)