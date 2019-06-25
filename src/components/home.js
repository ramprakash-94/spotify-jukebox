import React from 'react'
import {connect} from 'react-redux'
import SearchBar from './searchBar';
import SearchResults from './searchResults';
import Queue from './queue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {popTrack, getAllTracks} from '../actions/rootActions'
import gql from 'graphql-tag'

function mapStateToProps(state){
    return state
}

function mapDispatchToProps(dispatch) {
    return {
      updateTracks: (state) => dispatch(updateTracks(state))
    };
  }

const updateTracks = (state) => (Object.assign({}, state, {
            "type": "UPDATE_TRACKS"
}))

class Home extends React.Component{
    constructor(props){
        super(props)
        this.playerCheckInterval = null
        this.state = {
            trackName: "Track",
            artistName: "Artist",
            albumName: "Album",
            owner: this.props.owner,
            playing: false,
            token: this.props.token,
            userId: this.props.userId,
            roomNumber: this.props.roomNumber,
            playlistId: this.props.playlistId,
            playlistURI: this.props.playlistURI,
            queue: []
        }
        console.log(this.props)
        this.createPlaylist = this.createPlaylist.bind(this)
        this.updateTracks = this.updateTracks.bind(this)
        this.playTrack = this.playTrack.bind(this)
    }

    componentDidMount(){
      this.handleEntryPoint()
    }

    componentDidUpdate(){
      const {duration, position} = this.state
      if (duration - position <= 1000){
        console.log("Next song")
        this.playNextTrack()
      }
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
        let tracks = []
        this.updateStateTimeout = setInterval(() => {
            getAllTracks(this.props.playlistId).then(function(data){
              tracks = data.data.allTracksInPlaylist.tracks
            })
            this.updateTracks(tracks)
          }, 3000)
        this.setState({
          queue: tracks
        })

        // this.playPlaylist(this.state.playlistURI)
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
    const track = queue.shift()
    if (queue !== undefined & queue.length > 0){
      this.playTrack(track.id)
      let tracks = []
      popTrack(this.props.playlistId).then(function(data){
          tracks = data.data.popTrack.tracks
      })
      this.props.updateTracks(tracks)
      this.setState({
        queue: tracks
      })
    }
  }

  playTrack(uri){
    const { deviceId, token } = this.state;
    // console.log(deviceId)
    // console.log(uri)
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
    // console.log(token)
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
      await this.setState({ deviceId: device_id, player: this.player });
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
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(", ");
      const trackURI = currentTrack.uri
      const playing = !state.paused;
      // console.log(state)
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
        trackURI
      });
    }
    // return state stuff
  }
  
   transferPlaybackHere() {
     console.log("Transferring playback")
    const { deviceId, token } = this.state;
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
    const {token } = this.state;
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
    const {token } = this.state;
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
        await Promise.resolve(this.addToPlaylist(songUri))
            .then((data) => {
              console.log(data)
              tracks = data.data.insertTrack.tracks
        })  
        this.props.updateTracks({"queue": tracks})
        // this.setState({
        //   queue: tracks
        // })
  }


  addToPlaylist = async(songUri) => {
      console.log("Song to be added to queue: " + songUri)
      // const {playlistId, token} = this.props
      // console.log(playlistId)
      // console.log(songUri)
      // return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      //   method: "POST",
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     "uris": [songUri]
      //   }),
      // }).then(response => response.json())
      // // .then(function(data){
      // //     console.log(data)
      // // })
      // // .catch(function (error){
      // //   console.log(error);
      // // });
    const {queue, playlistId, token} = this.props
    let tracks = []
    let finalTracks = []
    console.log("Adding " + songUri + " to " + playlistId)
    const client = new ApolloClient({
      link: new HttpLink({ uri: "http://localhost:4000" }),
      cache: new InMemoryCache()
    })
    return client.mutate({
      variables: { playlistId: playlistId, track: songUri, token: token},
      mutation: gql`
          mutation insertTrack($playlistId: ID!, $track: String!, $token: String!){
            insertTrack(playlistId: $playlistId, track: $track, token: $token){
              id
              tracks{
                id
                title
                album
                artist
                albumArt
              }
            }
          }
      `,
    })
    .catch(error => console.error(error))
    // .then(function(data){
    //   tracks = data.data.insertTrack.tracks
    //   this.props.updateTracks(tracks)
    //   // tracks.forEach(track => finalTracks.push(track) 
    //   });
    
    // console.log(finalTracks)
    // this.updateStateTracks(finalTracks)
  }

  createPlaylist = async () => {
    const {token, userId, roomNumber} = this.state;
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
              <div className="container">
                <div className="row">
                    <h3> Room {this.props.roomNumber}</h3>
                </div>
                <div className="row">
                    <SearchBar token={this.state.token}/>
                </div>
                <div className="row">
                  <SearchResults results={this.props.searchResults} addToQueue={this.addToQueue}/>
                </div>
                <div className="row jukebox-player col-lg-12 col-12">
                  <div className="row">
                    <p id="track-name">{this.state.trackName}</p>
                  </div>
                  <div className="row">
                    <p id="artist-name">{this.state.artistName}</p>
                  </div>
                  <div className="row">
                    <p id="album-name">{this.state.albumName}</p>
                  </div>
                  <div className="row">
                    {this.state.owner ?
                    <div className="player-control">
                        <span className="player-element">
                        <i className="fas fa-step-backward fa-2x control-button" onClick={() => this.onPrevClick()}></i>                
                        </span>
                        <span className="player-element">
                        {this.state.playing ?
                        <i className="fas fa-pause fa-2x control-button" onClick={() => this.onPlayClick()}></i>
                        :
                        <i className="fas fa-play fa-2x control-button" onClick={() => this.onPlayClick()}></i>
                        }
                        </span>
                        <span className="player-element">
                        <i className="fas fa-step-forward fa-2x control-button" onClick={() => this.onNextClick()}></i>
                        </span>
                    </div>
                    :
                    <div></div>
                    }
                  </div>
                </div>
                <div className="row">
                  <Queue playTrack={this.playTrack} tracks={this.state.queue} owner={this.props.owner}/>
                </div>
              </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)