import SteamAPI from 'steamapi';

export default async function POST(req, res) {
    if (req.headers.authorization.split(' ')[1] !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const steamId = req.body.data.steamId;

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const userBans = await sapi.getUserBans(steamId);

        return res.status(200).json(userBans);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unexpected error' });
    }
}