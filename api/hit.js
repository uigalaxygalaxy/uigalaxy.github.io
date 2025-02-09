import Redis from 'ioredis';

export default async function handler(req, res) {
  // Handle CORS inside the function
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

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure API key is available
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  // Only handle GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Initialize Redis connection
    const redis = new Redis(process.env.REDIS_URL);

    // Retrieve visitor count from Redis
    const visitorCount = await redis.get("visitorCount");

    // Ensure visitorCount is a number (default to 0 if not set)
    const count = visitorCount ? parseInt(visitorCount, 10) : 0;

    res.status(200).json({ visitorCount: count });
  } catch (error) {
    console.error("Redis Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
