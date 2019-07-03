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
    // componentDidMount(){
    //     console.log(this.props.queue)
    // }
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
    <div className="queue-result card" onClick={() => this.props.playTrack(track.uri)} key={track.uri}>
        <div className="row queue-album-art">
            <img className="album-art" src={albumArt} alt="Album Art"></img>
        </div>
        <div className="row queue-track-title">
            <div className="col-12 col-lg-12 track-title">{title}</div>
        </div>
        <div className="row queue-artist-title">
            <div className=" track-artist">{artist}</div>
        </div>
    </div> ) 
    }

    renderTrackInfoGuest = (track) => {

    const title = track.title
    const artist = track.artist
    const albumArt = track.albumArt
    return (
    <div className="queue-result card" key={track.uri}>
        <div className="row queue-album-art">
            <img className="album-art" src={albumArt} alt="Album Art"></img>
        </div>
        <div className="row queue-track-title">
            <div className="col-12 col-lg-12 track-title">{title}</div>
        </div>
        <div className="row queue-artist-title">
            <div className=" track-artist">{artist}</div>
        </div>
    </div> ) 
    }

    render(){
        const {queue, nowPlaying} = this.props
        const upNext = queue.filter((item, index) => index > nowPlaying)
        return(
            <div className="queue-container">
                <div className="row">
                    <div className="col-3 pull-left queue-title">
                        <h3>Up Next</h3>
                    </div>
                </div>
                {this.props.owner ?
                <div className="queue scrolling-wrapper">
                    {upNext.map(i => this.renderTrackInfoOwner(i))}
                </div>
                :
                <div className="queue scrolling-wrapper">
                    {upNext.map(i => this.renderTrackInfoGuest(i))}
                </div>
                }
            </div>
        )
    }
}
export default connect(mapStateToProps)(Queue)