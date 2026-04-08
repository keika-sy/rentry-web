import fetch from 'node-fetch';

const BASE_URL = 'https://rentry.org';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get CSRF token first
    const csrfResponse = await fetch(`${BASE_URL}/`);
    const cookies = csrfResponse.headers.get('set-cookie');
    const csrfMatch = cookies?.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    const { text, url, edit_code } = req.body;

    const formData = new URLSearchParams();
    formData.append('csrfmiddlewaretoken', csrfToken);
    formData.append('text', text);
    if (url) formData.append('url', url);
    if (edit_code) formData.append('edit_code', edit_code);

    const response = await fetch(`${BASE_URL}/api/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': BASE_URL,
        'Cookie': `csrftoken=${csrfToken}`
      },
      body: formData.toString()
    });

    const data = await response.json();
    
    // Convert rentry.co to rentry.org in response
    if (data.url) {
      data.url = data.url.replace('rentry.co', 'rentry.org');
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
