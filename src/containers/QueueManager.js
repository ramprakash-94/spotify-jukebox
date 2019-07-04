import React from 'react'
import {connect} from 'react-redux'
import {getTopTracks, getAllSpotifyPlaylists, getSpotifyPlaylistTracks} from '../actions/rootActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import {addToPlaylist} from '../actions/serverActions'

function mapStateToProps(state){
    return state
}

function mapDispatchToProps(dispatch) {
    return {
      updatePlaylists: (state) => dispatch(updatePlaylists(state))
    };
  }

const updatePlaylists = (state) => (Object.assign({}, state, {
            "type": "UPDATE_ROOM"
}))

class QueueManager extends React.Component{
    constructor(props){
        super(props)
        console.log("Queue Manager")
        this.state = {
            loading: null
        }
    }
    componentDidMount(){
        Promise.resolve(getAllSpotifyPlaylists(this.props.token))
            .then((items) => {
                const playlists = items.map(i => {
                   return {
                        uri: i.uri,
                        name: i.name,
                        image: i.images[0].url,
                        id: i.id
                   } 
                })
                this.props.updatePlaylists({
                    spotifyPlaylists: playlists,
                    manageTracks: true
                })
            })
    }
    getPlaylistTracks(id){
        Promise.resolve(getSpotifyPlaylistTracks(id, this.props.token)).then(items => {
            const tracks = items.map(i => {
                return {
                    id: i.track.id,
                    uri: i.track.uri,
                    title: i.track.name,
                    albumName: i.track.album.name,
                    artistName: i.track.artists[0].name
                }
            })
            this.props.updatePlaylists({
                playlistTracks: tracks
            })
        })
    }
    renderPlaylistItem(playlist){
        return (
            <div key={playlist.uri} className="playlist-item list-group-item col-xs-6 col-lg-6" onClick={() => this.getPlaylistTracks(playlist.id)}>
                <div className="col-4">
                    <img className="album-art" src={playlist.image} alt="Album Art"></img>
                    <p className="playlist-grid-title">{playlist.name}</p>
                </div>
            </div>
        )
    }
    renderPlaylistTracks(track){
        return (
            <div className="track-info row" key={track.id}>
                <div className="col-xs-6 col-lg-6">
                    <p>{track.title}</p>
                </div>
                <div className="col-xs-4 col-lg-4">
                    <p>{track.artistName}</p>
                </div>
                {
                    (this.props.queue.filter(item => item.uri === track.uri).length > 0) ?
                    <div className="col-xs-2 col-lg-2">
                        <FontAwesomeIcon icon={faCheck} className="added-track"/>
                    </div>
                    :
                    <div>
                    {
                        (this.state.loading === track.uri) ?
                            <FontAwesomeIcon icon={faSpinner} size="lg" spin/>
                        :
                        <div className="col-xs-2 col-lg-2" onClick={() => this.addTrack(track.uri)}>
                            <FontAwesomeIcon icon={faPlus} className="add-track"/>
                        </div>
                        
                    }
                    </div>
                }
            </div>
        )
    }

    addToQueue = async(songUri) => {
            let tracks = null
            console.log(songUri)
            Promise.resolve(addToPlaylist(this.props.playlistId, songUri, this.props.token))
                .then((data) => {
                tracks = data.data.insertTrack.tracks
                this.props.updatePlaylists({"queue": tracks})
            })  
            // this.setState({
            //   queue: tracks
            // })
    }

    addTrack(uri){
        console.log(uri)
        this.addToQueue(uri)
        this.setState({
            loading: uri
        })
    }

    render(){
        return(
            <div>
                <div className="row queue-manager">
                    <div className="spotify-playlists col-lg-4 col-xs-4">
                        <h4>Playlists</h4>
                        <div className="list-group row">
                            {
                                this.props.spotifyPlaylists.map(i => this.renderPlaylistItem(i))
                            }
                        </div>
                    </div>
                    <div className="playlist-tracks col-lg-8 col-xs-8">
                        <h4>Tracks</h4>
                        <div className="track-content">
                            {
                                this.props.playlistTracks.map((i) => this.renderPlaylistTracks(i))
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueManager)