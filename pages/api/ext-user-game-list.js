import { resolveVanityUrl } from '@/utils/utils';
import SteamAPI from 'steamapi';

export default async function POST(req, res) {
    if (req.method === 'POST') {
        try {
            const steamId = await resolveVanityUrl(req.body.data.uid || req.body.data.steamId);

            const sapi = new SteamAPI(process.env.STEAM_API_KEY);

            const userGames = await sapi.getUserOwnedGames(steamId, { includeExtendedAppInfo: true, includeFreeGames: true, includeFreeSubGames: true, includeUnvettedApps: true });

            return res.status(200).json(userGames);
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).end();
    }
}