import React from 'react'
import Home from '../components/home'
import Login from '../components/login'
import {connect} from 'react-redux'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import { handleCreateRoom, handleJoinRoom } from '../actions/serverActions';
import { Redirect } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import GuestHome from '../components/guestHome'
import RoomList from '../components/roomList';

function mapStateToProps(state){
  return {
    loggedIn: state.loggedIn,
    userId: state.userId
  }
}

function mapDispatchToProps(dispatch) {
    return {
      updateRoomInfo: (state) => dispatch(updateRoomInfo(state))
    };
  }

const updateRoomInfo = (state) => (Object.assign({}, state, {
            "type": "UPDATE_ROOM"
}))

class RoomContainer extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            click: false,
            loading: false,
            loaded: false
        }
        console.log(this.props)
        this.handleClick = this.handleClick.bind(this)
        this.createRoomClick = this.createRoomClick.bind(this)
        this.joinRoomClick = this.joinRoomClick.bind(this)
    }

    componentDidMount(){
        console.log('Room Mounted')
        this.props.updateRoomInfo({
            loading: false
        })
    }

    async handleClick(userType){
        this.setState({
            loading: true,
            click: true
        })
        if (userType === "owner"){
            await this.createRoomClick()
            this.setState({
                loaded: true,
                owner: true
            })
        }
        else if (userType === "guest"){
            await this.joinRoomClick()
            this.setState({
                loaded: true,
                owner: false
            })
        }
    }
    async createRoomClick(){
        Promise.resolve(handleCreateRoom(this.props.userId))
            .then((data) => {
                console.log("Room Created")
                console.log(data)
                if (data.errors){
                    this.props.updateRoomInfo({
                        createRoomError: true
                    })
                }
                else{
                    const rooms = data.data.createRoom
                    // this.props.updateRoomInfo({
                    //     roomId: room.id,
                    //     roomNumber: room.number,
                    //     playlistId: room.playlists[0].id,
                    //     tracks: room.playlists[0].tracks,
                    //     playing: room.playing,
                    //     duration: room.duration,
                    //     position: room.position,
                    //     currentTrack: room.currentTrack
                    // })
                    this.props.updateRoomInfo({
                        rooms: rooms,
                        createRoomError: false
                    })

                }
        })        
    }

    async joinRoomClick(){
        Promise.resolve(handleJoinRoom(this.roomNumber.value))
            .then((data) => {
                console.log(data)
                const room = data.data.room
                this.props.updateRoomInfo({
                    roomId: room.id,
                    roomNumber: room.number,
                    playlistId: room.playlists[0].id,
                    currentTrack: room.currentTrack
                })
        })
    }

    goToRoom(){
        const num = this.roomNumber.value
        Promise.resolve(this.props.updateRoomInfo({
            joinAsGuest: num
        })).then(() =>
            this.props.history.push(`/room/${num}`)
        )
    }

    render(){
        const {click, loading, loaded, owner} = this.state
        // if (loaded & owner){
        //     return <Home owner={owner}/>
        // }
        // if (loaded & !owner){
        //     return <GuestHome owner={owner}/>
        // }
        return (
            <div className="home-container">
                <div className="row">
                    <div className="col-lg-6 create-room">
                        <button className="spotify-login-button" onClick={() => this.handleClick("owner")}>Create Room</button>
                        <RoomList/>
                    </div>
                    <div className="col-lg-6 join-room">
                        <div className="row">
                            <input 
                                type="text"
                                id="join-room"
                                placeholder="Room Number"
                                ref={input => this.roomNumber = input}
                                />
                        </div>
                        <div className="row">
                            <button className="spotify-login-button" onClick={() => this.goToRoom()}>Join Room</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RoomContainer)