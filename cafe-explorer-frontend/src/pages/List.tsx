import React, { useState } from 'react';
import { useCafes } from '../context/CafeContext';
import { CafeCard } from '../components/CafeCard';
import { Navigation } from '../components/Navigation';
import type { Cafe } from '../types/Cafe';

export const List: React.FC = () => {
  const { cafes } = useCafes();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'date'>('name');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCafes = cafes.filter(cafe => {
    const matchesFilter = filter === 'all' || cafe.isFavorite;
    const matchesSearch = cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cafe.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cafe.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedCafes = [...filteredCafes].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'date':
        return parseInt(b.id) - parseInt(a.id); // Assuming higher ID = more recent
      default:
        return 0;
    }
  });

  const favoriteCount = cafes.filter(cafe => cafe.isFavorite).length;
  const averageRating = cafes.length > 0 
    ? (cafes.reduce((sum, cafe) => sum + cafe.rating, 0) / cafes.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">☕</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cafes</p>
                <p className="text-2xl font-bold text-gray-900">{cafes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❤️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{favoriteCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search cafes by name, address, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({cafes.length})
              </button>
              <button
                onClick={() => setFilter('favorites')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'favorites'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Favorites ({favoriteCount})
              </button>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'date')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="date">Sort by Date Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {sortedCafes.length} of {cafes.length} cafes
            {searchTerm && ` matching "${searchTerm}"`}
            {filter === 'favorites' && ' (favorites only)'}
          </p>
        </div>

        {/* Cafe List */}
        {sortedCafes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cafes found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No cafes match your search for "${searchTerm}"`
                : filter === 'favorites'
                ? "You haven't marked any cafes as favorites yet"
                : "No cafes have been added yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedCafes.map(cafe => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
