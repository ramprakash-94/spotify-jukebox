import React from "react";
import { slide as Menu } from "react-burger-menu";
import { BrowserRouter as Router, Route, Link, NavLink} from "react-router-dom";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux'

function mapStateToProps(state){
    return state
}

class Sidebar extends React.Component{
  constructor(props){
    super(props)
    this.goToQueueManager = this.goToQueueManager.bind(this)
  }
  goToQueueManager(){
    this.props.history.push(`/room/${this.props.roomNumber}/queue`)

  }
  render(){
    return (
      <Menu {...this.props}>
        <Router>
            {/* <NavLink className="menu-item" to="/room">Home</NavLink>
            <NavLink className="menu-item" to="/">Root</NavLink>
            <NavLink className="menu-item" to="/tv"><p>Full Screen Player</p></NavLink>
            <NavLink className="menu-item" to="/room/1"><p>Room 1</p></NavLink> */}
            {
              this.props.roomNumber ?
              <p className="room-item" onClick={this.goToQueueManager}>Manage Queue</p>
              :
              <p></p>
            }
        </Router>
      </Menu>
    );
  }
}

export default withRouter(connect(mapStateToProps)(Sidebar))