import SteamAPI from 'steamapi';

export default async function POST(req, res) {
    if (req.headers.authorization.split(' ')[1] !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const steamId = req.body.data.steamId;

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const userFriendsPromise = sapi.getUserFriends(steamId);
        const userGroupsPromise = sapi.getUserGroups(steamId);

        const [userFriends, userGroups] = await Promise.all([
            userFriendsPromise.catch(e => { console.error('Error getting user friends:', e); return null; }),
            userGroupsPromise.catch(e => { console.error('Error getting user groups:', e); return null; }),
        ]);

        return res.status(200).json({
            friendCount: userFriends?.length || 0,
            groupCount: userGroups?.length || 0
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json('Unexpected error');
    }
}