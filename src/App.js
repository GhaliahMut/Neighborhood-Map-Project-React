import React, { Component } from 'react'
import { GoogleApiWrapper } from 'google-maps-react'
import AppContainer from './AppContainer'
import './App.css';

class App extends Component {
  render() {
    return (
    	<div>
			<AppContainer google={this.props.google}/>
    	</div>
    );
  }
}


export default GoogleApiWrapper({
  apiKey: 'AIzaSyDJ7No2h2rZYXI0SxmpdiD1qndeUu_3f4A',
})(App)
