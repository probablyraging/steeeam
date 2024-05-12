import SteamAPI from 'steamapi';
import SteamLevel from 'steam-level';

export default async function POST(req, res) {
    try {
        const steamId = req.body.steamId;

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const userBadges = await sapi.getUserBadges(steamId)
            .catch((e) => {
                console.error('Error getting user badges:', e);
                return res.status(200).json({ error: 'Private games' });
            });

        const requiredXP = SteamLevel.getRequiredXpFromLevel(userBadges?.level || 0);

        const responseData = {
            xpRemaining: userBadges?.xpRemaining || 0,
            requiredXP: requiredXP,
            level: userBadges?.level || 0
        };

        return res.status(200).json(responseData);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unexpected error' });
    }
}