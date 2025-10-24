import React, { useState } from 'react';
import type { Cafe } from '../types/Cafe';
import { useCafes } from '../context/CafeContext';

interface CafeCardProps {
  cafe: Cafe;
  onEdit?: (cafe: Cafe) => void;
}

export const CafeCard: React.FC<CafeCardProps> = ({ cafe }) => {
  const { updateCafe, deleteCafe, toggleFavorite } = useCafes();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: cafe.name,
    address: cafe.address,
    rating: cafe.rating,
    notes: cafe.notes,
  });

  const handleSave = () => {
    updateCafe(cafe.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: cafe.name,
      address: cafe.address,
      rating: cafe.rating,
      notes: cafe.notes,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this cafe?')) {
      deleteCafe(cafe.id);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full text-xl font-bold text-gray-700 border border-gray-300 rounded px-3 py-1 mb-2"
            />
          ) : (
            <h3 className="text-xl font-bold text-gray-700 mb-2">{cafe.name}</h3>
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full text-gray-600 border border-gray-300 rounded px-3 py-1 mb-2"
            />
          ) : (
            <p className="text-gray-600 mb-2">{cafe.address}</p>
          )}
          
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-500 mr-2">Rating:</span>
            {isEditing ? (
              <select
                value={editForm.rating}
                onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                className="border border-gray-300 rounded px-2 py-1"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center">
                {renderStars(cafe.rating)}
                <span className="ml-2 text-sm text-gray-600">({cafe.rating}/5)</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => toggleFavorite(cafe.id)}
          className={`ml-4 text-2xl transition-colors ${
            cafe.isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
          }`}
        >
          {cafe.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
        {isEditing ? (
          <textarea
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 h-20 resize-none"
            placeholder="Add your notes about this cafe..."
          />
        ) : (
          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
            {cafe.notes || 'No notes added yet.'}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};
