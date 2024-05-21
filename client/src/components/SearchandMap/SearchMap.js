import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import './SearchMap.css';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, CardActions } from '@mui/material';
import Pagination from '@mui/material/Pagination';




const SearchAndMap = () => {
    const prices = [
        1,
        2,
        3,
        4,
    ]   


    const [formats, setFormats] = React.useState(() => ['hot_and_new', 'open_now']);

    const handleFormat = (event, newFormats) => {
      setFormats(newFormats);
    };

    const getPriceLabel = (price) => {
        switch (price) {
            case 1:
                return '$';
            case 2:
                return '$$';
            case 3:
                return '$$$';
            case 4:
                return '$$$$';
            default:
                return '$$';
        }
    };

    /* VARIABLES */
    const [optionVal, setOptionVal] = useState('');
    const handleOptionChange = (event) => {
        setOptionVal(event.target.value);
    };

    const [priceVal, setOptionPrice] = useState(prices[0]);

    const [limitVal, setLimit] = useState(9);
    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const [sortByVal, setSortBy] = useState('best_match');
      
    const [nRadius, setRadius] = useState(9600); 
    const handleRadiusChange = (event, value) => {
        setRadius(value); 
        circleRef.current.setRadius(value); 
    };

    const [yelpBackendData, setYelpBackendData] = useState([]);

    const [clickedLatLng, setClickedLatLng] = useState({ lat: 33.88134, lng: -117.8818 });
    const mapRef = useRef(null);
    const circleRef = useRef(null);


    useEffect(() => {
        const loadGoogleMapsScript = () => {
            const script = document.createElement('script');

            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;

            script.async = true;
            script.defer = true;

            script.onload = () => {
                initMap();
            };

            document.head.appendChild(script);
        };

        const initMap = () => {
            if (!window.google || !window.google.maps || !window.google.maps.Map) {
                console.error('Error: google.maps.Map not defined');
                return;
            }
        
            const fullerton = { lat: 33.8831307524001, lng: -117.88541077620087 };
            const map = createMap(fullerton);
        
            if (!map) {
                console.error('Error: Unable to create map');
                return;
            }
        
            const initCircle = createCircle(map, fullerton);
            const autocomplete = initializeAutocomplete(map, initCircle);
            circleRef.current = initCircle;
            mapRef.current = map;
        
            map.addListener('click', (clickEvent) => {
                handleMapClick(clickEvent, map, initCircle);
            });
        };
        
        const createMap = (center) => {
            return new window.google.maps.Map(document.getElementById('map'), {
                zoom: 11,
                center: center,
            });
        };
        
        const createCircle = (map, center) => {
            return new window.google.maps.Circle({
                strokeColor: "#AC3939",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#AC3939",
                fillOpacity: 0.15,
                map: map,
                center: center,
                radius: nRadius,
            });
        };
        
        const initializeAutocomplete = (map, circleRef) => {
            const input = document.getElementById('searchTextField');

            input.style.border = '1px'
            input.style.borderColor = '#AC3939'
            input.style.textAlign = 'center'


            const autocomplete = new window.google.maps.places.Autocomplete(input);
        
            autocomplete.addListener('place_changed', () => {
                handlePlaceChanged(autocomplete, map, circleRef);
            });
        
            input.addEventListener('keypress', (event) => {
                handleKeyPress(event, input, autocomplete);
            });
        
            return autocomplete;
        };
        
        const handleMapClick = (clickEvent, map, circle) => {
            const lat = clickEvent.latLng.lat();
            const lng = clickEvent.latLng.lng();
            const clickedLatLng = { lat, lng };
        
            map.panTo(clickEvent.latLng);
            setClickedLatLng(clickedLatLng);
            circle.setCenter(clickEvent.latLng);
        };
        
        const handlePlaceChanged = (autocomplete, map, circle) => {
            const place = autocomplete.getPlace();
        
            if (place.geometry && place.geometry.location instanceof window.google.maps.LatLng) {
                const autoLatLng = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
        
                map.panTo(place.geometry.location);
                setClickedLatLng(autoLatLng);
                circle.setCenter(place.geometry.location); // Update the center of the existing circle
            } else {
                console.log("No geometry or location found for the selected place, or location is not an instance of google.maps.LatLng.");
            }
        };
        
        
        const handleKeyPress = (event, input, autocomplete) => {
            if (event.key === 'Enter') {
                if (input.value.trim() !== '') {
                    var firstPrediction = document.querySelector('.pac-container .pac-item');
                    if (firstPrediction) {
                        firstPrediction.click();
                    }
                }
            }
        };
        

        if (!window.google || !window.google.maps || !window.google.maps.Map) {
            loadGoogleMapsScript();
        } else {
            initMap();
        }

    }, []);


    let markers = []

    function addMarker(position, content) {
        const marker = new window.google.maps.Marker({
            position,
            map: mapRef.current, // This should refer to your Google Map instance
        });
    
        const infoWindow = new window.google.maps.InfoWindow({
            content: content // Content can be a string or HTML
        });
    
        marker.addListener('click', () => {
            infoWindow.open({
                anchor: marker,
                map: mapRef.current,
                shouldFocus: false,
            });
        });

        markers.push(marker);
    }
    

    const handleSearch = async () => {
        console.log("handle search");
        console.log("clearing markers");
        console.log("markers (1):", markers);
        // mapRef.current.clearOverlays();
        console.log("markers (2):", markers);
    
        try {
            const params = {
                lat: clickedLatLng.lat,
                lng: clickedLatLng.lng,
                radius: nRadius,
                price: priceVal,
                sort_by: sortByVal,
                limit: limitVal,
            };

            // if (formats.includes("hot_and_new")) {
            //     params.attributes = "hot_and_new";
            // }
            // if (formats.includes("open_now")) {
            //     params.open_now = true;
            // }
    
            console.log("params: ", params);
    
            // Make a GET request with parameters as query string
            const queryString = Object.keys(params)
                .map(key => `${key}=${encodeURIComponent(params[key])}`)
                .join('&');
                console.log(queryString)
            const response = await fetch(`/api?${queryString}`);
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
    
            // Add new markers
            data.businesses.forEach(business => {
                const position = {
                    lat: business.coordinates.latitude,
                    lng: business.coordinates.longitude
                };

                const placeName = business.name;
                addMarker(position, placeName);
            });
            console.log(data);
            setYelpBackendData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    

    

        
    

    

    return (
        <div className='parent-container'>
            <div id="autocomplete-container">
                <TextField
                    hiddenLabel
                    id="standard-size-normal"
                    variant="standard"
                    placeholder='restaurants'
                    value={optionVal}
                    sx={{
                        marginTop : '1vh',
                    }}
                    onChange={handleOptionChange}
                />
                <p> near </p>
                <input id="searchTextField" type="text" size="50"/>
                <Button 
                    className="searchButton" 
                    variant="contained"
                    sx={{
                        backgroundColor: '#AC3939',
                        textAlign: 'center',
                        '&:hover': {
                            backgroundColor: 'gray', 
                            color: 'white'
                        }
                        
                    }} 
                    onClick={handleSearch}>Search
                </Button>
            </div>
            
            <div className='search-container'>
                <Select
                    className='paramButton'
                    value={priceVal}
                    onChange={(event) => {
                        setOptionPrice(event.target.value)	
                    }}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx = {{
                        textAlign: 'center',
                        width: '6.5vw',
                        height: '5vh',
                        borderRadius: '2vw',
                        backgroundColor: '#AC3939',
                        color : '#FFFFFF',
                        marginRight: '0.5vw'
                    }}
                    >
                    {prices.map((price, index) => (
                        <MenuItem
                            key={index}
                            value={price}
                        >
                            {getPriceLabel(price)}
                        </MenuItem>
                    ))}
                </Select>

                <Select
                    value={sortByVal}
                    onChange={(event) => {
                        setSortBy(event.target.value)	
                    }}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx = {{
                        textAlign: 'center',
                        width: '6.5vw',
                        height: '5vh',
                        borderRadius: '2vw',
                        backgroundColor: '#AC3939',
                        color : '#FFFFFF',
                        marginRight: '0.5vw',
                        fontSize: '0.65vw'
                    }}
                    >
                    <MenuItem value="best_match">Best Match</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                    <MenuItem value="review_count">Review Count</MenuItem>
                    <MenuItem value="distance">Distance</MenuItem>
                </Select>

                <Select
                    value={limitVal}
                    onChange={handleLimitChange}
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx = {{
                        textAlign: 'center',
                        width: '6.5vw',
                        height: '5vh',
                        borderRadius: '2vw',
                        backgroundColor: '#AC3939',
                        color : '#FFFFFF',
                        marginRight: '0.5vw'
                    }}
                    >
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={18}>18</MenuItem>
                    <MenuItem value={27}>27</MenuItem>
                </Select>

                <ToggleButtonGroup
                    color="primary"
                    value={formats}
                    onChange={handleFormat}
                    aria-label="Platform"
                >
                    <ToggleButton value="hot_and_new"
                        sx = {{
                            textAlign: 'center',
                            width: '6.5vw',
                            height: '5vh',
                            borderRadius: '2vw',
                            backgroundColor: '#AC3939',
                            color : '#FFFFFF',
                            fontSize: '0.75vw'
                        }}
                    >Hot and New</ToggleButton>
                    <ToggleButton value="open_now"
                        sx = {{
                            textAlign: 'center',
                            width: '6.5vw',
                            height: '5vh',
                            borderRadius: '2vw',
                            backgroundColor: '#AC3939',
                            color : '#FFFFFF',
                            fontSize: '0.75vw'
                        }}    
                    >Open Now</ToggleButton>
                </ToggleButtonGroup>
            
            
            </div>

            <div className='slider-container'>
                <Slider
                    min={1600}    // minimum radius value in meters
                    max={40000}   // maximum radius value in meters
                    step={1600}   // step size for the slider
                    onChange={handleRadiusChange}
                    sx={{
                        color: '#AC3939'
                    }}
                    value={nRadius} // Slider value in meters
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => `${value / 1600} ${value === 1600 ? 'mile' : 'miles'}`}
                    aria-labelledby="radius-slider"
                />
            </div>

            <div className='map-and-search'>
                <div id="map"></div>
                <div id="searchResults">
                    <div>
                        {yelpBackendData.length === 0 ? (
                            <p></p>
                        ) : (
                            <div className="grid">
                                {yelpBackendData.businesses.map((business, i) => {
                                    return (
                                        <div key={i} className='card'>
                                                <CardMedia>
                                                    <img className='businessImg' src={business.image_url} alt={business.name} />
                                                </CardMedia>
                                            <a href={business.url} target="_blank" rel="noopener noreferrer">{business.name}</a>
                                            <p>Rating: {business.rating}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SearchAndMap;

// <Card key={i} style={{ width: 383, height: 553 }}>
//     <CardActionArea>
//         <CardMedia style={{ width: '100%', height: '383px' }}>
//             <img className='businessImg' src={business.image_url} alt={business.name} style={{ width: '100%', height: '100%' }} />
//         </CardMedia>
//     </CardActionArea>
//     <CardContent>
//         <p>Name: {business.name}</p>
//         <p>Rating: {business.rating}</p>
//     </CardContent>
// </Card>



/*
const handleSearch = async () => {
    // Clear the existing search results and markers

    console.log("Searching for:", optionVal, "near lat:", clickedLatLng.lat, "lng:", clickedLatLng.lng, "within a", nRadius, "m radius." );
    console.log("Price: ", priceVal);
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    let getNextPage;
    const moreButton = document.getElementById("more");

    moreButton.onclick = function () {
        moreButton.disabled = true;
        if (getNextPage) {
            getNextPage();
        }
    };

    service.nearbySearch(
        {   location: clickedLatLng, 
            radius: nRadius, 
            type: optionVal, 
            maxprice: priceVal,
        },
        (results, status, pagination) => {
            if (status !== "OK" || !results) return;
            console.log("search results")
            // console.log(results)
            results.forEach(place => {  
                const name = place.name;
                const latitude = place.geometry.location.lat();
                const longitude = place.geometry.location.lng();
                const photos = place.photos
                console.log("photos : ", photos)

            
                // console.log("establishment name:", name, "{", latitude, ",", longitude,"}");
            });

            // Alphabetize the results by name
            const sortedResults = results.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            const filteredResults = sortedResults.filter(place => {
                // Check if the first type matches optionVal
                return place.types[0] === optionVal;
            });

            addPlaces(sortedResults, mapRef.current);
            removePlaces(sortedResults, mapRef.current)

            moreButton.disabled = !pagination || !pagination.hasNextPage;
            if (pagination && pagination.hasNextPage) {
                getNextPage = () => {
                    // Note: nextPage will call the same handler function as the initial call
                    pagination.nextPage();
                };
            }
        }
    );

    markers = []
};

function addPlaces(places, map) {
    const placesList = document.getElementById("places");
    placesList.innerHTML = '';

    for (const place of places) {
        // if (place.geometry && place.geometry.location instanceof window.google.maps.LatLng) {
        const image = {
            url: place.icon,
            size: new window.google.maps.Size(71, 71),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(17, 34),
            scaledSize: new window.google.maps.Size(25, 25),
        };

        const markerLatLng = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        }

        // console.log("searchMarker latLng: ",markerLatLng)

        const marker = new window.google.maps.Marker({
            map,
            icon: image,
            title: place.name,
            position: markerLatLng,
        });

        markers.push(marker); // Store the marker in the array

        const li = document.createElement("li");

        li.textContent = place.name;
        placesList.appendChild(li);
        li.addEventListener("click", () => {
            map.panTo(place.geometry.location);
            window.google.maps.event.addListenerOnce(map, 'idle', () => {
                map.setZoom(13);
            });
        });
    }
}
    
function removePlaces(markers,map) {
    const clearButton = document.getElementById("clear");
    const placesList = document.getElementById("places");
    clearButton.onclick = function() {
        deleteMarkers();
        placesList.innerHTML = '';
    }

}

function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
  
// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
    setMapOnAll(null);
}

function deleteMarkers() {
    hideMarkers();
    markers = [];
}
/*

/*

// function initializeAutocomplete() {
//     var input = document.getElementById('searchTextField');
//     var autocomplete = new window.google.maps.places.Autocomplete(input);

//     // Listen for the 'place_changed' event
//     autocomplete.addListener('place_changed', function() {
//         infoWindow.close()
//         var place = autocomplete.getPlace();
//         console.log("Autocomplete result: ", place); // Log the details of the selected place
    
//         // Log place.geometry.location for debugging
//         console.log("Geometry location: ", place.geometry.location);
    
//         if (place.geometry && place.geometry.location instanceof window.google.maps.LatLng) {
//             const autoLatLng = {
//                 lat: place.geometry.location.lat(),
//                 lng: place.geometry.location.lng()
//             };
//             console.log("autoComplete lat/lng: ", autoLatLng);
//             map.panTo(place.geometry.location);



*/
