import fetch from 'node-fetch';
import { withCors, methodNotAllowed } from './_utils.js';

const BASE_URL = 'https://rentry.org';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET', 'OPTIONS']);
  }

  const { url } = req.query || {};

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await fetch(`${BASE_URL}/${url}/raw`, {
      method: 'GET',
      headers: {
        'Referer': BASE_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.ok) {
      return res.status(200).json({ 
        exists: true, 
        url: url,
        status: response.status
      });
    } else {
      return res.status(404).json({ 
        exists: false, 
        url: url,
        status: response.status,
        error: 'Paste not found'
      });
    }
    
  } catch (error) {
    console.error('Check exist error:', error);
    return res.status(500).json({ 
      error: 'Failed to check paste', 
      message: error.message 
    });
  }
}

export default withCors(handler);
