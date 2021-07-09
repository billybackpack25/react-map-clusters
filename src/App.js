import Map from './Components/Map';
import Header from './Components/Header'
import React from 'react';
import Loader from './Components/Loader';
import Search from './Components/Search';
// Main Context
import {useMainContext} from './Context/Context'

function App() {
  const {setEventData, reRenderMarkers} = useMainContext();
  
  // Map is loading
  const [loading, setLoading] = React.useState(false);
  // Event to render
  const [renderEvent, setRenderEvent] = React.useState([]);
  
  React.useEffect(() => {
    const fetchEvents = async () => {
        setLoading(true);
        const res = await fetch("https://eonet.sci.gsfc.nasa.gov/api/v2.1/events")
        // Extract array data
        const {events} = await res.json();
        // Event data is globally accessible but 'renderEvent' is just to render our MAP with the markers
        setEventData(events);
        setRenderEvent(events);
        setLoading(false);
    }
    fetchEvents();
  // eslint-disable-next-line
  }, [])

  React.useEffect(() => {
    if(reRenderMarkers !== null){
      setRenderEvent(reRenderMarkers);
    }
  },[reRenderMarkers])
  
  return (
    <div>
        <Header />
        {loading ? <Loader /> : <Map eventData={renderEvent} />}
        {!loading && <Search />}
    </div>
  );
}

export default App; 
