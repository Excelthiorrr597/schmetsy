// es5, 6, and 7 polyfills, powered by babel
require("babel-polyfill")

// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
require("isomorphic-fetch")

// universal utils: cache, fetch, store, resource, fetcher, router
// import {cache, fetch, store, resource, router} from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed file to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
if (module.hot) {
    module.hot.accept()
}

// import {React, Component, DOM, Resolver, resolve} from 'react-resolver'
import DOM from 'react-dom'
import React, {Component} from 'react'
import EtsyView from './etsyView.js'

let $ = require('jquery'),
    Backbone = require('backbone'),
    Parse = require('parse'),
    Button = require('react-button')

var APP_ID = 'Exjbs15gkoSXaT5VyrL10zhtJHY7awTJdKff7RPg',
    REST_API = '292OpoFCPu17eL0GwFWFBab8jWtoiXcRcMufqRGm'

var EtsyCollection = Backbone.Collection.extend({
    url: 'https://openapi.etsy.com/v2/listings/active.js',

    apiKey: 'aavnvygu0h5r52qes74x9zvo',

    parse: function(responseData){
        return responseData.results
    }
})

var EtsyModel = Backbone.Model.extend({
    url: 'https://openapi.etsy.com/v2/',

    apiKey: 'aavnvygu0h5r52qes74x9zvo',

    parse: function(responseData) {
        return responseData.results[0]
    }

})

var FavoritesModel = Backbone.Model.extend({
    url: 'https://api.parse.com/1/classes/schmetsy',

    parseHeaders: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-REST-API-Key': REST_API
    }
})

var FavoritesCollection = Backbone.Collection.extend({
    url: 'https://api.parse.com/1/classes/schmetsy',

    parseHeaders: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-REST-API-Key': REST_API
    },

    model: FavoritesModel,

    parse: function(responseData){
        console.log(responseData)
        return responseData.results
    }
})

var EtsyRouter = Backbone.Router.extend({

    routes: {
        'favorites': 'showFavoritesView',
        'search/:query': 'showSearchResults',
        'listings/:listingId': 'showSingleView',
        '*anyroute': 'showDefault'
    },

    showFavoritesView: function(){
        var self = this
        this.fc.fetch({headers:this.fc.parseHeaders}).done(function(){
            DOM.render(<FavoritesView collection={self.fc}/>, document.querySelector('#container'))
        })
    },

    showSearchResults: function(query){
        var self = this
        this.ec.fetch({
            url: this.ec.url,
            data: {
                api_key:this.ec.apiKey,
                keywords:query,
                includes: 'Images',
                limit: 28},
            dataType: 'jsonp'
        }).done(function(){
            DOM.render(<EtsyView collection={self.ec}/>, document.querySelector('#container'))
        })
    },

    showSingleView: function(listingId){
        var self = this
        this.em.fetch(
            {url: `${this.em.url}listings/${listingId}.js`,
                data:
                {api_key:this.em.apiKey,
                includes: 'Images'},
            dataType: 'jsonp'})
        .done(function(){
            DOM.render(<SingleView model={self.em}/>, document.querySelector('#container'))
        })
    },

    showDefault: function(){
        var self = this
        this.ec.fetch(
            {data:
                {api_key:this.ec.apiKey,
                includes: 'Images',
                limit: 28},
            dataType: 'jsonp'})

            DOM.render(<EtsyView collection={self.ec}/>, document.querySelector('#container'))

    },

    initialize: function(){
        this.em = new EtsyModel()
        this.ec = new EtsyCollection()
        this.fc = new FavoritesCollection()
        Backbone.history.start()
    }
})

//SingleView on main page so have access to Parse models

var SingleView = React.createClass({

    render: function(){
        var images = this.props.model.attributes.Images
        return (
            <div id="singleEtsy">
                <FullImage imageArray={images}/>
                <Summary attributes={this.props.model.attributes}/>
            </div>
            )
    }
})

var FullImage = React.createClass({

    render: function() {
        var mainImage = this.props.imageArray[0].url_fullxfull

        return <img src={mainImage}/>
    }
})

var Summary = React.createClass({

    _handleClick: function(){
        console.log(this.props.attributes)
        var attributes = this.props.attributes,
            listingId = attributes.listing_id,
            url = attributes.url,
            image = attributes.Images[0].url_fullxfull,
            description = attributes.description,
            price = attributes.price,
            title = attributes.title


        var fm = new FavoritesModel()
        fm.set({
            listing_id: listingId,
            url: url,
            image: image,
            description: description,
            price: price,
            title: title
        })
        etsyRtr.fc.add(fm)
        fm.save(null,{headers: fm.parseHeaders})
    },

    render: function(){
        var title = this.props.attributes.title,
            description = this.props.attributes.description,
            price = this.props.attributes.price

        return (
            <div id="etsySummary">
                <Button onClick={this._handleClick} label="Favorite!"/>
                <p id="title">{title}</p>
                <p id="description">{description}</p>
                <p id="price">${price}</p>
            </div>
            )
    }
})

var FavoritesView = React.createClass({
    _genSingleEtsy: function(etsyObj){
        return <SingleEtsy model={etsyObj}/>
    },

    render: function(){
        var etsyArr = this.props.collection.models

        return (
            <div>
                <SearchBar />
                <div id="etsyFavContainer">
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

        if (!this.props.model.attributes.image) imageUrl = './images/images.png'
        else imageUrl = this.props.model.attributes.image

        return (
            <div id="etsyItem" onClick={this._handleClick}>
                <img id="etsyMainImage" src={imageUrl} />
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

var etsyRtr = new EtsyRouter()