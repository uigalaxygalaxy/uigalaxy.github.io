import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    const { id } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ribbonedKey = `ribboned:${id}:${ip}`;
    const ribbonCountKey = `ribbonCount:${id}`;

    try {
        const alreadyRibboned = await redis.get(ribbonedKey);

        let newCount;
        if (alreadyRibboned) {
            // Unribbon: remove the ribbon and decrement the count
            await redis.del(ribbonedKey);
            newCount = await redis.decr(ribbonCountKey);
            return res.status(200).json({ message: "Unribboned!", ribbonCount: newCount, alreadyRibboned: false });
        } else {
            // Ribbon: set the ribbon and increment the count
            await redis.set(ribbonedKey, 1);
            newCount = await redis.incr(ribbonCountKey);
            return res.status(200).json({ message: "Ribboned!", ribbonCount: newCount, alreadyRibboned: true });
        }
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}