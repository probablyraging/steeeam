import SteamAPI from 'steamapi';

export default async function POST(req, res) {
    if (req.headers.authorization.split(' ')[1] !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const gameId = req.body.data.gameId;
        const countryCode = req.body.data.countryCode;

        const gameDetails = await sapi.getGameDetails(gameId, { currency: countryCode, });

        return res.status(200).json(gameDetails);
    } catch (e) {
        console.error(e);
        return res.status(500).json('Unexpected error');
    }
}