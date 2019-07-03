import React from 'react'
import {connect} from 'react-redux'
import TrackProgress from '../components/progressBar'
import {popTrack} from '../actions/rootActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {withRouter} from 'react-router-dom';

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

class FullScreenPlayer extends React.Component{
    constructor(props){
        super(props)
        this.close = this.close.bind(this)
    }
    close(){
        this.props.updatePlayer({
            fullscreen: false
        })
    }


    render(){
        return(
            <div className="full-screen-player">
                <div className="close-fullscreen pull-right" onClick={this.close}>
                    <FontAwesomeIcon icon={faTimes} size="3x"/>
                </div>
            <div className="fullscreen-body">
                  <div className="row">
                        <div className="current-track-details row">
                            {
                            (this.props.albumArt !== null) ?
                            <div>
                                <img className="img-responsive fullscreen-album-art-player" src={this.props.albumArt} alt="Album Art"></img>
                            </div>
                            :
                            <div className="col-xs-4 col-lg-4 album-art-player">
                            </div>
                            }
                        </div>
                        <div className="fullscreen-track-details">
                            <div className="row fullscreen-track-name">
                                {this.props.trackName}
                            </div>
                            <div className="row fullscreen-artist-name">
                                {this.props.artistName}
                            </div>
                            <div className="row fullscreen-album-name">
                                {this.props.albumName}
                            </div>
                        </div>
                        <div className="row fullscreen-player-control">
                            <span className="player-element">
                            {this.props.playing ?
                            <i className="fas fa-play fa-2x control-button"></i>
                            :
                            <i className="fas fa-pause fa-2x control-button"></i>
                            }
                            </span>
                        </div>
                  </div>
            </div>

            </div>
        )
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FullScreenPlayer))