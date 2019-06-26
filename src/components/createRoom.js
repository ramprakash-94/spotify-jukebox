import React from 'react'
import {connect} from 'react-redux'
import {handleCreateUser} from '../actions/rootActions'
import {handleCreateRoom } from '../actions/serverActions'

function mapDispatchToProps(dispatch) {
    return {
      setGlobalState: (state) => dispatch(updateGlobalPlayerState(state))
    };
  }

const updateGlobalPlayerState = (state) => (Object.assign({}, state, {
            "type": "UPDATE_PLAYER",
            "loggedIn": true
            }))

// function updateGlobalPlayerState(state){
//   console.log(state)
//     return dispatch => {
//             dispatch(Object.assign({}, state, {
//             "type": "UPDATE_PLAYER",
//             "loggedIn": true
//             }))
//         }
//     }
class CreateRoom extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            token: "",
            deviceId: "",
            loggedIn: false,
            owner: false,
            error: "",
            trackName: "Track Name",
            artistName: "Artist Name",
            albumName: "Album Name",
            playing: false,
            position: 0,
            duration: 0,
            roomNumber: null,
            userId: null,
            playlistId: null,
            queue: [],
            playerCheckInterval: null
        }
        this.playerCheckInterval = null;
        this.updateStateTimeout = null;
        this.sendTokenToLogin = this.sendTokenToLogin.bind(this)
    }

    componentWillUnmount(){
      clearInterval(this.playerCheckInterval)
      clearTimeout(this.updateStateTimeout)
      console.log()
    }

    getDate(){
      let now = new Date();

      let hours = now.getHours()
      let min = now.getMinutes()
      let seconds = now.getSeconds()
      return "Time: " + hours + " : " + min + " : " + seconds
    }
    sendTokenToLogin(){
        this.handleLogin()
    }
    async handleLogin() {
        if (this.state.token !== "") {
          const userId = await handleCreateUser(this.state.token)
          const {roomNumber, playlistId} = await handleCreateRoom(userId)
          this.setState({ loggedIn: true, owner: true, userId: userId, roomNumber: roomNumber, playlistId: playlistId});
          // this.playerCheckInterval = await setInterval(() => this.checkForPlayer(), 1000);
      
          console.log("Local state updated")
          this.updateStateTimeout = setTimeout(() => {
            console.log(this.state)
            this.props.setGlobalState(this.state)
          }, 1000)
        }
    }

  // checkForPlayer() {
  //   const { token } = this.state;
  //   console.log("Checking Player at " + this.getDate())
  
  //   if (window.Spotify !== null) {
  //     this.player = new window.Spotify.Player({
  //       name: "Spotify Jukebox",
  //       getOAuthToken: cb => { cb(token); },
  //     });
  //     // this.createEventHandlers();
  
  //     clearInterval(this.playerCheckInterval);
  //     // finally, connect!
  //     this.player.connect();
  //     this.setState({
  //       token: token,
  //       player: this.player
  //     })
  //   }
  // }

  // createEventHandlers() {
  //   this.player.on('initialization_error', e => { console.error(e); });
  //   this.player.on('authentication_error', e => {
  //     console.error(e);
  //     this.setState({ loggedIn: false });
  //   });
  //   this.player.on('account_error', e => { console.error(e); });
  //   this.player.on('playback_error', e => { console.error(e); });
  
  //   // Playback status updates
  //   this.player.on('player_state_changed', state => this.onStateChanged(state));
  
  //   // Ready
  //   this.player.on('ready', async data => {
  //     let { device_id } = data;
  //     console.log("Let the music play on!");
  //     await this.setState({ deviceId: device_id, player: this.player });
  //     this.transferPlaybackHere();
  //   });
  // }

  //  async onStateChanged(state) {
  //   // if we're no longer listening to music, we'll get a null state.
  //   if (state !== null) {
  //     const {
  //       current_track: currentTrack,
  //       position,
  //       duration,
  //     } = state.track_window;
  //     const trackName = currentTrack.name;
  //     const albumName = currentTrack.album.name;
  //     const artistName = currentTrack.artists
  //       .map(artist => artist.name)
  //       .join(", ");
  //     const playing = !state.paused;
  //     await this.setState({
  //       position,
  //       duration,
  //       trackName,
  //       albumName,
  //       artistName,
  //       playing,
  //     });
  //     console.log(this.state)
  //   }
  //   // return state stuff
  // }
  
  //  transferPlaybackHere() {
  //   const { deviceId, token } = this.state;
  //   fetch("https://api.spotify.com/v1/me/player", {
  //     method: "PUT",
  //     headers: {
  //       authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       "device_ids": [ deviceId ],
  //       "play": false,
  //     }),
  //   });
  // }

    render(){
        return (
            <div className="create-room">
                <h3>Create a Room</h3>
                <p className="App-intro">
                    Enter your Spotify access token. Get it from{" "}
                    <a href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">
                    here
                    </a>.
                </p>
                <p>
                    <input className="sign-in-input" type="text" value={this.props.token} onChange={e => this.setState({ token: e.target.value })} />
                </p>
                <p>
                    <button className="go-button" onClick={() => this.sendTokenToLogin()}>Go</button>
                </p>
            </div>
        )
    }

}

export default connect(null, mapDispatchToProps)(CreateRoom) 