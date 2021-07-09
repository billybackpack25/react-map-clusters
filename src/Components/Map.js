import React, {useState, useRef, useEffect} from 'react';
import GoogleMapReact from 'google-map-react';
import useSuperCluster from 'use-supercluster';
import LocationMarker from './LocationMarker';
import LocationInfoBox from './LocationInfoBox';
// Global Context
import {useMainContext} from '../Context/Context';

function Map({center, eventData}) {
    const {selectedEvent} = useMainContext();

    const mapRef = useRef();
    const [zoom, setZoom] = useState(1);
    const [bounds, setBounds] = useState(null);
    // Info box
    const [locationInfo, setLocationInfo] = useState(null);

    // Index for reference
    const eventDataIndex = {
        8: "Wildfires",
        10: "Severe Storms",
        12: "Volcanos",
        15: "Sea and Lake Ice"
    }

    // Create an Array of it's keys
    let eventDataIndexNum = Object.keys(eventDataIndex); // Just get the dict keys as string
    eventDataIndexNum = eventDataIndexNum.map(index => Number(index)); // Make them all integers

    
    // Set up geo-features - Expects a return and throws syntax error
    const points = eventData.map(event => ({
        "type": "Feature",
        "properties": {
            "cluster": false,
            "eventKey": event.id,
            "eventTitle": event.title,
            "eventType": event.categories[0].id
        },
        "geometry": {"type":"Point","coordinates": [event.geometries[0].coordinates[0],event.geometries[0].coordinates[1]]}
    }));

    // Super Clusters
    const {clusters, supercluster} = useSuperCluster({
        points,
        bounds,
        zoom,
        options: {radius: 75, maxZoom: 20}
    });

    console.log(clusters);


    useEffect(() => {
        if(selectedEvent !== null){
            const [longitude, latitude] = selectedEvent.geometries[0].coordinates;
            mapRef.current.panTo({lat: latitude, lng: longitude});
            mapRef.current.setZoom(12);
        }
    }, [selectedEvent])



    return (
        <div className="map-container">
            <GoogleMapReact
                bootstrapURLKeys={{key: process.env.REACT_APP_GOOGLE_KEY}}
                center={center}
                zoom={zoom}
                yesIWantToUseGoogleMapApiInternals // Exposes JavaScript Object + Additional features
                onGoogleApiLoaded={({map}) => {    // Called when the map loads. Getting map field of the object
                    mapRef.current = map;          // Assigning Reb above to the map. Gives us access to the Javascript google map object
                }}
                onChange={({zoom, bounds}) => {
                    setZoom(zoom);
                    setBounds([
                        bounds.nw.lng,
                        bounds.se.lat,
                        bounds.se.lng,
                        bounds.nw.lat
                    ]);
                }}
                onClick={() => {setLocationInfo(null)}} // Location Info Pop up box to hide when map is clicked
                onDrag={() => {setLocationInfo(null)}} // Location Info Pop up box to hide when map is dragged
                >
                {// eslint-disable-next-line
                    clusters.map(cluster => {
                    // Get location from the cluster
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    // Use object destructuring to see if it's a cluster and where they would be placed
                    const {cluster: isCluster, point_count: pointCount} = cluster.properties;
                    // Use Icon type
                    const clusterId= cluster.properties.eventType;
                    // If it's a cluster and not a marker
                    if(isCluster){
                        // Increase size of marker based on how many there are within the bounds
                        let changeSize = Math.round(pointCount / points.length * 50);
                        // Cant exceed 40 px
                        let addSize = Math.min(changeSize * 15, 40);
                        return (
                            <section lat={latitude} lng={longitude} key={cluster.id}>
                                <div 
                                    className="cluster-marker" 
                                    style={{
                                        width: addSize + changeSize + 'px',
                                        height: addSize + changeSize + 'px'
                                    }}
                                    onClick={() => {
                                        const expansionZoom = Math.min(
                                            supercluster.getClusterExpansionZoom(cluster.id),
                                            20
                                        );
                                        // mapRef is the javaScript object of the map on the page
                                        // Setting zoom opn click to the point of the marker
                                        mapRef.current.setZoom(expansionZoom);
                                        mapRef.current.panTo({lat: latitude, lng: longitude})
                                    }}
                                >
                                    {pointCount}
                                </div>
                            </section>
                        )
                    }
                    // Not a cluster, just a single marker
                    // eventDataIndexNum.indexOf(clusterId) !== -1
                    //      If clusterId can be found in eventDataIndexNum
                    // AND
                    // cluster.geometry.coordinates.length === 2
                    //      cluster geometry has a long and lat
                    // These conditions are so that we don't render a marker with missing data
                    if(eventDataIndexNum.indexOf(clusterId) !== -1 && cluster.geometry.coordinates.length === 2){
                        return (
                            <LocationMarker 
                                lat={latitude} 
                                lng={longitude}
                                id={clusterId}
                                key={cluster.properties.eventKey}
                                // Show location box when marker is clicked
                                onClick={() => {
                                    setLocationInfo({
                                        id: cluster.properties.eventKey, 
                                        title: cluster.properties.eventTitle
                                        }
                                    )
                                }}
                            />

                        )
                    }
                })}
            </GoogleMapReact>
            { locationInfo && <LocationInfoBox info={locationInfo} /> }
        </div>
    )
}

Map.defaultProps = {
    center: {lat: 29, lng:-3}, 
    
}

export default Map;