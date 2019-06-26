import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'
import url from '../config'

const client = new ApolloClient({
  link: new HttpLink({ uri: url}),
  cache: new InMemoryCache()
})

export async function addToPlaylist (playlistId, songUri, token){
    console.log("Song to be added to queue: " + songUri)
    console.log("Adding " + songUri + " to " + playlistId)
    return client.mutate({
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
                uri
              }
            }
          }
      `,
    })
    .catch(error => console.error(error))
  }

export async function updateRoom(roomNumber, track, position, duration, playing, token){
    return client.mutate({
      variables: { num: roomNumber, track: track, position: position, duration: duration, playing: playing, token: token},
      mutation: gql`
          mutation UpdateRoom($num: Int!, $track: String!, $token: String!, $position: Int!, $duration: Int!, $playing: Boolean!){
            updateRoom(num: $num, track: $track, duration: $duration, position: $position, playing: $playing, token: $token){
              id
            }
          }
      `,
    })
    .catch(error => console.error(error))

  }

export async function handleCreateRoom (userId){
    console.log("Creating Room for user: " + userId)
    return client.mutate({
      variables: { userId: userId},
      mutation: gql`
          mutation CreateRoom($userId: ID!){
            createRoom(userId: $userId){
              id
              number
              playlists{
                id
                tracks {
                  id
                }
              }
            }
          }
      `,
    })
    .catch(error => console.error(error))
  }

export async function handleJoinRoom (roomNumber){
    console.log(roomNumber)
    const client = new ApolloClient({
      link: new HttpLink({ uri: url}),
      cache: new InMemoryCache()
    })
    return client.query({
      query: gql` 
      { 
        room(num: ${roomNumber}){ 
          id 
          number
          currentTrack{
            id
            artist
            uri
            album
            title
          }
          playlists{
            id
          }
          }
        }
      `,
    }).catch(error => console.error(error));
  }