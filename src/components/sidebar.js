import React from "react";
import { push as Menu } from "react-burger-menu";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

export default props => {
    return (
      <Menu {...props}>
        <Router>
            <Link className="menu-item" to="/room">Home</Link>
            <Link className="menu-item" to="/">Root</Link>
        </Router>
      </Menu>
    );
  };