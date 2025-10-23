export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET and POST requests
  if (req.method === 'GET' || req.method === 'POST') {
    res.status(200).json({
      status: 'ok',
      message: 'API is working',
      method: req.method,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}
