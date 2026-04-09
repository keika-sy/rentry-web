import fetch from 'node-fetch';
import { withCors, methodNotAllowed } from './_utils.js';

const BASE_URL = 'https://rentry.org';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST', 'OPTIONS']);
  }

  const { text, url, edit_code } = req.body || {};

  // Validation
  if (!text) {
    return res.status(400).json({ error: 'Content is required' });
  }
  if (text.length > 200000) {
    return res.status(400).json({ error: 'Content exceeds 200,000 character limit' });
  }
  if (url && !/^[a-zA-Z0-9_-]+$/.test(url)) {
    return res.status(400).json({ error: 'URL must contain only letters, numbers, underscores, or hyphens' });
  }

  try {
    // Get CSRF token from rentry.org
    const csrfResponse = await fetch(`${BASE_URL}/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const cookies = csrfResponse.headers.get('set-cookie');
    if (!cookies) {
      throw new Error('Failed to get CSRF token from rentry.org');
    }
    
    const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('csrfmiddlewaretoken', csrfToken);
    formData.append('text', text);
    if (url) formData.append('url', url);
    if (edit_code) formData.append('edit_code', edit_code);

    // Create paste
    const response = await fetch(`${BASE_URL}/api/new/`, {
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
    
    // Convert rentry.co to rentry.org
    if (data.url) {
      data.url = data.url.replace('rentry.co', 'rentry.org');
    }
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Create paste error:', error);
    return res.status(500).json({ 
      error: 'Failed to create paste', 
      message: error.message 
    });
  }
}

export default withCors(handler);
