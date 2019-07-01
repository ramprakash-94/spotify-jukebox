import React from 'react'
import {connect} from 'react-redux'
import querystring from 'querystring';
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import RoomContainer from './RoomContainer';
import url from '../config'
import {withRouter} from 'react-router-dom';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

const client = new ApolloClient({
link: new HttpLink({ uri: url }),
cache: new InMemoryCache()
})

function mapStateToProps(state){
  return state
}

function mapDispatchToProps(dispatch) {
    return {
      updateUserInfo: (state) => dispatch(updateUserInfo(state))
    };
  }

const updateUserInfo = (state) => (Object.assign({}, state, {
            "type": "UPDATE_USER",
            "loggedIn": true,
            "token": state.token
}))

class LoginContainer extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            loading: false,
            loggedIn: false,
            client_id: "91b73766037a44e7a855d5cf2b0c8768",
            redirect_uri: `${document.location.protocol}//${document.location.host}/spotify-auth`,
        }

        if (document.location.pathname === '/spotify-auth') {
            this.code = querystring.parse(document.location.search)['?code'];
            console.log(this.code)
            this.signInWithToken(this.code.toString())
            this.props.history.push('/')
        }

        this.spotifyAuth = this.spotifyAuth.bind(this)
    }

    componentDidMount(){
        if (!this.code) {
        return;
        }

        this.setState({ loading: true });
    }

    signInWithToken = async (token) => {
        let user = null
        await client.mutate({ 
        variables: { code: token},
        mutation: gql`
            mutation SpotifyAuth($code: String!){
                spotifyAuth(code: $code){
                id
                token
                email
                }
            }
        `,
        })
        .then(function(data){
            console.log(data)
            user = data
        }) 
        .catch(error => console.error(error));
        this.setState({
            loggedIn: true,
        })
        const data = {
            "userId": user.data.spotifyAuth.id,
            "email": user.data.spotifyAuth.email,
            "token": user.data.spotifyAuth.token,
            "loading": true
        }
        this.props.updateUserInfo(data)
    }

    spotifyAuth(event){
        const {client_id, redirect_uri} = this.state
        const encoded_redirect = encodeURIComponent(redirect_uri)
        let uri = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encoded_redirect}&scope=${encodeURIComponent("playlist-modify-public user-read-email streaming user-modify-playback-state user-read-playback-state user-read-currently-playing user-read-private user-read-birthdate")}`
        event.preventDefault()
        window.location = uri
        this.setState({
            loading: true
        })
    }

    render(){
        const {loading, loggedIn} = this.props
        return (
            <div className="login-container container">
                <div className="row">
                    <button className="spotify-login-button" onClick={this.spotifyAuth}>Sign in with Spotify </button>
                </div>
                <div className="row loading">
                    {loading ?
                    <FontAwesomeIcon icon={faSpinner} size="lg" spin/>
                        :
                    <div> </div>
                    }
                </div>
            </div>

        )
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginContainer))