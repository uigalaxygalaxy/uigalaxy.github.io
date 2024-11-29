// api/visitor.js
import Redis from 'ioredis';
export default async function handler(req, res) {

  const redis = new Redis(process.env.REDIS_URL);  // Connect to your Redis instance
  
  const RATE_LIMIT = 1; // Max number of requests per IP per hour
  const TIME_FRAME = 60 * 60;  // 1 hour in seconds
  
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get the IP address of the client
  
    // Redis key for the IP's request count and timestamp
    const redisKey = `rate_limit:${ip}`;
  
    // Check the current request count for the IP
    const currentCount = await redis.get(redisKey);
  
    // If the IP has exceeded the rate limit
    if (currentCount && parseInt(currentCount) >= RATE_LIMIT) {
      res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
      return;
    }
  
    // Increment the request count and set expiration time for 1 hour
    await redis.multi()
      .incr(redisKey) // Increment the count
      .expire(redisKey, TIME_FRAME) // Set the expiration time to 1 hour
      .exec();
    const allowedOrigins = [
        'https://www.uigala.xyz',
        'https://www.uigalaxy.net',
        'https://www.uigalaxy.com',
      ];
    
      const origin = req.headers.origin;
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);  // Dynamically set the origin
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
    
      if (req.method === 'OPTIONS') {
        res.status(200).end();  // Handle preflight OPTIONS request
        return;
      }

    if (req.method === "GET") {
        const apiKey = process.env.API_KEY; // Securely access the key

        if (!apiKey) {
            return res.status(500).json({ error: "API key not configured" });
        }

        const url = `https://count.cab/hit/vvkUhWyiT3/${apiKey}`;

        if (ipRequests[ip].count > RATE_LIMIT) {
            res.redirect('https://www.google.com');
            return;
          }

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

