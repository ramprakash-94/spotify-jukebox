import React from 'react';
import ReactDOM from 'react-dom'
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      deviceId: "",
      loggedIn: false,
      error: "",
      trackName: "Track Name",
      artistName: "Artist Name",
      albumName: "Album Name",
      playing: false,
      position: 0,
      duration: 0,
      searchResults: null
    };
    this.playerCheckInterval = null;
    this.searchURI = this.searchURI.bind(this);
  }

  handleLogin() {
    console.log("No Token provided");
    if (this.state.token !== "") {
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
        "play": true,
      }),
    });
  }

  searchURI = async searchQuery =>{
    const {token } = this.state;
    const items = [];
    await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=3`, {
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


  handleSearchInputChange = () => {
      this.searchURI(this.search.value);
  }

  get renderSearchResults(){
    let results = <h4>No results</h4>;
    if (this.state.searchResults){
      results = this.state.searchResults.map(i => <p onClick={() => this.playSongURI(i.uri)}>{i.name}</p>);
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
    } = this.state;
  
    return (
      <div className="App">
          <h1>Spotify Jukebox</h1>
        {error && <p>Error: {error}</p>}
  
        {loggedIn ?
        (<div>
          <div className="jukebox-search">
            <input 
              type="text"
              placeholder="Search for music"
              ref={input => this.search = input}
              onChange={this.handleSearchInputChange}
              />
              <div id="search-results">
                  {this.renderSearchResults}
              </div>
          </div>
          <div className="jukebox-player">
            <p>Artist: {artistName}</p>
            <p>Track: {trackName}</p>
            <p>Album: {albumName}</p>
            <p>
              <button onClick={() => this.onPrevClick()}>Previous</button>
              <button onClick={() => this.onPlayClick()}>{playing ? "Pause" : "Play"}</button>
              <button onClick={() => this.onNextClick()}>Next</button>
            </p>
          </div>
        </div>)
        :
        (<div>
          <p className="App-intro">
            Enter your Spotify access token. Get it from{" "}
            <a href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">
              here
            </a>.
          </p>
          <p>
            <input type="text" value={token} onChange={e => this.setState({ token: e.target.value })} />
          </p>
          <p>
            <button onClick={() => this.handleLogin()}>Go</button>
          </p>
        </div>)
        }
      </div>
    );
  }
}

export default App;
