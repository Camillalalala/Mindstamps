import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const guessIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const actualIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const GuessMarker = ({ onGuess, disabled }) => {
  useMapEvents({
    click(e) {
      if (!disabled) {
        const { lat, lng } = e.latlng;
        onGuess({ lat, lng });
      }
    },
  });
  return null;
};

const GuessMap = ({ 
  onGuess, 
  guessPosition = null, 
  actualPosition = null, 
  showResult = false,
  disabled = false 
}) => {
  const mapRef = useRef();

  // Fix map rendering issues
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fit map to show both markers when result is shown
  useEffect(() => {
    if (showResult && guessPosition && actualPosition && mapRef.current) {
      const bounds = L.latLngBounds([
        [guessPosition.lat, guessPosition.lng],
        [actualPosition.lat, actualPosition.lng]
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [showResult, guessPosition, actualPosition]);

  return (
    <div className="space-y-4">
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[20, 0]} // Center on world view
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenReady={() => {
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.invalidateSize();
              }
            }, 100);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={20}
            subdomains="abcd"
          />
          
          <GuessMarker onGuess={onGuess} disabled={disabled} />
          
          {/* Show guess marker */}
          {guessPosition && (
            <Marker 
              position={[guessPosition.lat, guessPosition.lng]} 
              icon={guessIcon}
            />
          )}
          
          {/* Show actual location when revealing result */}
          {showResult && actualPosition && (
            <Marker 
              position={[actualPosition.lat, actualPosition.lng]} 
              icon={actualIcon}
            />
          )}
          
          {/* Draw line between guess and actual location */}
          {showResult && guessPosition && actualPosition && (
            <Polyline
              positions={[
                [guessPosition.lat, guessPosition.lng],
                [actualPosition.lat, actualPosition.lng]
              ]}
              color="red"
              weight={3}
              opacity={0.7}
              dashArray="5, 10"
            />
          )}
        </MapContainer>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        {!disabled && !guessPosition && (
          <div>💡 Click anywhere on the map to make your guess</div>
        )}
        {guessPosition && !showResult && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-800">Your Guess:</div>
            <div className="text-blue-600">
              {guessPosition.lat.toFixed(4)}, {guessPosition.lng.toFixed(4)}
            </div>
          </div>
        )}
        {showResult && (
          <div className="space-y-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-800">🔵 Your Guess:</div>
              <div className="text-blue-600">
                {guessPosition.lat.toFixed(4)}, {guessPosition.lng.toFixed(4)}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-medium text-red-800">🔴 Actual Location:</div>
              <div className="text-red-600">
                {actualPosition.lat.toFixed(4)}, {actualPosition.lng.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessMap;