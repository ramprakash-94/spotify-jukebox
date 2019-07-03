import React from 'react'
import {connect} from 'react-redux'
import SearchBar from '../components/searchBar';
import SearchResults from '../components/searchResults';
import Modal from 'react-bootstrap/Modal'

function mapStateToProps(state){
    return state
}

class SearchContainer extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return(

            <div className="search-container">
            </div>
        )
    }
}

export default connect(mapStateToProps)(SearchContainer)