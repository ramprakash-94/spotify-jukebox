import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graphqlURI: "localhost:4000",
      token: "",
      deviceId: "",
      loggedIn: false,
      guest: false,
      error: "",
      trackName: "Track Name",
      artistName: "Artist Name",
      albumName: "Album Name",
      playing: false,
      position: 0,
      duration: 0,
      searchResults: null,
      roomNumber: null,
      userId: null,
      playlistId: null,
      queue: []
    };
    this.playerCheckInterval = null;
    this.searchURI = this.searchURI.bind(this);
  }

  async handleLogin() {
    if (this.state.token !== "") {
      const userId = await this.handleCreateUser(this.state.token)
      await this.handleCreateRoom(userId)
      this.setState({ loggedIn: true });
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
  
    }
  }

  checkForPlayer() {
    const { token } = this.state;
  
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
      let { device_id } = data;
      console.log("Let the music play on!");
      await this.setState({ deviceId: device_id });
      this.transferPlaybackHere();
    });
  }

  onStateChanged(state) {
    // if we're no longer listening to music, we'll get a null state.
    if (state !== null) {
      const {
        current_track: currentTrack,
        position,
        duration,
      } = state.track_window;
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(", ");
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
      });
    }
  }

  onPrevClick() {
    this.player.previousTrack();
  }
  
  onPlayClick() {
    this.player.togglePlay();
  }
  
  onNextClick() {
    this.player.nextTrack();
  }

  playSongURI(uri){
    const { deviceId, token } = this.state;
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "uris": [uri],
        "play": true,
      }),
    });
  }

  transferPlaybackHere() {
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

  handleJoinRoom = async query => {
    const {roomNumber} = this.state;
    let queue = []
    const client = new ApolloClient({
      link: new HttpLink({ uri: "http://localhost:4000" }),
      cache: new InMemoryCache()
    })
    await client.query({
      query: gql`
        {
          room(num: ${roomNumber}){
            id
            number
            admin{
              id
            }
            playlists{
              id
              tracks
            }
          }
        }
      `,
    })
    .then(function(data){
      queue = data.data.room.playlists[0].tracks
    }) 
    .catch(error => console.error(error));
    this.setState({ 
      loggedIn: true ,
      queue: queue
    })
  }

  handleCreateUser = async spotifyToken => {
    console.log(spotifyToken)
    let userId = null
    const client = new ApolloClient({
      link: new HttpLink({ uri: "http://localhost:4000" }),
      cache: new InMemoryCache()
    })
    await client.mutate({
      variables: { token: spotifyToken, type: "owner"},
      mutation: gql`
          mutation AddUser($token: String!, $type: String!){
            addUser(token: $token, type: $type){
              id
              token
              userType
              rooms{
                id
              }
            }
          }
      `,
    })
    .catch(error => console.error(error))
    .then(function(data){
      userId = data.data.addUser.id
    });
    return userId
  }

  handleCreateRoom = async userId => {
    console.log("Creating Room for user: " + userId)
    let roomNumber = null
    let playlistId = null
    const client = new ApolloClient({
      link: new HttpLink({ uri: "http://localhost:4000" }),
      cache: new InMemoryCache()
    })
    await client.mutate({
      variables: { userId: userId},
      mutation: gql`
          mutation CreateRoom($userId: ID!){
            createRoom(userId: $userId){
              id
              number
              playlists{
                id
              }
            }
          }
      `,
    })
    .catch(error => console.error(error))
    .then(function(data){
      roomNumber = data.data.createRoom.number
      playlistId = data.data.createRoom.playlists[0].id
    });
    this.setState({
      roomNumber: roomNumber,
      playlistId: playlistId
    })
  }

  addToQueue = async songUri => {
    const {playlistId} = this.state
    let tracks = []
    console.log(this.state)
    console.log("Adding " + songUri + " to " + playlistId)
    const client = new ApolloClient({
      link: new HttpLink({ uri: "http://localhost:4000" }),
      cache: new InMemoryCache()
    })
    await client.mutate({
      variables: { playlistId: playlistId, track: songUri},
      mutation: gql`
          mutation insertTrack($playlistId: ID!, $track: String!){
            insertTrack(playlistId: $playlistId, track: $track){
              id
              tracks
            }
          }
      `,
    })
    .catch(error => console.error(error))
    .then(function(data){
      tracks = data.data.insertTrack.tracks
    });
    this.setState({ queue: tracks})
    console.log(this.state)
  }

  handleSearchInputChange = () => {
      this.searchURI(this.search.value);
  }

  get renderSearchResults(){
    let results = <h4></h4>;
    if (this.state.searchResults){
      results = this.state.searchResults.map(i => <div className="search-result row" onClick={() => this.addToQueue(i.uri)}>{i.name}</div>);
    }
    return results;
  }

  get renderQueue(){
    let results = <h4></h4>;
    if (this.state.queue){
      results = this.state.queue.map(i => <div className="search-result row">{i}</div>);
    }
    return results;
  }

  render() {
    const {
      token,
      loggedIn,
      artistName,
      trackName,
      albumName,
      error,
      position,
      duration,
      playing,
      roomNumber
    } = this.state;
  
    return (
      <div className="App">
          <h1>Spotify Jukebox</h1>
        {error && <p>Error: {error}</p>}
  
        {loggedIn ?
        (<div className="container">
          <div className="row">
            <h3> Room {roomNumber}</h3>
          </div>
          <div className="row">
            <div className="jukebox-search col-lg-12 col-6">
              <input 
                type="text"
                id="search-bar"
                placeholder="Search for music"
                ref={input => this.search = input}
                onChange={this.handleSearchInputChange}
                />
            </div>
          </div>
          <div id="search-results row">
              {this.renderSearchResults}
          </div>
          <div className="row">
            <div className="jukebox-player col-lg-12 col-12">
              <p id="track-name">{trackName}</p>
              <p id="artist-name">{artistName}</p>
              <p id="album-name">{albumName}</p>
              <div className="player-control">
                <span className="player-element">
                  <i className="fas fa-step-backward fa-2x control-button" onClick={() => this.onPrevClick()}></i>                
                </span>
                <span className="player-element">
                  {playing ?
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
          </div>
          <div className="queue row">
                  {this.renderQueue}
          </div>
        </div>)
        :
        (<div className="sign-in">
          <div className="create-room">
            <h3>Create a Room</h3>
            <p className="App-intro">
              Enter your Spotify access token. Get it from{" "}
              <a href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">
                here
              </a>.
            </p>
            <p>
              <input className="sign-in-input" type="text" value={token} onChange={e => this.setState({ token: e.target.value })} />
            </p>
            <p>
              <button className="go-button" onClick={() => this.handleLogin()}>Go</button>
            </p>
          </div>
          <div className="join-room">
            <h3>Join Room</h3>
            <p>
              <input className="sign-in-input" type="text" value={roomNumber} onChange={e => this.setState({ roomNumber: e.target.value })} />
            </p>
            <p>
              <button className="go-button"onClick={() => this.handleJoinRoom()}>Go</button>
            </p>
          </div>
        </div>)
        }
      </div>
    );
  }
}

export default App;
