import { resolveVanityUrl } from '@/utils/utils';
import SteamAPI from 'steamapi';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const steamId = await resolveVanityUrl(req.body.data.uid);

            const sapi = new SteamAPI(process.env.STEAM_API_KEY);

            const userSummary = await sapi.getUserSummary(steamId);

            return res.status(200).json({
                steamId: steamId,
                personaName: userSummary.nickname,
                visible: userSummary.visible,
                avatar: userSummary.avatar.large,
                customURL: userSummary.url,
                lastLogOff: userSummary.lastLogOffTimestamp,
                createdAt: userSummary.createdTimestamp,
                countryCode: userSummary.countryCode,
                stateCode: userSummary.stateCode,
            });
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(200).end();
    }
}
