import { resolveVanityUrl } from '@/utils/utils';
import axios from 'axios';

export default async function POST(req, res) {
    if (req.method === 'POST') {
        try {
            const sidValue = req.body.data.sid;
            const slsValue = req.body.data.sls;

            const response = await axios.get(`https://steamcommunity.com/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `sessionid=${sidValue}; steamLoginSecure=${slsValue}`
                },
                withCredentials: true
            });

            const html = response.data;
            const regex = /sign out/gi;
            const regexTwo = /<a\s+href="https:\/\/steamcommunity\.com\/id\/[^"]*"\s+data-miniprofile="\d+">([^<]+)<\/a>/i;
            const match = html.match(regex);
            const steamUser = html.match(regexTwo);

            if (match && match[0] && steamUser[1]) {
                return res.status(200).json({ steamUser: steamUser[1] });
            } else {
                return res.status(500).json({ error: 'Not logged in' });
            }
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).end();
    }
}