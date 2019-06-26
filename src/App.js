import React from 'react';
import './App.css';
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'
import Home from './components/home'
import Login from './components/login'

import store from './store'
import querystring from 'querystring';
import { Provider } from "react-redux";
import RoomContainer from './containers/RoomContainer';
import HomeContainer from './containers/HomeContainer';



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graphqlURI: "localhost:4000",
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
      searchResults: null,
      roomNumber: null,
      userId: null,
      playlistId: null,
      queue: [],
      playerCheckInterval: null,
      client_id: "91b73766037a44e7a855d5cf2b0c8768",
      redirect_uri: `${document.location.protocol}//${document.location.host}/spotify-auth`,
      loading: false,
      certbot: false
    };
    this.playerCheckInterval = null;
    this.searchURI = this.searchURI.bind(this);
    this.addToQueue = this.addToQueue.bind(this);

    // if (document.location.pathname === '/spotify-auth') {
    //   this.code = querystring.parse(document.location.search)['?code'];
    //   console.log(this.code)
    //   this.signInWithToken(this.code.toString())
    // }
    if (document.location.pathname === '/.well-known/acme-challenge/gTJcLVLa4IrM5kir_fk6CBrrrqLwuqUbhuHtgefQJdc') {
      const text = "gTJcLVLa4IrM5kir_fk6CBrrrqLwuqUbhuHtgefQJdc.PuwB8unGT8GfGGdjgLjyjjaZI-kpzsrVRedEq-95cF0"
      document.documentElement.innerHTML = text
      // const element = document.createElement("a");
      // const file = new Blob([text], {type: 'text/plain'});
      // element.href = URL.createObjectURL(file);
      // element.download = "myFile.txt";
      // document.body.appendChild(element); // Required for this to work in FireFox
      // element.click();
    }
    this.client = new ApolloClient({
      link: new HttpLink({ uri: "http://localhost:4000" }),
      cache: new InMemoryCache()
    })
  }



  async handleLogin() {
    if (this.state.token !== "") {
      const userId = await this.handleCreateUser(this.state.token)
      await this.handleCreateRoom(userId)
      this.setState({ loggedIn: true, owner: true });
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
    let token = null
    let playlistId = null
    await this.client.query({ 
      query: gql` 
      { 
        room(num: ${roomNumber}){ 
          id 
          number
          admin{
              id
              token
            }
            playlists{
              id
              tracks{
                id
                title
                artist
                album
                albumArt
              }
            }
          }
        }
      `,
    })
    .then(function(data){
      queue = data.data.room.playlists[0].tracks
      token = data.data.room.admin.token
      playlistId = data.data.room.playlists[0].id
    }) 
    .catch(error => console.error(error));
    this.setState({ 
      loggedIn: true ,
      queue: queue,
      token: token,
      playlistId: playlistId
    })
  }

  handleCreateUser = async spotifyToken => {
    console.log(spotifyToken)
    let userId = null
    await this.client.mutate({
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
  insertTrackInfo = async (track)  => {
        return {
          "id": track.id,
          "title": track.title,
          "album": track.album,
          "artist": track.artist,
          "albumArt": track.albumArt
        }
  }

  updateStateTracks = (tracks) => {
    this.setState({
      queue: this.state.queue.concat(tracks)
    })
  }

  addToQueue = async songUri => {
    const {queue, playlistId, token} = this.state
    let tracks = []
    let finalTracks = []
    console.log("Adding " + songUri + " to " + playlistId)
    const client = new ApolloClient({
      link: new HttpLink({ uri: "http://localhost:4000" }),
      cache: new InMemoryCache()
    })
    await client.mutate({
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
    .then(function(data){
      tracks = data.data.insertTrack.tracks
      tracks.forEach(track => finalTracks.push(track) )});
    
    console.log(finalTracks)
    this.updateStateTracks(finalTracks)
  }


  handleSearchInputChange = () => {
      this.searchURI(this.search.value);
  }

  getTrackInformation = async(trackURI) => {
    const {token} = this.state
    let title, album, artist, albumArt = null
    const trackId = trackURI.replace("spotify:track:", "");
    await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      title = data.name
      album = data.album.name
      artist = data.artists[0].name
      albumArt = data.album.images[0].url
    })
    .catch(function (error){
      console.log(error);
    });
    return {
      title: title,
      album: album,
      artist: artist,
      albumArt: albumArt
    }
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
      results = this.state.queue.map(track => <div className="queue-result row">{track.title}</div> ); 
    }
    return results;
  }

  get renderPlayableQueue(){
    let results = <h4></h4>;
    const {queue} = this.state
    if (this.state.queue){
      results = queue.map(i => this.renderTrackInfo(i)); 
    }
    return results;
  
}

renderTrackInfo = (track) => {

  const title = track.title
  const artist = track.artist
  const albumArt = track.albumArt
  console.log(track)
  console.log(artist)
  return (
  <div className="queue-result row" onClick={() => this.playSongURI(track.id)}>
  <div className="col-4 col-lg-4 album-art">
    <img src={albumArt} alt="Album Art"></img>
  </div>
  <div className="col-8 col-lg-8">
    <div className="row">{title}</div>
    <div className="row">{artist}</div>
  </div>
  </div> ) 
}


  render() {
    const {
      token,
      loggedIn,
      owner,
      artistName,
      trackName,
      albumName,
      error,
      position,
      duration,
      playing,
      roomNumber,
      loading
    } = this.state;
  
    
    return (
      <div className="App">
        { this.state.certbot ?
          <div>
           oz6nCF9UIkbh4Yybx_Vmv4r8pP4RRrL-wTpDA7Vu-fQ.PuwB8unGT8GfGGdjgLjyjjaZI-kpzsrVRedEq-95cF0       
          </div>
          :
        <div>
          <h1>Spotify Jukebox</h1>
          {error && <p>Error: {error}</p>}
          <Provider store={store}>
            <HomeContainer/>
          </Provider> 
        </div>

      }
      </div>
    );
  }
}

export default App;
