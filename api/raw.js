import fetch from 'node-fetch';

const BASE_URL = 'https://rentry.org';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query || req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    const response = await fetch(`${BASE_URL}/api/raw/${url}/`, {
      method: 'GET',
      headers: {
        'Referer': BASE_URL
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
