import React from 'react'
import {connect} from 'react-redux'
import Queue from './queue'
import {popTrack, getAllTracks} from '../actions/rootActions'
import {addToPlaylist, updateRoom, handleJoinRoom} from '../actions/serverActions'
import Player from './player'
import {getTrackInformation} from '../actions/rootActions'
import SearchContainer from '../containers/SearchContainer'
import SearchBar from './searchBar';
import SearchResults from './searchResults'
import Modal from 'react-modal'

// Modal.setAppElement('#App')
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
        this.intervalGetTracks = this.intervalGetTracks.bind(this)
        this.playNextTrack = this.playNextTrack.bind(this)
        this.toggleSearch = this.toggleSearch.bind(this)
        this.state = {
          search: false
        }
    }
    componentWillMount(){
      this.getRoomDetails()
    }

    componentDidMount(){
      this.handleEntryPoint()
    }
    componentWillUnmount(){
      clearInterval(this.updateStateTimeout)
    }

    componentDidUpdate(){
      const {duration, position, currentTrack, playing, trackURI} = this.props
      if (duration - position <= 1000 & !playing & this.changeTrack){
        this.playNextTrack()
        this.changeTrack = false
      }

      if (currentTrack === trackURI | this.props.roomNumber === null | !trackURI){
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

    getRoomDetails = async() => {
        const roomNumber = this.props.match.params.rid
        Promise.resolve(handleJoinRoom(roomNumber))
            .then((data) => {
                console.log(data)
                const room = data.data.room
                let owner = false
                if(roomNumber !== this.props.joinAsGuest & this.props.userId === room.admin){
                  owner = true
                }
                if (!owner){
                  Promise.resolve(getTrackInformation(room.currentTrack, this.props.token)).then((trackData) =>{
                    Promise.resolve(
                      this.props.updatePlayer({
                          roomId: room.id,
                          roomNumber: room.number,
                          admin: room.admin,
                          playlistId: room.playlists[0].id,
                          nowPlaying: room.playlists[0].nowPlaying,
                          currentTrack: room.currentTrack,
                          trackName: trackData.trackName,
                          artistName: trackData.artistName,
                          albumName: trackData.albumName,
                          albumArt: trackData.albumArt,
                          manageTracks: false,
                          owner: owner,
                          player: true
                      })
                    ).then(() => {
                      Promise.resolve(getAllTracks(this.props.playlistId))
                        .then((data) => {
                          let tracks = data.data.allTracksInPlaylist.tracks
                          Promise.resolve(this.props.updateTracks({
                            queue: tracks
                          }))
                        })
                    })
                  })

                }
                else{
                  Promise.resolve(
                    this.props.updatePlayer({
                        roomId: room.id,
                        roomNumber: room.number,
                        admin: room.admin,
                        playlistId: room.playlists[0].id,
                        currentTrack: room.currentTrack,
                        owner: owner,
                        player: true
                    })
                  ).then(() => {
                    console.log(this.props.player)
                    if(this.props.player !== null){
                      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
                    }
                    Promise.resolve(getAllTracks(this.props.playlistId))
                      .then((data) => {
                        let tracks = data.data.allTracksInPlaylist.tracks
                        Promise.resolve(this.props.updateTracks({
                          queue: tracks
                        }))
                      })
                  })
                }
        })
    }

    intervalGetTracks(){
          // getAllTracks(this.props.playlistId).then(function(data){
          //   let tracks = data.data.allTracksInPlaylist.tracks
          // })
          Promise.resolve(getAllTracks(this.props.playlistId)).then((data) => {
            let tracks = data.data.allTracksInPlaylist.tracks
            if (tracks !== null){
              this.updateTracks(tracks)
            }
          })

    }

    handleEntryPoint = async() => {
        console.log(this.props)
        this.updateStateTimeout = setInterval(this.intervalGetTracks, 10000)

        const {position, duration, playing} = this.props
        let newPos = null
        if (newPos !== null){
          this.props.updatePlayer({
            position: newPos
          })
        }

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
    const {queue, nowPlaying} = this.props
    let nextIndex = nowPlaying + 1
    if (queue !== undefined){
      if (nextIndex >= queue.length - 1){
        nextIndex = 0
      }
      Promise.resolve(popTrack(this.props.playlistId))
          .then((data) => {
            let tracks = []
            tracks = data.data.popTrack.tracks
            const nextTrack = data.data.popTrack.nowPlaying
            Promise.resolve(this.props.updateTracks({
              queue: tracks,
              nowPlaying: nextTrack
            })).then(() => {
              const track = tracks[nextTrack]
              this.playTrack(track.uri)
              clearInterval(this.updateStateTimeout)
              this.updateStateTimeout = setInterval(this.intervalGetTracks, 10000)
            }
            )
        })
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
  
   async transferPlaybackHere() {
     console.log("Transferring playback")
    const { deviceId, token } = this.props;
    await fetch("https://api.spotify.com/v1/me/player", {
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
    if(this.props.nowPlaying !== 0){
      await this.playTrack(this.props.queue[this.props.nowPlaying - 1].uri)
    }
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
        Promise.resolve(addToPlaylist(this.props.playlistId, songUri, this.props.token))
            .then((data) => {
              tracks = data.data.insertTrack.tracks
              this.props.updateTracks({"queue": tracks})
        })  
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
  toggleSearch(){
    this.setState({
      search: !this.state.search
    })
  }


    render(){
      const customStyles = {
        content : {
          top                   : '50%',
          left                  : '50%',
          right                 : 'auto',
          bottom                : 'auto',
          marginRight           : '-50%',
          transform             : 'translate(-50%, -50%)',
          backgroundColor: '#272C34'
        }
      };
        return (
            <div className="home-page">
                <div className="row main">
                  <div className="row">
                      <h3> Room {this.props.roomNumber}</h3>
                  </div>
                  <div className="row search-queue">
                    <div className="search">
                      <div>
                        <button className="btn btn-primary" onClick={this.toggleSearch}>Add Tracks</button>
                      </div>
                        <Modal isOpen={this.state.search} onRequestClose={this.toggleSearch} ariaHideApp={false}
                              style={customStyles}>
                                <div className="row">
                                    <SearchBar token={this.props.token}/>
                                </div>
                                <div className="row">
                                    <SearchResults results={this.props.searchResults} addToQueue={this.addToQueue} queue={this.props.queue}/>
                                </div>
                        </Modal>
                    </div>
                    <div className="queue">
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