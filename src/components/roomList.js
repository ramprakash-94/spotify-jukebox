import React from 'react'
import {connect} from 'react-redux'
import {getRooms} from '../actions/serverActions'
import {withRouter} from 'react-router-dom';


function mapStateToProps(state){
  return state
}

function mapDispatchToProps(dispatch) {
    return {
      updateRoomInfo: (rooms) => dispatch({
        type: "UPDATE_ROOMS",
        rooms: rooms
      })
    };
  }

class RoomList extends React.Component{
    constructor(props){
        super(props)
        this.handleEntryPoint = this.handleEntryPoint.bind(this)
    }
    componentDidMount(){
      this.handleEntryPoint()
    }
    componentDidUpdate(){
      console.log(this.props)
    }

    async handleEntryPoint(){
        let rooms = []
        console.log(this.props.userId)
        Promise.resolve(getRooms(this.props.userId))
            .then((data) => {
              rooms = data.data.rooms
              this.props.updateRoomInfo(rooms)
            })
    }
    goToRoom(num){
      this.props.history.push(`/room/${num}`)
    }


    render(){
      if (this.props.rooms.length === 0){
        return(
          <div className="room-list">
            No Rooms! 
          </div>
        )
      }
      else{
        return(
          <div>
            {
              this.props.createRoomError ?
              <div className="error">
                <p>Cannot create more than 5 rooms </p>
              </div>
              :
              <div>
              </div>
            }
            <div className="row room-list">
                {
                  this.props.rooms.map(i => <p className="room-item" key={i.id} onClick={() => this.goToRoom(i.number)}>Room {i.number}</p>)
                }
            </div>
          </div>
        )
      }
    }

    
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomList))