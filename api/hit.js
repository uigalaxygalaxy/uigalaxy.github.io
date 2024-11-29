import Redis from 'ioredis';

export default async function handler(req, res) {

  // Initialize Redis connection
  const redis = new Redis(process.env.REDIS_URL);  // Connect to your Redis instance
  redis.on('connect', () => console.log('Redis connected successfully.'));
  redis.on('error', (err) => console.log('Redis connection error:', err));

  const RATE_LIMIT = 1; // Max number of requests per IP per hour
  const TIME_FRAME = 60 * 60;  // 1 hour in seconds
  
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get the IP address of the client
  
  const redisKey = `rate_limit:${ip}`;  // Redis key for the IP's request count

  console.log(`Request received from IP: ${ip}`);

  // Check the current request count for the IP in Redis
  const currentCount = await redis.get(redisKey);
  console.log(`Current count for ${ip}: ${currentCount}`);

  // If the IP has exceeded the rate limit
  if (currentCount && parseInt(currentCount) >= RATE_LIMIT) {
    console.log(`Rate limit exceeded for ${ip}`);
    res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    return;
  }

  // Increment the request count and set expiration time for 1 hour
  await redis.multi()
    .incr(redisKey)  // Increment the request count
    .expire(redisKey, TIME_FRAME)  // Set expiration time to 1 hour
    .exec();

  console.log(`Incremented count for ${ip}, new count: ${currentCount + 1}`);

  // Handle CORS
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
    res.status(200).end();  // Handle preflight OPTIONS request
    return;
  }

  if (req.method === "GET") {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const url = `https://count.cab/hit/vvkUhWyiT3/${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data from the API");
      }

      const data = await response.json();
      res.status(200).json(data); // Return the API response to the frontend
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visitor count" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" }); // Handle non-GET requests
  }
}
