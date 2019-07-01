import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom';

function mapStateToProps(state){
  return {
      loggedIn: state.loggedIn,
      player: state.player
  }
}

function mapDispatchToProps(dispatch) {
    return {
      logout: (push) => {
        dispatch({
        loggedIn: false,
        token: null,
        type: "LOGOUT" 
      })
      push('/')
    }
  }
}

class NavBar extends React.Component{
    constructor(props){
        super(props)
        this.logout = this.logout.bind(this)
    }

    logout = () => {
        if(this.props.player){
            this.props.player.disconnect()
        }
        this.props.logout(this.props.history.push)
    }

    render(){
        return (
                <div className="container">
                    {
                    this.props.loggedIn ?
                    <div className="row page-header">
                        <div className='btn-toolbar pull-right'>
                        <div className='btn-group'>
                            <button className='btn logout-button btn-outline pull-right' onClick={this.logout}>Logout</button>
                        </div>
                        </div>
                        <span><h1>Spotify Jukebox</h1></span>
                    </div>
                    :
                    <div className="row">
                        <h1>Spotify Jukebox</h1>
                    </div>
                    }
                </div>
        )
        
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavBar))