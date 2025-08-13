import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition, setLocationName }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Reverse geocoding to get location name (simplified)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
          const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setLocationName(name);
        })
        .catch(() => {
          setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        });
    },
  });

  return position ? <Marker position={position} /> : null;
};

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [position, setPosition] = useState(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );
  const [locationName, setLocationName] = useState(initialLocation?.name || '');
  const [addressSearch, setAddressSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
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

  const handleLocationChange = (newPosition) => {
    setPosition(newPosition);
  };

  const handleLocationNameChange = (name) => {
    setLocationName(name);
    if (position && onLocationSelect) {
      onLocationSelect({
        lat: position[0],
        lng: position[1],
        name: name
      });
    }
  };

  // Update parent when position changes
  useEffect(() => {
    if (position && locationName && onLocationSelect) {
      onLocationSelect({
        lat: position[0],
        lng: position[1],
        name: locationName
      });
    }
  }, [position, locationName, onLocationSelect]);

  // Address search function
  const searchAddress = async () => {
    if (!addressSearch.trim()) {
      alert('Please enter an address to search');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setPosition([lat, lng]);
        setLocationName(result.display_name);
        
        // Center map on found location
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
      } else {
        alert('Address not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      alert('Error searching address. Please try again.');
    }
    setSearchLoading(false);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAddress();
    }
  };

  return (
    <div className="space-y-4">
      {/* Address Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={addressSearch}
          onChange={(e) => setAddressSearch(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          placeholder="Enter an address (e.g., 123 Main St, New York, NY)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={searchAddress}
          disabled={searchLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {searchLoading ? '...' : 'Search'}
        </button>
      </div>
      
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={position || [40.7128, -74.0060]} // Default to NYC
          zoom={position ? 13 : 2}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenReady={() => {
            // Force map to recalculate size when ready
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
          <LocationMarker 
            position={position} 
            setPosition={handleLocationChange}
            setLocationName={handleLocationNameChange}
          />
        </MapContainer>
      </div>
      
      {position && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Selected Location:</div>
          <div className="font-medium">{locationName}</div>
          <div className="text-sm text-gray-500">
            Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        💡 Click anywhere on the map to select a location
      </div>
    </div>
  );
};

export default LocationPicker;