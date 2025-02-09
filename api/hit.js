import Redis from 'ioredis';


export default async function handler(req, res) {

  // Initialize Redis connection
  const redis = new Redis(process.env.REDIS_URL);  // Connect to your Redis instance
  redis.on('connect', () => console.log('Redis connected successfully.'));
  redis.on('error', (err) => console.log('Redis connection error:', err));

  const RATE_LIMIT = 1; // Max number of requests per IP per hour
  const TIME_FRAME = 60 * 60;  // 1 hour in seconds
  const MAX_LIMIT = 25;
  
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get the IP address of the client
  
  const redisKey = `rate_limit:${ip}`;  // Redis key for the IP's request count
  const redisTally = `total:${ip}`; //Keep tally of all IP's total connection count
  


  // Check the current request count for the IP in Redis
  const [currentCount, TotalTally] = await Promise.all([
    redis.get(redisKey),
    redis.get(redisTally),
  ]);
  // If the IP has exceeded the rate limit
  if (currentCount && parseInt(currentCount) >= RATE_LIMIT) {
    res.status(429).json({ error: 'Rate limit exceeded.' });
    return;
  }

  if (redisTally && parseInt(TotalTally) >= MAX_LIMIT) {
    res.status(429).json({ error: 'Your IP has sent too many requests.'})
    return;
  }

  // Increment the request count and set expiration time for 1 hour
  await redis.multi()
    .incr(redisKey)  // Increment the request count
    .incr(visitorCount)
    .incr(redisTally) // Tallies IP connection
    .expire(redisKey, TIME_FRAME)  // Set expiration time to 1 hour
    .exec();


}
