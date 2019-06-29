import React from 'react';
import {connect} from 'react-redux'
import ProgressBar from 'react-bootstrap/ProgressBar';

function mapStateToProps(state){
    return state
}

function mapDispatchToProps(dispatch) {
    return {
      updatePlayer: (state) => dispatch(updatePlayer(state))
    };
  }

const updatePlayer = (state) => (Object.assign({}, state, {
            "type": "UPDATE_PLAYER"
}))

class TrackProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      position: this.props.position
    }
  }
  componentDidMount(){
    this.controlTimer = setInterval(() => {
      if (this.props.playing){
        this.props.updatePlayer({
          position: this.props.position + 1000
        })
      }
    }, 1000)
  }

  millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  render(){
    const pos = ((parseInt(this.props.position)/parseInt(this.props.duration)) * 100).toString() + "%"
    return(
      // <div className="progress">
      //   {/* <span className="current-time">{this.props.elapsed}</span> */}
      //   {/* <progress className="track-progress"
      //      value={this.props.position}
      //      max={this.props.duration}></progress> */}
      //      <progress value="60" max="100"></progress>
      //    {/* <span className="total-time">{this.props.total}</span> */}
      // </div>
      // <div class="track-progress row">
      //   <div className="progress-text col-1 col-lg-1">{this.millisToMinutesAndSeconds(this.props.position)}</div>
        <div className="progress ">
            <div className="progress-bar" style={{width: pos}}>
            </div>
        </div>
      //   <div className="progress-text col-1 col-lg-1">{this.millisToMinutesAndSeconds(this.props.duration)}</div>
      // </div>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(TrackProgress)