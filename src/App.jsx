import { useState, useCallback, useRef } from 'react'
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
} from '@react-google-maps/api'

import { formatRelative } from 'date-fns'
import Search from './Components/Search'
import Locate from './Components/Locate'
import '@reach/combobox/styles.css'
import mapStyles from './mapStyles'
import './App.css'

// set these objects and arrays outside the App to prevent re-renders with
// this maps library

const libraries = ['places']
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
}
const center = { lat: -9.124733767820242, lng: -78.54111474937123 } // default
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
}

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })
  const [selected, setSelected] = useState(null)
  const [petType, setPetType] = useState(null)
  const [markers, setMarkers] = useState([])

  const changePet = (type) => {
    setPetType(type)
  }

  const onMapClick = useCallback(
    (e) => {
      setMarkers((current) => [
        ...current,
        {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          time: new Date(),
          type: petType,
        },
      ])
    },
    [petType]
  )
  const mapRef = useRef()
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng })
    mapRef.current.setZoom(14)
  }, [])

  if (loadError) return 'Error loading map'
  if (!isLoaded) return 'Loading Map'
  return (
    <div>
      <h1>Pets</h1>
      <div className="button-container">
        <button onClick={() => changePet('cat')}>Cat</button>
        <button onClick={() => changePet('dog')}>Dog</button>
      </div>
      {!petType && (
        <div className="if-no-type">Please select a pet type to start</div>
      )}
      <Search panTo={panTo} />
      <Locate panTo={panTo} />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={11}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: marker.type === 'cat' ? '/cat.svg' : '/dog.svg',
              scaledSize: new window.google.maps.Size(40, 40),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(20, 20),
            }}
            onClick={() => setSelected(marker)}
          ></Marker>
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h2>{selected.type} spotted!</h2>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

export default App
