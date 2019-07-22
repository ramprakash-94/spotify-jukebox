import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom';

function mapStateToProps(state){
  return {
      loggedIn: state.loggedIn,
      player: state.player,
      roomNumber: state.roomNumber,
      owner: state.owner,
      manageTracks: state.manageTracks
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
        },
        leaveRoom: (push) => {
            dispatch({
                loggedIn: true,
                roomId: null,
                roomNumber: null,
                admin: null,
                playlistId: null,
                currentTrack: null,
                owner: null,
                type: "LEAVE_ROOM",
                joinAsGuest: null,
                player: null
            })
            push('/room')
        }
    }
}

class NavBar extends React.Component{
    constructor(props){
        super(props)
        this.logout = this.logout.bind(this)
        this.leaveRoom = this.leaveRoom.bind(this)
    }

    logout = () => {
        if(this.props.player !== null & this.props.owner === true){
            this.props.player.disconnect()
        }
        this.props.logout(this.props.history.push)
    }

    leaveRoom = () => {
        if(this.props.player !== null & this.props.owner === true){
            this.props.player.disconnect()
        }
        this.props.leaveRoom(this.props.history.push)
    }

    fullScreen = () => {
        this.props.history.push('/tv')
    }

    leaveToRoom = () => {
        this.props.history.push(`/room/${this.props.roomNumber}`)
    }

    render(){
        return (
                <div className="container">
                    {
                    this.props.loggedIn ?
                    <div className="row page-header">
                        <span><h1>Spotify Jukebox</h1></span>
                        <div className='btn-toolbar pull-right'>
                        <div className='btn-group'>
                            {
                                this.props.manageTracks ?
                                <button className='btn logout-button btn-outline pull-right' onClick={this.leaveToRoom}>Back to Room</button>
                                :
                                <div></div>
                            }
                            <button className='btn logout-button btn-outline pull-right' onClick={this.logout}>Logout</button>
                            {
                                this.props.roomNumber ?
                                <button className='btn logout-button btn-outline pull-right' onClick={this.leaveRoom}>Leave Room</button>
                                :
                                <div></div>
                            }
                            {/* <button className='btn logout-button btn-outline pull-right' onClick={this.fullScreen}>Full Screen</button> */}
                        </div>
                        </div>
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