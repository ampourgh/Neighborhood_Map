import React, {Component} from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun, faSearch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import InfoWindowEx from './infoWindowEx'

import axios from 'axios';
let stylesDay = require('../json/content-style-day.json');
let stylesNight = require('../json/content-style-night.json');

let mapOptions = (function () {
    if (localStorage.getItem("mapOptions") !== null) {
        console.log('EXISTS');
        return localStorage.getItem("mapOptions");

    } else {
        console.log('!EXISTS');
        localStorage.setItem("mapOptions", 'stylesnight');
        return 'stylesnight';
        // localStorage.setItem("mapOptions", JSON.stringify(mapOptions));
    }
})();

const ModeMapBg = (mapOptions === '"stylesday"')?stylesDay:stylesNight;
let ModeSideBg = (mapOptions === '"stylesday"') ? `options-box stylesday` : `options-box stylesnight`;
const Mode = props => (props.mode === '"stylesday"') ? < FontAwesomeIcon icon = {faSun}/>:<FontAwesomeIcon icon={faMoon}/> ;
const FilterBoolean = props => (props.boolean === true)? '':'empty';

export class Locations extends Component {

    constructor(props) {
        super(props);
        this.state = {
            locations: [],
            filter:[],
            markerObjects: [],
            markers: [],
            filterBoolean: true, 
            mode: mapOptions,
            activeMarker: {},
            selectedPlace: {},
            showingInfoWindow: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.onMarkerMounted = element => {
            this.setState(prevState => ({
                markerObjects: [...prevState.markerObjects, element]
            }))
        }
    }
    
    componentDidMount() {
       axios.get('http://localhost:5000/locations/')
           .then(response => {
                // this.state.Locations(response.data);
               this.setState({
                   locations: response.data
               })

               let filtering = [];
                for (let i = 0; i < response.data.length; i++) {
                    filtering.push({
                        id: i,
                        content: this.state.locations[i]
                    });
                }

                this.setState({
                   filter: filtering
               })

           })
           .catch((error) => {
               console.log(error);
           })
    }

    handleChange (e) {
        let modeChange = (this.state.mode === 'night') ? 'day' : 'night';
        this.setState({ mode: modeChange });
    }
    


    showChoices = () => {
        console.log(this.state.locations)
    }

    contentUpdate = e => {
        let searchTerm = e.target.value;
        let filtering = []
        let count = 0;

        if (searchTerm === '') {

            count = 9999;

            for (let i = this.state.locations.length - 1; i >= 0; i--) {
                filtering.push({id: i, content: this.state.locations[i]});
            }

            this.setState({
                filter: filtering,
                filterBoolean: true
            })

            console.log('show all')
        } else {

            for (let i = this.state.locations.length - 1; i >= 0; i--) {

                if (this.state.locations[i].title.toLowerCase().indexOf(searchTerm) > -1) {

                    filtering.push({id: i, content: this.state.locations[i]});
                    count += 1;

                }

            }

            this.setState({
                filter: filtering,
                filterBoolean: true
            })

            if (count === 1) {
                this.onMarkerClick(this.state.markerObjects[this.state.filter[0].id].props, this.state.markerObjects[this.state.filter[0].id].marker)
            }

            if (count === 0) {
                this.setState({
                    filterBoolean: false
                })
            }
        }
    }

    onMarkerClick = (props, marker) => {
        console.log(window.parent.google.maps.Marker)
        this.setState({
            selectedPlace: props.value,
            activeMarker: marker,
            showingInfoWindow: true
        })
    }


    displayMarkers = () => {

        let markersJsx = []
        
        this.state.filter.forEach(location => {
            markersJsx.push(<Marker 
                        ref={this.onMarkerMounted}
                        key={location.content._id}
                        id={location.content._id} 
                        value={location.content}
                        icon={"http://maps.google.com/mapfiles/ms/icons/blue.png"}
                        position = {
                                {
                                    lat: location.content.coordinates.lat,
                                    lng: location.content.coordinates.lng
                                }
                            }
                            onClick={this.onMarkerClick}
                    />);
            

        })

        return markersJsx;
    }


    displayLinks = () => {

        let markers = this.state.markerObjects;
        let newLocations = [];

        if(this.state.filter[0]!==undefined) {
            // console.log(this.state.locations[i]._id === this.state.filter[i]._id)
            for (let i = 0; i <= this.state.filter.length - 1; i++) {
                newLocations.push(<p><a href="#" onClick={() => this.onMarkerClick(markers[this.state.filter[i].id].props, markers[this.state.filter[i].id].marker)}>{this.state.filter[i].content.title}</a></p>);
            }

        }

        return newLocations;
        
    }

    changeMode = () => {
        mapOptions = (mapOptions == '"stylesnight"') ? 'stylesday' : 'stylesnight';

        localStorage.setItem("mapOptions", JSON.stringify(mapOptions));
        window.location.reload();
    }

    render() {
        return (
            <>
                <div id="options-box" className={ModeSideBg}>

                    <span onClick={() => this.changeMode()} className="icon-mode-style">
                        <Mode mode={this.state.mode} />
                    </span>

                    <br />
                    <h1>
                        <FontAwesomeIcon icon={faMapMarkerAlt} />&nbsp;
                        locations
                    </h1>

                    <div className="filter">
                        <i onClick={this.showChoices} className="fas fa-bars mobile-hamburger"></i>
                        &nbsp;&nbsp;
                        <input type="text" className="filter-input" onKeyUp={this.contentUpdate} type="text" /> 
                        &nbsp;&nbsp;
                        <span><FontAwesomeIcon icon={faSearch} /></span>
                    </div>

                    <FilterBoolean boolean={this.state.filterBoolean} />
                    {this.displayLinks()}

                </div>
                <Map
                    google={this.props.google}
                    zoom={10}
                    styles={ModeMapBg}
                    initialCenter = {
                        {
                            lat: 29.496698,
                            lng: -95.38426199999999
                        }
                    }
                    defaultCenter = {
                        {
                            lat: 29.496698,
                            lng: -95.38426199999999
                        }
                    }
                    position = {
                        {
                            lat: 29.496698,
                            lng: -95.38426199999999
                        }
                    }
                    className="map"
                    >
                    {this.displayMarkers()}

                    <InfoWindowEx marker={this.state.activeMarker} visible={this.state.showingInfoWindow}>
                        <div>
                            <h1>{this.state.selectedPlace.title}</h1>
                            <p>{this.state.selectedPlace.address}</p>
                        </div>
                    </InfoWindowEx>
                </Map>

            </>
        )
    }

}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyD5Ppf6iBwfPB6w6baG4sUSJAtIF4GMhQw'
})(Locations);