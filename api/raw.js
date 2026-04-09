import fetch from 'node-fetch';
import { withCors, methodNotAllowed } from './_utils.js';

const BASE_URL = 'https://rentry.org';

async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return methodNotAllowed(res, ['GET', 'POST', 'OPTIONS']);
  }

  const url = req.query?.url || req.body?.url;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await fetch(`${BASE_URL}/api/raw/${url}/`, {
      method: 'GET',
      headers: {
        'Referer': BASE_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Fetch raw error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch raw content', 
      message: error.message 
    });
  }
}

export default withCors(handler);
