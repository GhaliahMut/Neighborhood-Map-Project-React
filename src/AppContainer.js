import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import escapeRegExp from 'escape-string-regexp'
import sortBy from 'sort-by'
import $ from 'jquery'
import swal from 'sweetalert'


let markers = [];
let infoWindows = [];

export default class AppContainer extends Component {
	constructor(props){
		super(props);
		this.openMarker = this.openMarker.bind(this);

		this.state = {
		    locations: [
			    { name: "Stockholm Palace", location: {lat: 59.3268215, lng: 18.0717194}},
			    { name: "ABBA The Museum", location: {lat: 59.324893, lng: 18.0965639}},
			    { name: "Gröna Lund", location: {lat: 59.3233564, lng: 18.0963901}},
			    { name: "Royal Swedish Opera", location: {lat: 59.3296484, lng: 18.0700013}},
			    { name: "Fotografiska", location: {lat: 59.3178415, lng: 18.0859104}},
			    { name: "Moderna Museet", location: {lat: 59.3260466, lng: 18.0846878}},
			    { name: "Vasa Museum", location: {lat: 59.3280233, lng: 18.0913964}},
			    { name: "Gamla Stan", location: {lat: 59.3256984, lng: 18.0718788}}
		    ],
		    map: {},
		    query: ''
		}
	}

	updatequery = (query) => {
	    this.setState({ query: query})
	}


	/* Load Map using react-google-maps*/

	loadMap() {
	    if (this.props && this.props.google) { 
		    const {google} = this.props; 
		    const maps = google.maps; 

		    const mapRef = this.refs.map; 
		    const node = ReactDOM.findDOMNode(mapRef); 

		    const mapConfig = Object.assign({}, {
			    center: {lat: 59.3293235, lng: 18.0685808}, 
			    zoom: 11, 
			    mapTypeId: 'roadmap' 
		    })

		    let map = new maps.Map(node, mapConfig); 
		    this.setState({map: map});

		    /*Add info windows and content to map*/
		    this.state.locations.forEach( location => {
			    let contentString =''

			    let infoWindow = new google.maps.InfoWindow({
				    name: location.name,
				    content: contentString
			    });

		        let bounds = new google.maps.LatLngBounds();

		        /*Add markers to map*/
		        let marker = new google.maps.Marker({
			        map: map,
			        position: {lat: location.location.lat, lng: location.location.lng},  
			        animation: window.google.maps.Animation.DROP,
			        title: location.name 
		        });

		        markers.push(marker);
		        infoWindows.push(infoWindow);

		        /*Add click listenr and animation on marker when openinig info windows*/

		        marker.addListener('click', function() {
		        	/* get detailed data from Wikipedia*/
		        	$.ajax({
				        url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+ marker.title +'&format=json&callback=?',
				        type: 'GET',
				        contentType: "application/json; charset=utf-8",
				        async: false,
				        dataType: 'json',
				        success: function(data, status, jqXHR){
				        	
						    console.log(data);
				         	if(data[0].length !== 0) {

						        for(let i=0; i<data[1].length; i++){
						            infoWindow.setContent(contentString = `<div id="infoWindow-content" tabIndex="0" role="contentinfo">
					                <h2>`+data[1][i]+`</h2>
					                <p>`+data[2][i]+`</p>
					                <a href="`+data[3][i]+`" target="_blank">Visit Wikipedia for more info</a>
					              </div>`);
						        }

						    } else {
						       	console.log("No Contents Have Been Found. Try to Search Manually");
				         		swal("Something went wrong!", "No Contents Have Been Found.Try to Search Manually", "error");
					        }
				        },
				    })
				    .done(function(){
				        console.log("success")
				    })
				    .fail(function(){
				        console.log("error")
				    })
				    .always(function(){
				        console.log("complete")
				    })

			        infoWindows.forEach(info => {info.close() });
		            infoWindow.open(map, marker);
		            if(marker.getAnimation() !== null){
		              marker.setAnimation(null);
		            } else {
		              marker.setAnimation(window.google.maps.Animation.BOUNCE)
		              setTimeout(()=> {marker.setAnimation(null);}, 900)
		            }
		        });

		        markers.forEach((m) => bounds.extend(m.position))
		        map.fitBounds(bounds)
		    })
		}
	}

 
	/*Add animation on marker and openinig info windows when a list item clicked*/

    openMarker(e) {
	    markers.map(marker => {
		    if (e.target.value === marker.title) {
		        infoWindows.map(infoWindow => {
			        if (infoWindow.name === marker.title ) {
					    console.log(infoWindow.name);
					    infoWindows.forEach(info => {info.close() });
				        infoWindow.open(this.props.map, marker);
				        if(marker.getAnimation() !== null){
					        marker.setAnimation(null);
				        } else {
				            marker.setAnimation(window.google.maps.Animation.BOUNCE)
				            setTimeout(()=> {marker.setAnimation(null);}, 900)
				        }
			        }
		        })
		    }
	    })
	}

	componentDidMount() {
	   this.loadMap(); 
	}

	
 
	render() {
		/*filter list items depending on user entry*/
	    const {locations, query} = this.state;
	    let filteredLocations
	    if(query){
			const match = new RegExp(escapeRegExp(query), 'i')
		    filteredLocations = locations.filter((location)=> match.test(location.name))
	    } else {
		    filteredLocations = locations
	    }

	    filteredLocations.sort(sortBy('name'))

		return ( 
		    <div className="container" role="main">
			    <div id="listView-container" role="contentinfo" tabIndex="0">
			        <div id="listView" aria-label="Best Places to Visit in Stockholm">
				        <h1 id="listView-header" tabIndex="0 " role="banner">Best Places to Visit in Stockholm </h1>
				          
				        <input id="search"
				            placeholder="Search For Places to Visit"
				            value= {query}
				            onChange = {(event)=> this.updatequery(event.target.value)}
				            role="Search"
				            tabIndex="0"
				            aria-labelledby="search"/>

				        <ul id="listView-content" role="navigation" aria-labelledby="listView-content" tabIndex="1">
				          
				            {filteredLocations.map((location,index) => {
					            return(
					                <li key={index} tabIndex={index+2} >
					                  <button className="button" type="button" 
					                   aria-label="View details"
					                    onClick={this.openMarker} value={location.name}>
					                    {location.name}
					                   </button>
					                </li>
					            )    
				            })}
				          </ul>
			        </div>
		        </div>
		        <div id="map-container" role="contentinfo" tabIndex="-1">

			        <div id="map"  role="application" ref="map" aria-label="Best Places to Visit in Stockholm" >
			          loading Data...
			        </div>
		        </div>
		    </div>
		)
	}
}
