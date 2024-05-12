import axios from 'axios';

export default async function handler(req, res) {
    const apiKey = process.env.INTERNAL_API_KEY;
    const route = req.body.route;

    if (!route) {
        return res.status(400).send('Missing "route" parameter');
    }

    if (req.method === 'POST') {
        if (req.headers.origin && route) {
            try {
                const proxyToRoute = req.headers.origin + '/api/' + route;
                const proxyResponse = await axios.post(proxyToRoute,
                    {
                        data: req.body
                    },
                    {
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });
                res.status(200).json(proxyResponse.data);
            } catch (e) {
                if (e.response) {
                    return res.status(500).json({ error: e.response.data });
                } else {
                    return res.status(500).json({ error: 'Unexpected error' });
                }
            }
        } else {
            console.error(e);
            return res.status(500).json('Unexpected error');
        }
    }
}