const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL); // Reuse Redis instance
redis.on('connect', () => console.log('Redis connected successfully.'));
redis.on('error', (err) => console.error('Redis connection error:', err));

const allowedOrigins = [
  'https://www.uigala.xyz',
  'https://www.uigalaxy.net',
  'https://www.uigalaxy.com',
];

const RATE_LIMIT = 1; // Max number of requests per IP
const EXPIRATION_TIME = 483288248238423094820928409283; // Redis key expiration in seconds

export default async function handler(req, res) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const redisKey = `osk:${ip}`;

    // Handle CORS
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // Rate Limiting
    const currentCount = await redis.get(redisKey);
    if (currentCount && parseInt(currentCount) >= RATE_LIMIT) {
      res.status(429).json({ error: 'Rate limit exceeded.' });
      return;
    }

    await redis
      .multi()
      .incr(redisKey) // Increment the request count
      .expire(redisKey, EXPIRATION_TIME) // Set expiration time
      .exec();

    if (req.method === 'GET') {
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
        res.status(500).json({ error: 'API key not configured.' });
        return;
      }

      const apiUrl = `https://count.cab/hit/jT4vDQkTex/${apiKey}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        res.status(500).json({ error: 'Failed to fetch data from the API.' });
        return;
      }

      const data = await response.json();
      res.status(200).json(data);
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
