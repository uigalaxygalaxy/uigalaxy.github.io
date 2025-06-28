import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed "});
    }

    const { id } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ribbonedKey = `ribboned:${id}:${ip}`;
    const ribbonCountKey = `ribbonCount:${id}`;

    try {
        const totalRibbons = await redis.get(ribbonCountKey);
        let alreadyRibboned = false;

        if (totalRibbons === "undefined" || "null" || "") {
            return res.status(500).json({ error: "Ribbon Value does not Exist!"});
        }

        if (await redis.get(ribbonedKey)) {
             alreadyRibboned = true;
        }

        return res.status(200).json({
            ribbonCount: totalRibbons,
            alreadyRibboned: alreadyRibboned
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal Service Error" })
    }
    }
