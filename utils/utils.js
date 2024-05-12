import moment from "moment";
import axios from "axios";

export function getRelativeTimePrecise(timestamp) {
    const now = moment();
    const then = moment.unix(timestamp);
    const deltaYears = now.diff(then, 'years', true);

    if (/\.0$/.test(deltaYears.toFixed(1))) {
        if (deltaYears > 1) {
            return `<span style="color: #f5a524">${deltaYears.toFixed()}</span> years`;
        } else if (deltaYears > 0) {
            return `<span style="color: #f5a524">${deltaYears.toFixed()}</span> year`;
        } else {
            return moment(then).fromNow();
        }
    } else {
        if (deltaYears > 1) {
            return `<span style="color: #f5a524">${deltaYears.toFixed(1)}</span> years`;
        } else if (deltaYears > 0) {
            return `<span style="color: #f5a524">${deltaYears.toFixed(1)}</span> year`;
        } else {
            return moment(then).fromNow();
        }
    }
}

export function getRelativeTimeImprecise(timestamp) {
    const now = moment();
    const then = moment.unix(timestamp);
    const deltaYears = now.diff(then, 'years', true);

    if (deltaYears > 1) {
        return `${deltaYears.toFixed(0)} years`;
    } else if (deltaYears > 0) {
        return `${deltaYears.toFixed(0)} year`;
    } else {
        return moment(then).fromNow();
    }
}

export function findAppInData(data, targetAppId) {
    const targetItem = data.find(item => item.appId === targetAppId.toString());
    if (targetItem) {
        const initialPrice = targetItem.initialPrice / 100;
        const formatter = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const initialPriceFormatted = formatter.format(initialPrice);
        return initialPriceFormatted;
    } else {
        return '0.00'
    }
}

export function getAverage(numbers) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
    return numbers.length === 0 ? 0 : sum / numbers.length;
}

export function kFormatter(num) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}

export function minutesToHoursCompact(number) {
    const durationInMinutes = number;
    const duration = moment.duration(durationInMinutes, "minutes");
    const hours = Math.floor(duration.asHours());
    return hours.toLocaleString();
}

export function minutesToHoursPrecise(number) {
    const durationInMinutes = number;
    const duration = moment.duration(durationInMinutes, "minutes");
    const hours = duration.asHours();
    return hours.toFixed(1);
}

export function getMaxByProperty(data, property) {
    return data.reduce((acc, curr) => (curr[property] > acc[property] ? curr : acc), data[0]);
}

export function getMinByProperty(data, property) {
    return data.reduce((acc, curr) => (curr[property] < acc[property] ? curr : acc), data[0]);
}

export function pricePerHour(totalCost, totalPlaytime, countryAbbr) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: countryAbbr ? countryAbbr : 'USD' });
    if (!totalPlaytime || totalPlaytime === '0') return formatter.format(0);
    const totalCostFloat = parseInt(totalCost.replace(/[^\d.-]/g, ''), 10) * 100;
    const totalCostFormatted = (totalCostFloat / 100).toFixed();
    const totalPlaytimeFormatted = totalPlaytime.replace(',', '');
    const pricePerHour = parseInt(totalCostFormatted) / parseInt(totalPlaytimeFormatted);
    const formattedPrice = formatter.format(pricePerHour);
    return formattedPrice;
}

export function formatSteamProfileUrl(url) {
    const output = url.replace('https://steamcommunity.com/id/', '').replace('https://steamcommunity.com/profiles/', '');
    return output;
}

export async function resolveVanityUrl(uid) {
    const steamIdCheck = await axios.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${uid}`);
    if (steamIdCheck.data.response.steamid) {
        return steamIdCheck.data.response.steamid;
    } else {
        return uid;
    }
}

// export async function getUserData(uid) {
//     try {
//         const steamId = await resolveVanityUrl(uid);

//         const sapi = new SteamAPI(process.env.STEAM_API_KEY);

//         const userSummary = await sapi.getUserSummary(steamId);
//         const sidrSummary = await sidr.steamID64ToFullInfo(steamId);

//         return {
//             steamId: steamId,
//             personaName: userSummary.nickname,
//             visible: userSummary.visible,
//             avatar: userSummary.avatar.large,
//             lastLogOff: userSummary.lastLogOffTimestamp,
//             createdAt: getRelativeTimeImprecise(userSummary.createdTimestamp),
//             countryCode: userSummary.countryCode,
//             stateCode: userSummary.stateCode,
//             onlineState: sidrSummary.onlineState ? sidrSummary.onlineState[0] : null,
//             location: sidrSummary.location ? sidrSummary.location[0] : 'Unknown',
//         };
//     } catch (e) {
//         console.error(e);
//         return { message: 'Error' };
//     }
// }

// export async function getGameData(uid) {
//     try {
//         const steamId = await resolveVanityUrl(uid);

//         const sapi = new SteamAPI(process.env.STEAM_API_KEY);

//         const userGames = await sapi.getUserOwnedGames(steamId, { includeExtendedAppInfo: true, includeFreeGames: true, includeFreeSubGames: true, includeUnvettedApps: true })
//             .catch(() => {
//                 return { message: 'Private games' };
//             });

//         // Get appIds and played/unplayed game counts
//         let gameIds = [];
//         let playtime = [];
//         let playedCount = 0;
//         let unplayedCount = 0;
//         let totalPlaytime = 0;
//         for (const item of userGames) {
//             gameIds.push(item.game.id);
//             if (item.minutes > 0) {
//                 playedCount++;
//                 playtime.push(item.minutes);
//                 totalPlaytime += item.minutes;
//             }
//             if (item.minutes === 0) unplayedCount++;
//         }

//         // Chunk gameIds into batches of 500
//         const maxGameIdsPerCall = 500;
//         const gameIdChunks = [];
//         for (let i = 0; i < gameIds.length; i += maxGameIdsPerCall) {
//             gameIdChunks.push(gameIds.slice(i, i + maxGameIdsPerCall));
//         }

//         // Make multiple HTTP calls for each chunk
//         let responseData = [];
//         let prices = [];
//         let totalInitial = 0;
//         let totalFinal = 0;
//         for (const chunk of gameIdChunks) {
//             const chunkString = chunk.join(',');
//             const gamePrices = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${chunkString}&filters=price_overview`);

//             // Process response data for each chunk
//             for (const [gameId, gameData] of Object.entries(gamePrices.data)) {
//                 if (gameData.data && gameData.data.price_overview) {
//                     const finalPrice = gameData.data.price_overview.final || null;
//                     const initialPrice = gameData.data.price_overview.initial || null;

//                     responseData.push({ [gameId]: gameData.data.price_overview });
//                     prices.push(initialPrice);

//                     totalInitial += initialPrice;
//                     totalFinal += finalPrice;
//                 }
//             }
//         }

//         // Format totals
//         const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
//         const totalInitialFormatted = formatter.format(totalInitial / 100);
//         const totalFinalFormatted = formatter.format(totalFinal / 100);
//         const averageGamePrice = formatter.format(getAverage(prices) / 100);
//         const totalPlaytimeHours = minutesToHoursCompact(totalPlaytime);
//         const averagePlaytime = minutesToHoursPrecise(getAverage(playtime));
//         const totalGames = userGames.length;

//         responseData.push({ totals: { totalInitialFormatted, totalFinalFormatted, averageGamePrice, totalPlaytimeHours, averagePlaytime, totalGames } });
//         responseData.push({ playCount: { playedCount, unplayedCount, totalPlaytime } });

//         return { responseData };
//     } catch (e) {
//         console.error(e);
//         return { message: 'Error' };
//     }
// }