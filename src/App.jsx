import { useState, useCallback, useRef } from 'react'
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
  MarkerClusterer,
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

// To set custom clusters I would need to style them or use custom icons...
// These are the defaults basically, commented or not I would get the same cluster markers
// const markerOptions = {
//   imagePath: '/markerclusterer/m', // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
// }

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
      <div className="container">
        <h1>Pets</h1>
        <div className="button-container">
          <a onClick={() => changePet('cat')}>
            <img src="/cat.svg" alt="Cat icon" />
          </a>
          <a onClick={() => changePet('dog')}>
            <img src="/dog.svg" alt="Dog icon" />
          </a>
        </div>
        {!petType && (
          <div className="if-no-type">Please select a pet type to start</div>
        )}
        <Search panTo={panTo} />
        <Locate panTo={panTo} />
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={11}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        <MarkerClusterer
          averageCenter
          // options={markerOptions} //Use default cluster markers
          enableRetinaIcons
          gridSize={20}
        >
          {(clusterer) =>
            markers.map((marker) => (
              <Marker
                key={marker.time.toISOString()}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={{
                  url: marker.type === 'cat' ? '/cat.svg' : '/dog.svg',
                  scaledSize: new window.google.maps.Size(30, 30),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15),
                }}
                onClick={() => setSelected(marker)}
                clusterer={clusterer}
              />
            ))
          }
        </MarkerClusterer>
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
