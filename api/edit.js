import fetch from 'node-fetch';
import { withCors, methodNotAllowed } from './_utils.js';

const BASE_URL = 'https://rentry.org';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST', 'OPTIONS']);
  }

  const { url, edit_code, text } = req.body || {};

  if (!url || !edit_code || !text) {
    return res.status(400).json({ error: 'Missing required fields: url, edit_code, text' });
  }

  try {
    // Get CSRF token
    const csrfResponse = await fetch(`${BASE_URL}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const cookies = csrfResponse.headers.get('set-cookie');
    const csrfMatch = cookies?.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const formData = new URLSearchParams();
    formData.append('csrfmiddlewaretoken', csrfToken);
    formData.append('edit_code', edit_code);
    formData.append('text', text);

    const response = await fetch(`${BASE_URL}/api/edit/${url}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': BASE_URL,
        'Cookie': `csrftoken=${csrfToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    });

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Edit paste error:', error);
    return res.status(500).json({ 
      error: 'Failed to edit paste', 
      message: error.message 
    });
  }
}

export default withCors(handler);
