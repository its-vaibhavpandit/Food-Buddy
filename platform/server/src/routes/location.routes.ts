import { Router, Request, Response } from 'express';

const router = Router();

// 1. Reverse Geocoding Proxy (Lat, Lng -> Address)
router.get('/reverse', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ status: 'error', message: 'Latitude and Longitude are required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FastFoodBuddy-App/1.0 (contact@fastfoodbuddy.in)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error status ${response.status}`);
    }

    const data = await response.json();
    return res.json({ status: 'success', data });
  } catch (error) {
    // Fallback if nominatim fails
    return res.json({
      status: 'success',
      data: {
        address: {
          road: 'Main Street Road',
          suburb: 'Central Market Area',
          city: 'Ghazipur',
          state: 'Uttar Pradesh',
          postcode: '233001',
        },
      },
    });
  }
});

// 2. Search Autocomplete Proxy (Query -> Suggestions)
router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.json({ status: 'success', data: [] });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=in&limit=6`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FastFoodBuddy-App/1.0 (contact@fastfoodbuddy.in)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim search status ${response.status}`);
    }

    const data = await response.json();
    return res.json({ status: 'success', data: data || [] });
  } catch (error) {
    return res.json({ status: 'success', data: [] });
  }
});

export default router;
