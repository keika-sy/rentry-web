import fetch from 'node-fetch';

const BASE_URL = 'https://rentry.org';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    const response = await fetch(`${BASE_URL}/${url}/raw`, {
      method: 'GET',
      headers: {
        'Referer': BASE_URL
      }
    });

    if (response.ok) {
      res.status(200).json({ 
        exists: true, 
        url: url,
        status: response.status
      });
    } else {
      res.status(404).json({ 
        exists: false, 
        url: url,
        status: response.status
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
