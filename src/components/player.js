import React from 'react'
import {connect} from 'react-redux'
import {popTrack} from '../actions/rootActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import TrackProgress from './progressBar'

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

class Player extends React.Component{
    constructor(props){
        super(props)
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

    render(){
        return(
            <div className="player">
                {
                  this.props.player ?
                  <div className="row jukebox-player">
                    <div className="current-track-details row">
                        {
                        (this.props.albumArt !== null) ?
                        <div className="col-xs-4 col-lg-4 album-art-player">
                            <img className="img-responsive album-art-player" src={this.props.albumArt} alt="Album Art"></img>
                        </div>
                        :
                        <div className="col-xs-4 col-lg-4 album-art-player">
                        </div>
                        }
                        <div className="col-xs-8 col-lg-8">
                            <div className="row track-name">
                                {this.props.trackName}
                            </div>
                            <div className="row artist-name">
                                {this.props.artistName}
                            </div>
                            <div className="row album-name">
                                {this.props.albumName}
                            </div>
                        </div>
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
                          <span>
                          </span>
                    </div>
                    <TrackProgress/>
                  </div>
                  :
                  <div>
                    <FontAwesomeIcon icon={faSpinner} size="lg" spin/>
                  </div>
                }
            </div>
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Player)