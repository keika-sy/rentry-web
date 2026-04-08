import fetch from 'node-fetch';

const BASE_URL = 'https://rentry.org';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, edit_code } = req.body;

    if (!url || !edit_code) {
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
    formData.append('delete', 'delete');

    const response = await fetch(`${BASE_URL}/${url}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': `${BASE_URL}/api/edit`,
        'Cookie': `csrftoken=${csrfToken}`
      },
      body: formData.toString(),
      redirect: 'manual'
    });

    // Check if delete was successful by verifying the page is gone
    const checkResponse = await fetch(`${BASE_URL}/${url}/raw`, {
      method: 'GET'
    });

    if (checkResponse.status === 404) {
      res.status(200).json({ 
        status: 200, 
        content: 'OK',
        message: 'Paste deleted successfully'
      });
    } else {
      res.status(400).json({ 
        status: 400,
        content: 'Failed to delete paste',
        error: 'Invalid edit code or paste not found'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
