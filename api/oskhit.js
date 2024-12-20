import Redis from 'ioredis';

export default async function handler(req, res) {
  const redis = new Redis(process.env.REDIS_URL);
  redis.on('error', (err) => console.error('Redis connection error:', err));

  // Ensure Redis is ready
  if (redis.status !== 'ready') {
    res.status(500).json({ error: 'Redis is unavailable' });
    return;
  }
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get the IP address of the client
  const redisKey = `oskhit:${ip}`;

  try {
    const currentCount = await redis.get(redisKey);
    if (currentCount && parseInt(currentCount) >= 1) {
      res.status(429).json({ error: 'Only one hit allowed' });
      await redis.quit();
      return;
    }

    // Increment count and set expiration
    await redis.multi()
      .incr(redisKey)
      .exec();

    const allowedOrigins = [
      'https://www.uigala.xyz',
      'https://www.uigalaxy.net',
      'https://www.uigalaxy.com',
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      await redis.quit();
      return;
    }

    if (req.method === 'GET') {
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
        res.status(500).json({ error: 'API key not configured' });
        await redis.quit();
        return;
      }

      const url = `https://count.cab/hit/jT4vDQkTex/${apiKey}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        console.error('API Fetch Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch visitor count' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } finally {
    await redis.quit();
  }
}
