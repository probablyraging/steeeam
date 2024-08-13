import { resolveVanityUrl } from '@/utils/utils';
import axios from 'axios';

export default async function POST(req, res) {
    if (req.method === 'POST') {
        try {
            const steamId = await resolveVanityUrl(req.body.data.uid || req.body.data.steamId);
            const sidValue = req.body.data.sid;
            const slsValue = req.body.data.sls;
            const appId = req.body.data.appId;

            const response = await axios.get(`https://steamcommunity.com/profiles/${steamId}/gamecards/${appId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `sessionid=${sidValue}; steamLoginSecure=${slsValue}`
                },
                withCredentials: true
            });

            const html = response.data;
            const regex = /<span class="progress_info_bold">(\d+) card drops remaining<\/span>/;
            const match = html.match(regex);

            if (match && match[1]) {
                const cardDropsRemaining = parseInt(match[1], 10);
                return res.status(200).json({ remaining: cardDropsRemaining });
            } else {
                return res.status(200).json({ error: 'Card drops data not found' });
            }
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).end();
    }
}