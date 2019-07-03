import React from 'react'
import {connect} from 'react-redux'
import {popTrack} from '../actions/rootActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faAngleUp} from '@fortawesome/free-solid-svg-icons'

import TrackProgress from './progressBar'
import FullScreenPlayer from '../containers/FullScreenPlayer';

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
        this.playNextTrack = this.playNextTrack.bind(this)
        this.fullScreenPlayer = this.fullScreenPlayer.bind(this)
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
        Promise.resolve(popTrack(this.props.playlistId))
            .then((data) => {
                tracks = data.data.popTrack.tracks
                console.log(tracks)
                Promise.resolve(this.props.updateTracks(tracks)).then(() =>
                this.playTrack(track.uri)
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

    fullScreenPlayer(){
        this.props.updatePlayer({
            fullscreen: true
        })
    }

    render(){
        return(
            <div className="player">
                {
                  this.props.player ?
                  <div className="row jukebox-player">
                    <div className="row open-fullscreen" onClick={this.fullScreenPlayer}>
                        <FontAwesomeIcon icon={faAngleUp} size="2x"/>
                    </div>
                    <div className="row main-player">
                        <div className="current-track-details row">
                            {
                            (this.props.albumArt !== null) ?
                            <div className="col-xs-2 col-lg-2">
                                <img className="img-responsive album-art-player" src={this.props.albumArt} alt="Album Art"></img>
                            </div>
                            :
                            <div className="col-xs-2 col-lg-2 album-art-player">
                            </div>
                            }
                            <div className="col-xs-4 col-lg-auto">
                                <div className="row track-name">
                                    <p>{this.props.trackName}</p>
                                </div>
                                <div className="row artist-name">
                                    <p>{this.props.artistName}</p>
                                </div>
                                {/* <div className="row album-name">
                                    {this.props.albumName}
                                </div> */}
                            </div>
                        {
                            this.props.owner ?
                            <div>
                                <div className="player-control row">
                                    <div className="col-xs-2 col-lg-2 player-element">
                                        <i className="fas fa-step-backward fa-2x control-button" onClick={() => this.onPrevClick()}></i>                
                                    </div>
                                    <div className="col-xs-2 col-lg-2 player-element">
                                        {this.props.playing ?
                                        <i className="fas fa-pause fa-2x control-button" onClick={() => this.onPlayClick()}></i>
                                        :
                                        <i className="fas fa-play fa-2x control-button" onClick={() => this.onPlayClick()}></i>
                                        }
                                    </div>
                                    <div className="col-xs-2 col-lg-2 player-element">
                                        <i className="fas fa-step-forward fa-2x control-button" onClick={() => this.onNextClick()}></i>
                                    </div>
                                    <span>
                                    </span>
                                </div>
                                <TrackProgress/>
                            </div>
                            :
                            <div>
                            </div>
                        }
                        </div>
                    </div>
                  </div>
                  :
                  <div>
                    <FontAwesomeIcon icon={faSpinner} size="lg" spin/>
                  </div>
                }
                {
                    this.props.fullscreen ?
                    <FullScreenPlayer/>
                    :
                    <div>
                    </div>
                }
            </div>
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Player)