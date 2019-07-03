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
      albumArt: null,
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
      currentTrack: null,
      loading: false,
      player: null,
      rooms: [],
      createRoomError: false,
      fullscreen: false,
      joinAsGuest: null,
      nowPlaying: 0
    };

function rootReducer (state = initialState, action){
    switch(action.type){
        case "UPDATE_PLAYER":
            return Object.assign({}, state, action)
        case "UPDATE_SEARCH_RESULTS":
            return Object.assign({}, state, action)
        case "UPDATE_USER":
            return Object.assign({}, state, action)
        case "UPDATE_ROOM":
            return Object.assign({}, state, action)
        case "UPDATE_TRACKS":
            return Object.assign({}, state, action)
        case "UPDATE_ROOMS":
            return Object.assign({}, state, action)
        case "LOGOUT":
            return Object.assign({}, initialState, action)
        case "LEAVE_ROOM":
            return Object.assign({}, state, action)
        default:
            return state
    }
}

export default rootReducer