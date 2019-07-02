import React from "react";
import { push as Menu } from "react-burger-menu";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

export default props => {
    return (
      <Menu {...props}>
        <Router>
            <Link className="menu-item" to="/room">Home</Link>
            <Link className="menu-item" to="/">Root</Link>
            <Link className="menu-item" to="/tv"><p>Full Screen Player</p></Link>
            <Link className="menu-item" to="/room/1"><p>Room 1</p></Link>
        </Router>
      </Menu>
    );
  };