import React from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

function mapDispatchToProps(dispatch) {
    return {
      updateSearchResults: (results) => dispatch({
          "type": "UPDATE_SEARCH_RESULTS",
          "searchResults": results
      })
    };
}

class SearchBar extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            searchInput: "",
            token: this.props.token
        }
        this.handleSearchInputChange = this.handleSearchInputChange.bind(this)
        this.clearSearchInput = this.clearSearchInput.bind(this)
        this.searchURI = this.searchURI.bind(this)
    }

    handleSearchInputChange(){
        this.searchURI(this.search.value);
    }

    clearSearchInput(){
      this.search.value = ""
      this.props.updateSearchResults([])
    }

  searchURI = async searchQuery =>{
    const token = this.props.token;
    const items = [];
    await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=5`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then(response => response.json())
    .then(function(data){
      data.tracks.items.map(function(item){
        items.push(item);
        return item;
      });
    })
    .catch(function (error){
      console.log(error);
    });

    this.props.updateSearchResults(items)
  }


    render(){
        return(
            <div className="jukebox-search col-lg-12 col-6">
                <input 
                    type="text"
                    id="search-bar"
                    placeholder="Search for music"
                    ref={input => this.search = input}
                    onChange={this.handleSearchInputChange}
                    />
                    <FontAwesomeIcon icon={faTimes} className="clear-search" onClick={() => this.clearSearchInput()}/>
            </div>
        )
    }

}

export default connect(null, mapDispatchToProps)(SearchBar)