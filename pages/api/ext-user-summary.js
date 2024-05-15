import { resolveVanityUrl } from '@/utils/utils';
import SteamAPI from 'steamapi';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const steamId = await resolveVanityUrl(req.body.data.uid);

            const sapi = new SteamAPI(process.env.STEAM_API_KEY);

            const userSummary = await sapi.getUserSummary(steamId);

            res.status(200).json({ data: userSummary });
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).end();
    }
}
