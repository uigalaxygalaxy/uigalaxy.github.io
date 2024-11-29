// api/visitor.js
  export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.uigala.xyz');  // Allow your domain
    res.setHeader('Access-Control-Allow-Origin', 'https://www.uigalaxy.net');  // Allow your domain
    res.setHeader('Access-Control-Allow-Origin', 'https://www.uigalaxy.com');  // Allow your domain

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');  // Allow specific HTTP methods

    if (req.method === 'OPTIONS') {
        res.status(200).end();  // Handle pre-flight OPTIONS request
        return;
    }

    if (req.method === "GET") {
        const apiKey = process.env.API_KEY; // Securely access the key

        if (!apiKey) {
            return res.status(500).json({ error: "API key not configured" });
        }

        const url = `https://count.cab/get/vvkUhWyiT3/${apiKey}`;

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

