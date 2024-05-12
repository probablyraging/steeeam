import axios from 'axios';
import SteamAPI from 'steamapi';
import { getAverage, minutesToHoursCompact, minutesToHoursPrecise } from '@/utils/utils';

export default async function POST(req, res) {
    if (req.headers.authorization.split(' ')[1] !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const steamId = req.body.data.steamId;
        const countryCode = req.body.data.countryCode;
        const countryAbbr = req.body.data.countryAbbr;

        const userGames = await sapi.getUserOwnedGames(steamId, { includeExtendedAppInfo: true, includeFreeGames: true, includeFreeSubGames: true, includeUnvettedApps: true });

        // Get appIds and played/unplayed game counts
        let gameIds = [];
        let playtime = [];
        let playedCount = 0;
        let unplayedCount = 0;
        let totalPlaytime = 0;
        for (const item of userGames) {
            gameIds.push(item.game.id);
            if (item.minutes > 0) {
                playedCount++;
                playtime.push(item.minutes);
                totalPlaytime += item.minutes;
            }
            if (item.minutes === 0) unplayedCount++;
        }

        // Chunk gameIds into batches of 500
        const maxGameIdsPerCall = 500;
        const gameIdChunks = [];
        for (let i = 0; i < gameIds.length; i += maxGameIdsPerCall) {
            gameIdChunks.push(gameIds.slice(i, i + maxGameIdsPerCall));
        }

        // Make multiple HTTP calls for each chunk
        let responseData = [];
        let prices = [];
        let totalInitial = 0;
        let totalFinal = 0;
        for (const chunk of gameIdChunks) {
            const chunkString = chunk.join(',');
            const gamePrices = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${chunkString}&filters=price_overview&cc=${countryCode}`);

            // Process response data for each chunk
            for (const [gameId, gameData] of Object.entries(gamePrices.data)) {
                if (gameData.data && gameData.data.price_overview) {
                    const finalPrice = gameData.data.price_overview.final || null;
                    const initialPrice = gameData.data.price_overview.initial || null;

                    responseData.push({ [gameId]: gameData.data.price_overview });
                    prices.push(initialPrice);

                    totalInitial += initialPrice;
                    totalFinal += finalPrice;
                }
            }
        }

        // Format totals
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: countryAbbr ? countryAbbr : 'USD' });
        const totalInitialFormatted = formatter.format(totalInitial / 100);
        const totalFinalFormatted = formatter.format(totalFinal / 100);
        const averageGamePrice = formatter.format(getAverage(prices) / 100);
        const totalPlaytimeHours = minutesToHoursCompact(totalPlaytime);
        const averagePlaytime = minutesToHoursPrecise(getAverage(playtime));
        const totalGames = userGames.length;

        responseData.push({ totals: { totalInitialFormatted, totalFinalFormatted, averageGamePrice, totalPlaytimeHours, averagePlaytime, totalGames } });
        responseData.push({ playCount: { playedCount, unplayedCount, totalPlaytime } });

        return res.status(200).json(responseData);
    } catch (e) {
        console.error(e);
        return res.status(200).json({ error: 'Unexpected error' });
    }
}