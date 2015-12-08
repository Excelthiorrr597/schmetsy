import React, {Component} from 'react'

var Button = require('react-button')

var EtsyView = React.createClass({

    componentDidMount: function(){
        this.props.collection.on('sync', ()=>this.forceUpdate())
    },

    componentWillUnmount: function(){
        this.props.collection.off('sync', ()=>this.forceUpdate())
    },

    _genSingleEtsy: function(etsyObj){
        return <SingleEtsy model={etsyObj}/>
    },

    _handleFavoriteClick: function() {
        location.hash = `favorites`
    },

    render: function(){
        var etsyArr = this.props.collection.models

        return (
            <div>
                <Button onClick={this._handleFavoriteClick} label="Visit Favorites Page!"/>
                <SearchBar />
                <div id="etsyContainer">
                    {etsyArr.map(this._genSingleEtsy)}
                </div>
            </div>
            )
    }
})

var SingleEtsy = React.createClass({

    _handleClick: function(){
        var etsyId = this.props.model.attributes.listing_id
        location.hash = `listings/${etsyId}`
    },

    render: function(){
        var title = this.props.model.attributes.title,
            price = this.props.model.attributes.price,
            imageUrl = ''

        if (!this.props.model.attributes.Images[0].url_170x135) imageUrl = './images/images.png'
        else imageUrl = this.props.model.attributes.Images[0].url_170x135

        return (
            <div id="etsyItem" onClick={this._handleClick}>
                <img id="estyMainImage" src={imageUrl} />
                <p>{title}</p>
                <p>${price}</p>
            </div>
            )
    }
})

var SearchBar = React.createClass({

    _handleUserInput: function(event){
        if (event.which === 13) {
            event.preventDefault()
            location.hash = `search/${event.target.value}`
            event.target.value = ''
        }
    },

    render:function(){
        return <input id="searchBar" onKeyPress={this._handleUserInput} placeholder="Search Etsy"/>
    }
})


export default EtsyView