import React, { useState } from 'react';
import { useCafes } from '../context/CafeContext';
import { MapComponent } from '../components/MapComponent';
import { Navigation } from '../components/Navigation';
import { Cafe } from '../types/Cafe';

export const Map: React.FC = () => {
  const { cafes, addCafe } = useCafes();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newCafe, setNewCafe] = useState({
    name: '',
    address: '',
    rating: 5,
    notes: '',
  });

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowAddForm(true);
  };

  const handleCafeClick = (cafe: Cafe) => {
    console.log('Clicked cafe:', cafe);
    // You could show a detailed view or edit form here
  };

  const handleAddCafe = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation && newCafe.name && newCafe.address) {
      addCafe({
        ...newCafe,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        isFavorite: false,
      });
      
      // Reset form
      setNewCafe({
        name: '',
        address: '',
        rating: 5,
        notes: '',
      });
      setShowAddForm(false);
      setSelectedLocation(null);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setSelectedLocation(null);
    setNewCafe({
      name: '',
      address: '',
      rating: 5,
      notes: '',
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapComponent
            cafes={cafes}
            onCafeClick={handleCafeClick}
            onMapClick={handleMapClick}
            center={{ lat: 25.0330, lng: 121.5654 }}
            zoom={12}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Map Controls</h3>
            <p className="text-sm text-gray-600 mb-2">
              Click on the map to add a new cafe
            </p>
            <p className="text-sm text-gray-600">
              Click on markers to view cafe details
            </p>
          </div>

          {/* Cafe Count */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Cafes Found</h3>
            <p className="text-2xl font-bold text-blue-500">{cafes.length}</p>
            <p className="text-sm text-gray-600">
              {cafes.filter(c => c.isFavorite).length} favorites
            </p>
          </div>
        </div>

        {/* Add Cafe Form */}
        {showAddForm && (
          <div className="w-96 bg-white shadow-lg border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-700">Add New Cafe</h2>
              <button
                onClick={handleCancelAdd}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedLocation && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Selected Location:</strong>
                </p>
                <p className="text-sm text-blue-600">
                  Lat: {selectedLocation.lat.toFixed(6)}
                </p>
                <p className="text-sm text-blue-600">
                  Lng: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}

            <form onSubmit={handleAddCafe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cafe Name *
                </label>
                <input
                  type="text"
                  value={newCafe.name}
                  onChange={(e) => setNewCafe({ ...newCafe, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter cafe name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={newCafe.address}
                  onChange={(e) => setNewCafe({ ...newCafe, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter cafe address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={newCafe.rating}
                  onChange={(e) => setNewCafe({ ...newCafe, rating: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} Star{num !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newCafe.notes}
                  onChange={(e) => setNewCafe({ ...newCafe, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-20 resize-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add your notes about this cafe..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Cafe
                </button>
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
