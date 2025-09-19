import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
const recent = await redis.get('recent') || "Offline"
const songName = await redis.get('songName')
const songArtist = await redis.get('songArtist')
const songPlayer = await redis.get('songPlayer')
const timestamp = Number(await redis.get('timestamp'))

console.log(recent, songName, songPlayer, songArtist, timestamp);

res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ recent, songName, songPlayer, songArtist, timestamp }));

}