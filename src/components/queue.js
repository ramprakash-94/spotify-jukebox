import React from 'react'
import {connect} from 'react-redux'

function mapStateToProps(state){
    return state
}

class Queue extends React.Component{
    constructor(props){
        super(props)
        this.renderQueue = this.renderQueue.bind(this)
        this.renderPlayableQueue = this.renderPlayableQueue.bind(this)
        this.renderTrackInfoOwner = this.renderTrackInfoOwner.bind(this)
        this.renderTrackInfoGuest = this.renderTrackInfoGuest.bind(this)
    }
    componentDidMount(){
        console.log(this.props.queue)
    }
    renderQueue(){
        let results = <h4>No tracks in the queue</h4>;
        if (this.props.queue){
        results = this.props.queue.map(track => <div className="queue-result row">{track.title}</div> ); 
        }
        return results;
    }

    renderPlayableQueue(){
        let results = <h4>No tracks in the queue</h4>;
        const {queue} = this.props
        if (this.props.queue){
        results = this.props.queue.map(i => this.renderTrackInfo(i)); 
        }
        return results;
    
    }

    renderTrackInfoOwner = (track) => {

    const title = track.title
    const artist = track.artist
    const albumArt = track.albumArt
    return (
    <div className="queue-result row" onClick={() => this.props.playTrack(track.uri)} key={track.uri}>
        <div className="col-xs-4 col-lg-4">
            <img className="album-art" src={albumArt} alt="Album Art"></img>
        </div>
        <div className="col-xs-8 col-lg-8">
            <div className="row track-title">{title}</div>
            <div className="row track-artist">{artist}</div>
        </div>
    </div> ) 
    }

    renderTrackInfoGuest = (track) => {

    const title = track.title
    const artist = track.artist
    const albumArt = track.albumArt
    return (
    <div className="queue-result row" key={track.uri}>
        <div className="col-xs-4 col-lg-4">
            <img className="album-art" src={albumArt} alt="Album Art"></img>
        </div>
        <div className="col-xs-8 col-lg-8">
            <div className="row track-title">{title}</div>
            <div className="row track-artist">{artist}</div>
        </div>
    </div> ) 
    }

    render(){
        const {queue} = this.props
        console.log(this.props)
        console.log(queue)
        return(
            <div className="queue-container">
                <div className="row">
                    <div className="col-3">
                        <h3>Queue</h3>
                    </div>
                </div>
                {this.props.owner ?
                <div className="queue row">
                    {queue.map(i => this.renderTrackInfoOwner(i))}
                </div>
                :
                <div className="queue row">
                    {queue.map(i => this.renderTrackInfoGuest(i))}
                </div>
                }
            </div>
        )
    }
}
export default connect(mapStateToProps)(Queue)