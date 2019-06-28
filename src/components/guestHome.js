import React from 'react'
import SearchBar from './searchBar';
import SearchResults from './searchResults';
import Queue from './queue'
import { getTrackInformation} from '../actions/rootActions';
import {handleJoinRoom} from '../actions/serverActions'
import {connect} from 'react-redux'
import {addToPlaylist} from '../actions/serverActions'
import {getAllTracks} from '../actions/rootActions'

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

class GuestHome extends React.Component{
    constructor(props){
        super(props)
    }
    componentDidMount(){
        let tracks = []
        let currentTrack = null
        let playlistId = null

        // Update Room information
        this.updateStateTimeout = setInterval(() => {
            handleJoinRoom(this.props.roomNumber).then(function(data){
              console.log(data)
              playlistId = data.data.room.playlists[0].id
              currentTrack = data.data.room.currentTrack
              getAllTracks(playlistId).then(function(data){
                tracks = data.data.allTracksInPlaylist.tracks
                console.log(tracks)
              })
            })
            if (currentTrack !== null & playlistId !== null ){
              this.updateTracks(tracks, currentTrack)

            }
          }, 3000)

    }

    // Add track to queue
    addToQueue = async(songUri) => {
        let tracks = null
        await Promise.resolve(addToPlaylist(this.props.playlistId, songUri, this.props.token))
            .then((data) => {
              console.log(data)
              tracks = data.data.insertTrack.tracks
        })  
        // this.props.updateTracks({"queue": tracks})
        // this.setState({
        //   queue: tracks
        // })
  }

    // Update Queue in Props
    updateTracks(tracks, currentTrack){
      // const {trackName, artistName, albumName, albumArt} = getTrackInformation(currentTrack, this.props.token)
      console.log(currentTrack)
      this.props.updateTracks({
        "queue": tracks,
        trackName: currentTrack.title,
        artistName: currentTrack.artist,
        albumName: currentTrack.album,
        albumArt: currentTrack.albumArt
      })
    }
    render(){
        return(
            <div className="home-page">
              <div className="container">
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
                  <div className="row">
                    <p id="track-name">{this.props.trackName}</p>
                  </div>
                  <div className="row">
                    <p id="artist-name">{this.props.artistName}</p>
                  </div>
                  <div className="row">
                    <p id="album-name">{this.props.albumName}</p>
                  </div>
                </div>
                <div className="row">
                  <Queue queue={this.props.queue} owner={this.props.owner}/>
                </div>
              </div>
            </div>
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(GuestHome)