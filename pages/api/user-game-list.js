import { resolveVanityUrl } from '@/utils/utils';
import SteamAPI from 'steamapi';

export default async function POST(req, res) {
    if (req.headers.authorization.split(' ')[1] !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const steamId = await resolveVanityUrl(req.body.data.uid || req.body.data.steamId);

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const userGames = await sapi.getUserOwnedGames(steamId, { includeExtendedAppInfo: true, includeFreeGames: true, includeFreeSubGames: true, includeUnvettedApps: true });

        return res.status(200).json(userGames);
    } catch (e) {
        console.error(e);
        return res.status(500).json('Unexpected error');
    }
}