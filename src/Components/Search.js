import React, { useRef, useState } from 'react';
// Global context
import { useMainContext } from '../Context/Context';

const Search = (props) => {

    const {eventData, setSelectedEvent, setReRenderMarkers} = useMainContext();
    // Matching results
    const [matchEvent, setMatchEvent] = useState(eventData);
    // Handle Drop down
    const [storeSelection, setStoreSelection] = useState("All");

    const searchBox = useRef();
    const optionBox = useRef();

    // Filter event data
    const filterEventData = eventData => {
        //Spread operator so we don't overwrite Ref data
        let filterEventData = [...eventData];
        if(storeSelection !== "All"){
            // storeSelection = Users dropdown option
            filterEventData = filterEventData.filter(event => event.categories[0].title === storeSelection);
        }
        return filterEventData;
    }

    const userSearch = (searchQuery, eventData) => {
        let eventMatch = [];
        let filteredEventData = filterEventData(eventData);

        if(searchQuery.length > 0 && filteredEventData){
            // At the end, eventMatch will hold all events with titles matching the search
            for(const event in filteredEventData){
                let eventTitle = filteredEventData[event].title.toLowerCase();
                // If search query can be found in the event title
                if(eventTitle.indexOf(searchQuery) !== -1){
                    eventMatch.push(filteredEventData[event]);
                }
            }
            // If  they have types in something but it didn't match
            if(eventMatch.length === 0){
                eventMatch = [{title: "No Results!", categories: [{title: ""}]}]
            }
            setMatchEvent(eventMatch);
        }else{
            setMatchEvent(filteredEventData);
        
        }
    }

    // User has changed the filter option dropdown, we need markers to change as well
    React.useEffect(() => {
        // First we want to sort out the markers
        let filteredEventData = filterEventData(eventData);
        setReRenderMarkers(filteredEventData);
        // Now let's sort the search results
        userSearch(searchBox.current.value.toLowerCase(), filteredEventData);
    // eslint-disable-next-line
    },[storeSelection])

    return (
        <>
            <section className="option-container">
            <p>Type: </p>
                <select ref={optionBox} onChange={() => setStoreSelection(optionBox.current.value)}>
                    <option key="All" value="All">All</option>
                    <option key="Wildfires" value="Wildfires">Wildfires</option>
                    <option key="Severe Storms" value="Severe Storms">Severe Storms</option>
                    <option key="Volcanoes" value="Volcanoes">Volcanoes</option>       
                    <option key="Sea and Lake Ice" value="Sea and Lake Ice">Sea and Lake Ice</option>              
                </select>
            </section>
            <section className="search-container">
                <p>Search:</p>
                <input 
                    type="text" 
                    ref={searchBox}
                    onKeyUp={() => {
                        let searchQuery = searchBox.current.value.toLowerCase();
                        // Want to wait for the user to finish typing before sending method
                        setTimeout(() => {
                            if(searchQuery === searchBox.current.value.toLowerCase()){
                                userSearch(searchQuery, eventData);
                            }
                        }, 300)
                    }}
                />
            </section>
            <table className="search-table">
                <thead>
                <tr>
                    <th style={{width: "60%"}}>Title</th>
                    <th>Type</th>
                    <th>Location</th>
                </tr>
                </thead>
                <tbody>
                    {matchEvent.map(ev => {
                        return (
                            <tr key={ev.id}>
                                <td>{ev.title}</td>
                                <td>{ev.categories[0].title}</td>
                                {   // eslint-disable-next-line
                                    ev.categories[0].title ? <td><a 
                                    href='#'
                                    onClick={() => setSelectedEvent(ev)}
                                >Click Here</a></td> : <td></td>}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
};

export default Search;