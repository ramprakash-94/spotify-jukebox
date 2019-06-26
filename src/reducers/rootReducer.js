import {UPDATE_PLAYER} from '../constants'

const initialState = {
      graphqlURI: "localhost:4000",
      token: "",
      deviceId: "",
      loggedIn: false,
      error: "",
      trackName: "Track Name",
      artistName: "Artist Name",
      albumName: "Album Name",
      playing: false,
      position: 0,
      duration: 0,
      searchResults: [],
      roomNumber: null,
      userId: null,
      playlistId: null,
      queue: [],
      client_id: "91b73766037a44e7a855d5cf2b0c8768",
      redirect_uri: "localhost:3000",
      currentTrack: null
    };

function rootReducer (state = initialState, action){
    switch(action.type){
        case "UPDATE_PLAYER":
            console.log("Updated Player")
            console.log(action)
            return Object.assign({}, state, action)
        case "UPDATE_SEARCH_RESULTS":
            return Object.assign({}, state, action)
        case "UPDATE_USER":
            console.log("Updated User")
            console.log(action)
            return Object.assign({}, state, action)
        case "UPDATE_ROOM":
            console.log("Updating Room")
            return Object.assign({}, state, action)
        case "UPDATE_TRACKS":
            console.log("Track added")
            console.log(action)
            return Object.assign({}, state, action)
        default:
            return state
    }
}

export default rootReducer