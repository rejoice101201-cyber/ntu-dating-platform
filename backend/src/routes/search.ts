import express from 'express';
import axios from 'axios';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { SearchPlacesRequest, PlaceResult } from '../types';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation schema
const searchPlacesSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  radius: z.number().min(1).max(50000, 'Radius must be between 1 and 50000 meters').optional()
});

// GET /api/search/places - Search for cafes using Google Places API
router.get('/places', async (req, res) => {
  try {
    const { query, lat, lng, radius = 1000 } = searchPlacesSchema.parse({
      query: req.query.query,
      lat: parseFloat(req.query.lat as string),
      lng: parseFloat(req.query.lng as string),
      radius: req.query.radius ? parseInt(req.query.radius as string) : undefined
    });

    if (!process.env.GOOGLE_SERVER_KEY) {
      return res.status(500).json({ 
        message: 'Google Places API key not configured' 
      });
    }

    // Use Google Places Text Search API
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: `${query} cafe coffee`,
        location: `${lat},${lng}`,
        radius: radius,
        type: 'cafe',
        key: process.env.GOOGLE_SERVER_KEY
      }
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', response.data);
      return res.status(500).json({ 
        message: 'Error searching places',
        error: response.data.error_message || 'Unknown error'
      });
    }

    // Transform results to our format
    const places: PlaceResult[] = (response.data.results || []).map((place: any) => ({
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.formatted_address,
      place_id: place.place_id,
      rating: place.rating
    }));

    res.json({
      places,
      total: places.length,
      query,
      location: { lat, lng },
      radius
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Validation error',
        errors: error.issues
      });
    }
    
    if (axios.isAxiosError(error)) {
      console.error('Google Places API request failed:', error.message);
      return res.status(500).json({ 
        message: 'Failed to search places',
        error: error.message
      });
    }
    
    console.error('Search places error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/search/places/nearby - Search for nearby cafes
router.get('/places/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = searchPlacesSchema.parse({
      query: 'cafe',
      lat: parseFloat(req.query.lat as string),
      lng: parseFloat(req.query.lng as string),
      radius: req.query.radius ? parseInt(req.query.radius as string) : undefined
    });

    if (!process.env.GOOGLE_SERVER_KEY) {
      return res.status(500).json({ 
        message: 'Google Places API key not configured' 
      });
    }

    // Use Google Places Nearby Search API
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: radius,
        type: 'cafe',
        key: process.env.GOOGLE_SERVER_KEY
      }
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', response.data);
      return res.status(500).json({ 
        message: 'Error searching nearby places',
        error: response.data.error_message || 'Unknown error'
      });
    }

    // Transform results to our format
    const places: PlaceResult[] = (response.data.results || []).map((place: any) => ({
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.vicinity,
      place_id: place.place_id,
      rating: place.rating
    }));

    res.json({
      places,
      total: places.length,
      location: { lat, lng },
      radius
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Validation error',
        errors: error.issues
      });
    }
    
    if (axios.isAxiosError(error)) {
      console.error('Google Places API request failed:', error.message);
      return res.status(500).json({ 
        message: 'Failed to search nearby places',
        error: error.message
      });
    }
    
    console.error('Search nearby places error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
