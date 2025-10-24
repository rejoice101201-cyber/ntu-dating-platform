import express from 'express';
import { z } from 'zod';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { CreateLocationRequest, UpdateLocationRequest } from '../types';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation schemas
const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  address: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional()
});

const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  is_favorite: z.boolean().optional()
});

// GET /api/locations - Get all user's locations
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const locations = await db.all(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.userId]
    );
    
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/locations - Create new location
router.post('/', async (req, res) => {
  try {
    const data = createLocationSchema.parse(req.body);
    const db = getDb();
    
    const result = await db.run(
      `INSERT INTO locations (name, lat, lng, address, rating, notes, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.lat,
        data.lng,
        data.address || null,
        data.rating || null,
        data.notes || null,
        req.user!.userId
      ]
    );
    
    // Fetch the created location
    const location = await db.get(
      'SELECT * FROM locations WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(location);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Validation error',
        errors: error.issues
      });
    }
    
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/locations/:id - Get specific location
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const location = await db.get(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user!.userId]
    );
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/locations/:id - Update location
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateLocationSchema.parse(req.body);
    const db = getDb();
    
    // Check if location exists and belongs to user
    const existingLocation = await db.get(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user!.userId]
    );
    
    if (!existingLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      values.push(data.name);
    }
    if (data.lat !== undefined) {
      updateFields.push('lat = ?');
      values.push(data.lat);
    }
    if (data.lng !== undefined) {
      updateFields.push('lng = ?');
      values.push(data.lng);
    }
    if (data.address !== undefined) {
      updateFields.push('address = ?');
      values.push(data.address);
    }
    if (data.rating !== undefined) {
      updateFields.push('rating = ?');
      values.push(data.rating);
    }
    if (data.notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.is_favorite !== undefined) {
      updateFields.push('is_favorite = ?');
      values.push(data.is_favorite);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    values.push(id, req.user!.userId);
    
    await db.run(
      `UPDATE locations SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    // Fetch updated location
    const updatedLocation = await db.get(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user!.userId]
    );
    
    res.json(updatedLocation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: 'Validation error',
        errors: error.issues
      });
    }
    
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/locations/:id - Delete location
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    // Check if location exists and belongs to user
    const location = await db.get(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user!.userId]
    );
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    await db.run('DELETE FROM locations WHERE id = ? AND user_id = ?', [id, req.user!.userId]);
    
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/locations/:id/favorite - Toggle favorite status
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    // Check if location exists and belongs to user
    const location = await db.get(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user!.userId]
    );
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Toggle favorite status
    const newFavoriteStatus = !location.is_favorite;
    
    await db.run(
      'UPDATE locations SET is_favorite = ? WHERE id = ? AND user_id = ?',
      [newFavoriteStatus, id, req.user!.userId]
    );
    
    // Fetch updated location
    const updatedLocation = await db.get(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user!.userId]
    );
    
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
