import {UPDATE_TOKEN} from '../constants'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'
import url from '../config'

export function updateToken(payload){
    return ({
        type: UPDATE_TOKEN,
        payload: payload
    })
}

const client = new ApolloClient({
  link: new HttpLink({ uri: url}),
  cache: new InMemoryCache()
})

// export function handleLogin(token){
//   return async dispatch => {
//       console.log("Handling Login")
//       if (token !== "") {
//         const userId = await handleCreateUser(token)
//         const {roomNumber, playlistId} = await handleCreateRoom(userId)
//         const playerCheckInterval = setInterval(() => checkForPlayer(token), 1000);
//         clearInterval(playerCheckInterval);
//         dispatch({
//           "type": "UPDATE_TOKEN",
//           "token": token,
//           "loggedIn": true,
//           "owner": true,
//           "playerCheckInterval": playerCheckInterval,
//           "roomNumber": roomNumber,
//           "playlistId": playlistId
//         })
//       }
//   }
// }

  export async function handleCreateUser(spotifyToken){
    let userId = null
    await client.mutate({
      variables: { token: spotifyToken, type: "owner"},
      mutation: gql`
          mutation AddUser($token: String!, $type: String!){
            addUser(token: $token, type: $type){
              id
              token
              userType
              rooms{
                id
              }
            }
          }
      `,
    })
    .catch(error => console.error(error))
    .then(function(data){
      userId = data.data.addUser.id
    });
    return userId
  }


  export async function popTrack (playlistId){
    return client.mutate({
      variables: { playlistId: playlistId},
      mutation: gql`
          mutation PopTrack($playlistId: ID!){
            popTrack(playlistId: $playlistId){
              id
              nowPlaying
              tracks {
                id
                title
                artist
                album
                albumArt
                uri
              }
          }
        }
      `,
    }).catch(error => console.error(error));
  }

  export async function getAllTracks (playlistId){
    let id = playlistId
    const client = new ApolloClient({
      link: new HttpLink({ uri: url}),
      cache: new InMemoryCache()
    })
    return client.query({
      query: gql`{ 
        allTracksInPlaylist(id: ${id}){
           id 
           tracks{
             id
             title
             artist
             album
             albumArt
             uri
           }
          }
        }
        `,
    }).catch(error => console.error(error));

  }

  function checkForPlayer(token) {
  
    if (window.Spotify !== null) {
      const player = new window.Spotify.Player({
        name: "Spotify Jukebox",
        getOAuthToken: cb => { cb(token); },
      });
      createEventHandlers(player);
  
      // finally, connect!
      player.connect();
      return player

      // TransferPlaybackHere
    }
  }

  function createEventHandlers(player) {
    player.on('initialization_error', e => { console.error(e); });
    player.on('authentication_error', e => {
      console.error(e);
      // this.setState({ loggedIn: false });
    });
    player.on('account_error', e => { console.error(e); });
    player.on('playback_error', e => { console.error(e); });
  
    // Playback status updates
    player.on('player_state_changed', state => onStateChanged(state));
  
    // Ready
    player.on('ready', async data => {
      let { device_id } = data;
      console.log("Let the music play on!");
       this.setState({ deviceId: device_id });
       return 
      transferPlaybackHere();
    });

    // Need to return player and device-id
  }

  function onStateChanged(state) {
    // if we're no longer listening to music, we'll get a null state.
    if (state !== null) {
      const {
        current_track: currentTrack,
        position,
        duration,
      } = state.track_window;
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(", ");
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
      });
    }
    // return state stuff
  }
  
  function transferPlaybackHere() {
    const { deviceId, token } = this.state;
    fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "device_ids": [ deviceId ],
        "play": false,
      }),
    });
  }

  async function addToQueue (songUri) {
      console.log("Song to be added to queue: " + songUri)
      // const {playlistId, token} = this.props
      // console.log(playlistId)
      // console.log(songUri)
      // return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      //   method: "POST",
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     "uris": [songUri]
      //   }),
      // }).then(response => response.json())
      // // .then(function(data){
      // //     console.log(data)
      // // })
      // // .catch(function (error){
      // //   console.log(error);
      // // });
    const {queue, playlistId, token} = this.state
    let tracks = []
    let finalTracks = []
    console.log("Adding " + songUri + " to " + playlistId)
    await client.mutate({
      variables: { playlistId: playlistId, track: songUri, token: token},
      mutation: gql`
          mutation insertTrack($playlistId: ID!, $track: String!, $token: String!){
            insertTrack(playlistId: $playlistId, track: $track, token: $token){
              id
              tracks{
                id
                title
                album
                artist
                albumArt
              }
            }
          }
      `,
    })
    .catch(error => console.error(error))
    .then(function(data){
      tracks = data.data.insertTrack.tracks
      // tracks.forEach(track => finalTracks.push(track) 
      });
      return tracks
    
    // console.log(finalTracks)
    // this.updateStateTracks(finalTracks)
  }

  export async function getTrackInformation (trackURI, token){
    let title, album, artist, albumArt = null
    const trackId = trackURI.replace("spotify:track:", "");
    await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      title = data.name
      album = data.album.name
      artist = data.artists[0].name
      albumArt = data.album.images[0].url
    })
    .catch(function (error){
      console.log(error);
    });
    return {
      trackName: title,
      albumName: album,
      artistName: artist,
      albumArt: albumArt
    }
  }

  export async function getTopTracks(token){
    fetch(`https://api.spotify.com/v1/me/top/tracks`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      console.log(data)
    })
    .catch(function (error){
      console.log(error);
    });
  }

  export async function getAllSpotifyPlaylists(token){
    let items = null 
    await fetch(`https://api.spotify.com/v1/me/playlists`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      console.log(data)
      items = data.items
    })
    .catch(function (error){
      console.log(error);
    });
    return items
  }

  export async function getSpotifyPlaylistTracks(playlistId, token){
    let items = null 
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      console.log(data)
      items = data.items
    })
    .catch(function (error){
      console.log(error);
    });
    return items
  }

  export async function getSavedTracks(token, nextPaging){
    let url = null
    let response = null
    if (nextPaging === null){
      url = "https://api.spotify.com/v1/me/tracks"
    }
    else{
      url = nextPaging
    }
    await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      response = {
        items: data.items,
        next: data.next
      }
      console.log(response)

    })
    .catch(function (error){
      console.log(error);
    });
    return response
  }

  export async function getSpotifyDevices(token){
    await fetch(`https://api.spotify.com/v1/me/player/devices`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      console.log(data)
    })
    .catch(function (error){
      console.log(error);
    });

  }