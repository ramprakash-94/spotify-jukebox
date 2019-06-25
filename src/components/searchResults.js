import React from 'react'

class SearchResults extends React.Component{
    constructor(props){
        super(props)
    }

    searchElement(track){
        console.log(track)
        return(
        <div className="search-result row" key={track.uri} onClick={() => this.props.addToQueue(track.uri)}>
                <div className="col-sm-4 col-lg-4 album-art">
                    <img className="art" src={track.album.images[0].url} alt="Album Art"></img>
                </div>
                <div className="col-sm-8 col-lg-8">
                    <div className="row track-name">{track.name}</div>
                    <div className="row track-artist">{track.artists[0].name}</div>
                </div>
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