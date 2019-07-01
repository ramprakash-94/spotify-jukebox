import React from 'react'
import {connect} from 'react-redux'
import SearchBar from './searchBar';
import SearchResults from './searchResults';
import Queue from './queue'
import {popTrack, getAllTracks} from '../actions/rootActions'
import {addToPlaylist, updateRoom} from '../actions/serverActions'
import Player from './player'

function mapStateToProps(state){
    return state
}

function mapDispatchToProps(dispatch) {
    return {
      updateTracks: (state) => dispatch(updateTracks(state)),
      updatePlayer: (state) => dispatch(updatePlayer(state))
    };
  }

const updateTracks = (state) => (Object.assign({}, state, {
            "type": "UPDATE_TRACKS"
}))

const updatePlayer = (state) => (Object.assign({}, state, {
            "type": "UPDATE_PLAYER"
}))

class Home extends React.Component{
    constructor(props){
        super(props)
        this.playerCheckInterval = null
        console.log(this.props)
        this.createPlaylist = this.createPlaylist.bind(this)
        this.updateTracks = this.updateTracks.bind(this)
        this.playTrack = this.playTrack.bind(this)
        this.changeTrack = true
    }

    componentDidMount(){
      this.handleEntryPoint()
    }

    componentDidUpdate(){
      const {duration, position, currentTrack, playing, trackURI} = this.props
      if (duration - position <= 1000 & !playing & this.changeTrack){
        this.playNextTrack()
        this.changeTrack = false
      }

      if (currentTrack === trackURI | this.props.roomNumber === null){
        return
      }

      updateRoom(
        this.props.roomNumber, 
        trackURI, 
        position,
        duration,
        playing,
        this.props.token)

      this.changeTrackTimeout = setTimeout(() => this.changeTrack = true, 3000)
    }
    updateTracks(tracks){
      this.props.updateTracks({
        "queue": tracks
      })
    }

    handleEntryPoint = async() => {
        if (this.props.owner === true){
          this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
        }
        let currentTrack = null
        let tracks = null
        this.updateStateTimeout = setInterval(() => {
            getAllTracks(this.props.playlistId).then(function(data){
              tracks = data.data.allTracksInPlaylist.tracks
            })
            if (tracks !== null){
              this.updateTracks(tracks)
            }
          }, 5000)

        const {position, duration, playing} = this.props
        let newPos = null
        if (newPos !== null){
          this.props.updatePlayer({
            position: newPos
          })
        }

        // this.setState({
        //   queue: tracks
        // })
    }
  onPrevClick() {
    this.props.player.previousTrack();
  }
  
  onPlayClick() {
    this.props.player.togglePlay();
  }
  
  onNextClick() {
    // this.player.nextTrack();
    this.playNextTrack()
  }

  playNextTrack(){
    const {queue} = this.props
    if (queue !== undefined & queue.length > 0){
      const track = queue[0]
      let tracks = []
        popTrack(this.props.playlistId).then(function(data){
            tracks = data.data.popTrack.tracks
        })
      this.props.updateTracks(tracks)
      this.playTrack(track.uri)

      // this.setState({
      //   queue: tracks
      // })
    }
  }

  playTrack(uri){
    const { deviceId, token } = this.props;
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "uris": [uri]
      }),
    })
    }

  checkForPlayer() {
    const { token } = this.props;
    // console.log("Checking Player at " + this.getDate())
  
    if (window.Spotify !== null) {
      let player = new window.Spotify.Player({
        name: "Spotify Jukebox",
        getOAuthToken: cb => { cb(token); },
      });
      this.props.updatePlayer({
        player: player
      })
      this.createEventHandlers();
  
      clearInterval(this.playerCheckInterval);
      // finally, connect!
      player.connect();
    }
  }

  createEventHandlers() {
    const {player} = this.props
    player.on('initialization_error', e => { console.error(e); });
    player.on('authentication_error', e => {
      console.error(e);
      this.setState({ loggedIn: false });
    });
    player.on('account_error', e => { console.error(e); });
    player.on('playback_error', e => { console.error(e); });
  
    // Playback status updates
    player.on('player_state_changed', state => this.onStateChanged(state));
  
    // Ready
    player.on('ready', async data => {
      let { device_id, user_id} = data;
      console.log("Let the music play on!");
      // await this.setState({ deviceId: device_id, player: this.player });
      this.props.updatePlayer({
        "deviceId": device_id,
        "player": player
      })
      this.transferPlaybackHere();
      // this.playPlaylist("spotify:playlist:3c16xCB2ulN8s9VS3zCqck")
    });
  }

   onStateChanged(state) {
    // if we're no longer listening to music, we'll get a null state.
    // console.log("State change noticed")
    if (state !== null) {
      const { current_track: currentTrack, } = state.track_window;
      const position = state.position
      const duration = state.duration
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const albumArt = currentTrack.album.images[0].url
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(", ");
      const trackURI = currentTrack.uri
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
        trackURI,
        albumArt
      });
      this.props.updatePlayer({
        position: position,
        duration: duration,
        trackName: trackName,
        albumName: albumName,
        artistName: artistName,
        playing: playing,
        trackURI: trackURI,
        albumArt: albumArt
      })
    }
    // return state stuff
  }
  
   transferPlaybackHere() {
     console.log("Transferring playback")
    const { deviceId, token } = this.props;
    fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "device_ids": [ deviceId ],
        "play": false,
      }),
    });
  }

  searchURI = async searchQuery =>{
    const {token } = this.props;
    const items = [];
    await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=5`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      data.tracks.items.map(function(item){
        items.push(item);
        return item;
      });
    })
    .catch(function (error){
      console.log(error);
    });

    this.setState({
      searchResults: items
    });
  }

  getUserInfo = async () => {
    const {token } = this.props;
    let user_id = null;
    await fetch(`https://api.spotify.com/v1/me`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
        user_id = data.id
    })
    .catch(function (error){
      console.log(error);
    });

    await this.setState({
        user_id: user_id
    })
  }

  addToQueue = async(songUri) => {
        let tracks = null
        await Promise.resolve(addToPlaylist(this.props.playlistId, songUri, this.props.token))
            .then((data) => {
              tracks = data.data.insertTrack.tracks
        })  
        this.props.updateTracks({"queue": tracks})
        // this.setState({
        //   queue: tracks
        // })
  }



  createPlaylist = async () => {
    const {token, userId, roomNumber} = this.props;
    let playlistURI = null
    let playlistId = null
    await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": "Jukebox Room " + roomNumber,
        "public": true
      }),
    }).then(response => response.json())
    .then(function(data){
        playlistURI = data.uri
        playlistId = data.id
    })
    .catch(function (error){
      console.log(error);
    });

    this.setState({
        playlistId: playlistId,
        playlistURI: playlistURI
    })
  }


    render(){
        return (
            <div className="home-page">
                <div className="row main">
                  <div className="row">
                      <h3> Room {this.props.roomNumber}</h3>
                  </div>
                  <div className="row search-queue">
                    <div className="search col-6 col-lg-6">
                      <div className="row">
                        <SearchBar token={this.props.token}/>
                      </div>
                      <div className="row">
                        <SearchResults results={this.props.searchResults} addToQueue={this.addToQueue} queue={this.props.queue}/>
                      </div>
                    </div>
                    <div className="queue col-6 col-lg-6">
                      <Queue playTrack={this.playTrack} queue={this.props.queue} owner={this.props.owner}/>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <Player/>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)