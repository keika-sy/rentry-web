import fetch from 'node-fetch';

const BASE_URL = 'https://rentry.org';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, edit_code, text } = req.body;

    if (!url || !edit_code || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get CSRF token
    const csrfResponse = await fetch(`${BASE_URL}/`);
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
        'Cookie': `csrftoken=${csrfToken}`
      },
      body: formData.toString()
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
