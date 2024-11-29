// api/visitor.js
export default async function handler(req, res) {
    let ipRequests = {};  // In-memory store for IP rate-limiting

const RATE_LIMIT = 1; // Max number of requests per IP per hour
const TIME_FRAME = 60 * 60 * 1000; // 1 hour in milliseconds
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  // Get the IP address of the client

  // If the IP doesn't exist in the store, initialize it
  if (!ipRequests[ip]) {
    ipRequests[ip] = {
      count: 1, // Start with the first request
      timestamp: Date.now(), // Current time
    };
  } else {
    // Check if 1 hour has passed since the last request
    const timeElapsed = Date.now() - ipRequests[ip].timestamp;

    if (timeElapsed > TIME_FRAME) {
      // Reset the request count and timestamp after 1 hour
      ipRequests[ip] = {
        count: 1, // First request in the new hour
        timestamp: Date.now(),
      };
    } else {
      // If requests within the same hour, increment count
      ipRequests[ip].count += 1;
    }
  }

  // Check if the rate limit has been exceeded
  if (ipRequests[ip].count > RATE_LIMIT) {
    res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    return;
  }

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

