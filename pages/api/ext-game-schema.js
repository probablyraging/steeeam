import SteamAPI from 'steamapi';

export default async function POST(req, res) {
    if (req.method === 'POST') {
        try {
            const appId = req.body.data.appId;;

            const sapi = new SteamAPI(process.env.STEAM_API_KEY);

            const userGames = await sapi.getGameSchema(appId);

            return res.status(200).json(userGames);
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).end();
    }
}