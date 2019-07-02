import React from 'react'
import {connect} from 'react-redux'
import {getRooms} from '../actions/serverActions'


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

    async handleEntryPoint(){
        let rooms = []
        Promise.resolve(getRooms(this.props.userId))
            .then((data) => {
              rooms = data.data.rooms
              this.props.updateRoomInfo(rooms)
            })
    }

    render(){
      if (this.props.rooms.length === 0){
        return(
          <div className="row room-list">
            No Rooms yet. Create one!
          </div>
        )
      }
      else{
        return(
          <div className="row room-list">
              {
                this.props.rooms.map(i => <p className="room-item" key={i.id}>Room {i.number}</p>)
              }
          </div>
        )
      }
    }

    
}
export default connect(mapStateToProps, mapDispatchToProps)(RoomList)