import { resolveVanityUrl } from '@/utils/utils';
import SteamAPI from 'steamapi';
import SteamID from 'steamid';
import * as sidr from 'steamid-resolver';

function sidToShortURL(sid) {
    const replacements = 'bcdfghjkmnpqrtvw';
    const hex = sid.accountid.toString(16);
    let output = '';
    for (let i = 0; i < hex.length; i++) {
        output += replacements[parseInt(hex[i], 16)];
    }
    const splitAt = Math.floor(output.length / 2);
    output = output.substring(0, splitAt) + '-' + output.substring(splitAt);
    return 'https://s.team/p/' + output;
}

export default async function POST(req, res) {
    try {
        const steamId = await resolveVanityUrl(req.body.data.uid);

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);
        const sid = new SteamID(steamId);

        const userSummaryPromise = sapi.getUserSummary(steamId);
        const sidrSummaryPromise = sidr.steamID64ToFullInfo(steamId);

        const [userSummary, sidrSummary] = await Promise.all([
            userSummaryPromise.catch(e => { console.error('Error getting SAPI summary:', e); return null; }),
            sidrSummaryPromise.catch(e => { console.error('Error getting SIDR summary:', e); return null; }),
        ]);

        const steam2 = sid.getSteam2RenderedID(true);
        const steam3 = sid.getSteam3RenderedID();
        const shorturl = sidToShortURL(sid);

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
            onlineState: sidrSummary.onlineState ? sidrSummary.onlineState[0] : null,
            location: sidrSummary.location ? sidrSummary.location[0] : 'Unknown',
            accountId: sid.accountid,
            steam2: steam2,
            steam3: steam3,
            shortURL: shorturl
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json('Unexpected error');
    }
}