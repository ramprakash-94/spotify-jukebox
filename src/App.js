import React from 'react';
import './App.css';

import {
  BrowserRouter as Router,
} from 'react-router-dom'

import {connect} from 'react-redux'
import LoginContainer from './containers/LoginContainer';
import NavBar from './components/navbar'
import { Routes } from './Routes';
import './sidebar.css'
import SideBar from "./components/sidebar";


function mapStateToProps(state){
  return state
}


class App extends React.Component {
  constructor(props) {
    super(props);

    if (document.location.pathname === '/.well-known/acme-challenge/gTJcLVLa4IrM5kir_fk6CBrrrqLwuqUbhuHtgefQJdc') {
      const text = "gTJcLVLa4IrM5kir_fk6CBrrrqLwuqUbhuHtgefQJdc.PuwB8unGT8GfGGdjgLjyjjaZI-kpzsrVRedEq-95cF0"
      document.documentElement.innerHTML = text
      var newDoc = document.open("html", "replace");
      newDoc.write(text);
      newDoc.close();
    }
    this.state = {
      menuOpen: false
    }
  }
  componentDidMount(){
  }

  handleStateChange (state) {
    this.setState({menuOpen: state.isOpen})  
  }


  render() {
    if (!this.props.loggedIn){
      return (
        <div className="App container navbar">
          <Router>
              <NavBar/>
              <LoginContainer/>
          </Router>
        </div>
      )
    }
    
    return (
      <div id="App">
        <Router>
          {/* <SideBar 
            isOpen={this.state.menuOpen}
            pageWrapId={"page-wrap"} 
            outerContainerId={"App"} />  */}
          <div className="App container">
              <div id="page-wrap">
                <NavBar/>
                <Routes/>
              </div>
          </div>
        </Router>
      </div>
    )
  }
}

export default connect(mapStateToProps)(App)
