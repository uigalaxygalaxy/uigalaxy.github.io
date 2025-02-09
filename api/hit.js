import Redis from 'ioredis';

// Initialize Redis connection globally (reused for all requests)
const redis = new Redis(process.env.REDIS_URL);
redis.on('connect', () => console.log('Redis connected successfully.'));
redis.on('error', (err) => console.error('Redis connection error:', err));

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const RATE_LIMIT = 1; // Max number of requests per IP per hour
  const TIME_FRAME = 60 * 60;  // 1 hour in seconds
  const MAX_LIMIT = 25;

  // Get the IP address of the client
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const redisKey = `rate_limit:${ip}`;  // Redis key for rate limit
  const redisTally = `total:${ip}`; // Redis key for total IP requests
  const visitorKey = "visitorCount"; // Global visitor count

  try {
    // Check the current request count for the IP
    const [currentCount, totalTally] = await Promise.all([
      redis.get(redisKey),
      redis.get(redisTally),
    ]);

    // Rate limit exceeded
    if (currentCount && parseInt(currentCount) >= RATE_LIMIT) {
      return res.status(429).json({ error: 'Rate limit exceeded.' });
    }

    // Total request limit exceeded
    if (redisTally && parseInt(totalTally) >= MAX_LIMIT) {
      return res.status(429).json({ error: 'Your IP has sent too many requests.' });
    }

    // Increment counters atomically
    await redis.multi()
      .incr(redisKey)  // Increment the rate limit counter
      .incr(visitorKey) // Increment visitor count
      .incr(redisTally) // Increment IP tally
      .expire(redisKey, TIME_FRAME)  // Set expiration for rate limit
      .exec();

    // Success response
    res.status(200).json({ message: "Request recorded successfully." });

  } catch (error) {
    console.error("Redis Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
