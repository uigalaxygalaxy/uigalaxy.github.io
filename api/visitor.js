// api/visitor.js
  export default async function handler(req, res) {
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

