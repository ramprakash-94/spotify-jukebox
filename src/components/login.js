import React from 'react'
import CreateRoom from './createRoom'

const Login = () =>
    <div className="sign-in">
        <CreateRoom/>
        {/* <div className="join-room">
        <h3>Join Room</h3>
        <p>
            <input className="sign-in-input" type="text" value={this.props.roomNumber} onChange={e => this.setState({ roomNumber: e.target.value })} />
        </p>
        <p>
            <button className="go-button"onClick={() => this.handleJoinRoom()}>Go</button>
        </p>
        </div> */}
    </div>

export default Login