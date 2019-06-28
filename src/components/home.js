import React from 'react'
import {connect} from 'react-redux'
import SearchBar from './searchBar';
import SearchResults from './searchResults';
import Queue from './queue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {popTrack, getAllTracks, handleJoinRoom} from '../actions/rootActions'
import gql from 'graphql-tag'
import {addToPlaylist, updateRoom} from '../actions/serverActions'

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
    }

    componentDidMount(){
      this.handleEntryPoint()
    }

    componentDidUpdate(){
      const {duration, position, currentTrack, playing, trackURI} = this.props
      if (duration - position <= 1000){
        console.log("Next song")
        this.playNextTrack()
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
              console.log(data)
              tracks = data.data.allTracksInPlaylist.tracks
            })
            if (tracks !== null){
              this.updateTracks(tracks)
            }
          }, 5000)

        // this.setState({
        //   queue: tracks
        // })
    }
  onPrevClick() {
    this.player.previousTrack();
  }
  
  onPlayClick() {
    this.player.togglePlay();
  }
  
  onNextClick() {
    // this.player.nextTrack();
    this.playNextTrack()
  }

  playNextTrack(){
    const {queue} = this.props
    if (queue !== undefined & queue.length > 0){
      const track = queue[0]
      this.playTrack(track.uri)
      let tracks = []
      popTrack(this.props.playlistId).then(function(data){
          tracks = data.data.popTrack.tracks
      })
      console.log(this.props)
      // this.props.updateTracks(tracks)
      // this.setState({
      //   queue: tracks
      // })
    }
  }

  playTrack(uri){
    const { deviceId, token } = this.props;
    console.log(deviceId)
    console.log(uri)
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "uris": [uri]
      }),
    }).then(response => console.log(response))
    }

  checkForPlayer() {
    const { token } = this.props;
    console.log(token)
    // console.log("Checking Player at " + this.getDate())
  
    if (window.Spotify !== null) {
      this.player = new window.Spotify.Player({
        name: "Spotify Jukebox",
        getOAuthToken: cb => { cb(token); },
      });
      this.createEventHandlers();
  
      clearInterval(this.playerCheckInterval);
      // finally, connect!
      this.player.connect();
    }
  }

  createEventHandlers() {
    console.log(this.props)
    this.player.on('initialization_error', e => { console.error(e); });
    this.player.on('authentication_error', e => {
      console.error(e);
      this.setState({ loggedIn: false });
    });
    this.player.on('account_error', e => { console.error(e); });
    this.player.on('playback_error', e => { console.error(e); });
  
    // Playback status updates
    this.player.on('player_state_changed', state => this.onStateChanged(state));
  
    // Ready
    this.player.on('ready', async data => {
      let { device_id, user_id} = data;
      console.log(device_id)
      console.log("Let the music play on!");
      // await this.setState({ deviceId: device_id, player: this.player });
      this.props.updatePlayer({
        "deviceId": device_id,
        "player": this.player
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
      console.log(state)
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
    console.log(deviceId)
    console.log(token)
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
    console.log(searchQuery)
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
        console.log(data.id)
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
              console.log(data)
              tracks = data.data.insertTrack.tracks
        })  
        this.props.updateTracks({"queue": tracks})
        // this.setState({
        //   queue: tracks
        // })
  }



  createPlaylist = async () => {
    const {token, userId, roomNumber} = this.props;
    console.log(token)
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
        console.log(data.uri)
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
                <div className="row">
                    <h3> Room {this.props.roomNumber}</h3>
                </div>
                <div className="row">
                    <SearchBar token={this.props.token}/>
                </div>
                <div className="row">
                  <SearchResults results={this.props.searchResults} addToQueue={this.addToQueue} queue={this.props.queue}/>
                </div>
                <div className="row jukebox-player col-lg-12 col-12">
                  <div className="current-track-details">
                  {
                    (this.props.albumArt !== null) ?
                    <span>
                        <img className="album-art-player" src={this.props.albumArt} alt="Album Art"></img>
                    </span>
                    :
                    <span className="col-xs-4 col-lg-4 album-art">
                    </span>
                  }
                  <span>
                    <div className="row">
                      <p id="track-name">{this.props.trackName}</p>
                    </div>
                    <div className="row">
                      <p id="artist-name">{this.props.artistName}</p>
                    </div>
                    <div className="row">
                      <p id="album-name">{this.props.albumName}</p>
                    </div>
                  </span>
                  </div>
                  <div className="row player-control">
                        <span className="player-element">
                        <i className="fas fa-step-backward fa-2x control-button" onClick={() => this.onPrevClick()}></i>                
                        </span>
                        <span className="player-element">
                        {this.props.playing ?
                        <i className="fas fa-pause fa-2x control-button" onClick={() => this.onPlayClick()}></i>
                        :
                        <i className="fas fa-play fa-2x control-button" onClick={() => this.onPlayClick()}></i>
                        }
                        </span>
                        <span className="player-element">
                        <i className="fas fa-step-forward fa-2x control-button" onClick={() => this.onNextClick()}></i>
                        </span>
                  </div>
                </div>
                <div className="row">
                  <Queue playTrack={this.playTrack} queue={this.props.queue} owner={this.props.owner}/>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)