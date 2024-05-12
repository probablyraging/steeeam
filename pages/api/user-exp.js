import SteamAPI from 'steamapi';
import SteamLevel from 'steam-level';

export default async function POST(req, res) {
    if (req.headers.authorization.split(' ')[1] !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const steamId = req.body.data.steamId;

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const userBadges = await sapi.getUserBadges(steamId)
            .catch((e) => {
                console.error('Error getting user badges:', e);
                return res.status(200).json({ xpRemaining: 0, requiredXP: 0, level: 0 });
            });

        const requiredXP = SteamLevel.getRequiredXpFromLevel(userBadges.level);

        const responseData = {
            xpRemaining: userBadges.xpRemaining,
            requiredXP: requiredXP,
            level: userBadges.level
        };

        return res.status(200).json(responseData);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unexpected error' });
    }
}