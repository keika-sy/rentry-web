import fetch from 'node-fetch';
import { withCors, methodNotAllowed } from './_utils.js';

const BASE_URL = 'https://rentry.org';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST', 'OPTIONS']);
  }

  const { url, edit_code } = req.body || {};

  if (!url || !edit_code) {
    return res.status(400).json({ error: 'Missing required fields: url, edit_code' });
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
    formData.append('delete', 'delete');

    // Delete request
    await fetch(`${BASE_URL}/${url}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': `${BASE_URL}/api/edit`,
        'Cookie': `csrftoken=${csrfToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString(),
      redirect: 'manual'
    });

    // Verify deletion
    const checkResponse = await fetch(`${BASE_URL}/${url}/raw`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (checkResponse.status === 404) {
      return res.status(200).json({ 
        status: 200, 
        content: 'OK',
        message: 'Paste deleted successfully'
      });
    } else {
      return res.status(400).json({ 
        status: 400,
        content: 'Failed',
        error: 'Invalid edit code or paste not found'
      });
    }
    
  } catch (error) {
    console.error('Delete paste error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete paste', 
      message: error.message 
    });
  }
}

export default withCors(handler);
