import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

class SearchResults extends React.Component{
    constructor(props){
        super(props)
        this.searchElement = this.searchElement.bind(this)
        this.addTrack = this.addTrack.bind(this)
        this.state = {
            loading: null
        }
    }
    componentDidMount(){
        if (this.state.loading !== null && this.props.queue.includes(this.state.loading)){
            this.setState({
                loading: null
            })
        }
    }

    addTrack(uri){
        this.props.addToQueue(uri)
        this.setState({
            loading: uri
        })
    }

    searchElement(track){
        return(
        <div className="search-result row" key={track.uri} >
                <div className="col-xs-4 col-lg-4 album-art">
                    <img className="art" src={track.album.images[0].url} alt="Album Art"></img>
                </div>
                <div className="col-xs-6 col-lg-6">
                    <div className="row track-name">{track.name}</div>
                    <div className="row track-artist">{track.artists[0].name}</div>
                </div>
                {
                    (this.props.queue.filter(item => item.uri === track.uri).length > 0) ?
                    <div className="col-xs-2 col-lg-2">
                        <FontAwesomeIcon icon={faCheck} className="added-track"/>
                    </div>
                    :
                    <div>
                    {
                        (this.state.loading === track.uri) ?
                            <FontAwesomeIcon icon={faSpinner} size="lg" spin/>
                        :
                        <div className="col-xs-2 col-lg-2" onClick={() => this.addTrack(track.uri)}>
                            <FontAwesomeIcon icon={faPlus} className="add-track"/>
                        </div>
                        
                    }
                    </div>
                }
        </div>
        )
    }

    render(){
        return(
            <div className="search-results">
                {this.props.results.map(i => this.searchElement(i))}
            </div>
        )
    }
}
export default SearchResults