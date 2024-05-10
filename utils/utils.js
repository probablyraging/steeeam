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

export function getMaxByProperty(data, property) {
    return data.reduce((acc, curr) => (curr[property] > acc[property] ? curr : acc), data[0]);
}

export function getMinByProperty(data, property) {
    return data.reduce((acc, curr) => (curr[property] < acc[property] ? curr : acc), data[0]);
}

export function pricePerHour(totalCost, totalPlaytime, countryAbbr) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: countryAbbr ? countryAbbr : 'USD' });
    if (totalPlaytime === '0') return formatter.format(0);
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

export async function getUserData(steamid) {
    const steamId = await resolveVanityUrl(steamid);

    const userData = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`);
    const userLevel = await axios.get(`https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}`);

    // Profile not public
    if (userData.data.response.players[0].communityvisibilitystate === 1) {
        return { message: 'Private profile' };
    }

    return { profile: userData.data.response.players[0], level: userLevel.data.response.player_level };
}

export async function getGameData(steamid) {
    const steamId = await resolveVanityUrl(steamid);

    const gameListData = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}`);
    const gameList = gameListData.data.response.games;

    // If no games list then assume the user's profile is private
    if (!gameList) {
        return { message: 'Private games list' };
    }

    const gameCount = gameList.length;

    // Get appIds and played/unplayed game counts
    let appIds = [];
    let playedCount = 0;
    let unplayedCount = 0;
    let totalPlaytime = 0;
    for (const game of gameList) {
        appIds.push(game?.appid);
        if (game.playtime_forever > 0) {
            playedCount++;
            totalPlaytime += game.playtime_forever;
        }
        if (game.playtime_forever === 0) unplayedCount++;
    }

    // Chunk appIds into batches of 500
    const maxAppIdsPerCall = 500;
    const appIdsChunks = [];
    for (let i = 0; i < appIds.length; i += maxAppIdsPerCall) {
        appIdsChunks.push(appIds.slice(i, i + maxAppIdsPerCall));
    }

    // Make multiple HTTP calls for each chunk
    let responseData = [];
    let prices = [];
    let totalInitial = 0;
    let totalFinal = 0;
    for (const appIdsChunk of appIdsChunks) {
        const chunkString = appIdsChunk.join(',');
        const gamePrices = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${chunkString}&filters=price_overview`);

        // Process response data for each chunk
        for (const [appId, appData] of Object.entries(gamePrices.data)) {
            if (appData.data && appData.data.price_overview) {
                const finalPrice = appData.data.price_overview.final || null;
                const finalPriceFormatted = appData.data.price_overview.final_formatted || null;
                const initialPrice = appData.data.price_overview.initial || null;
                const initialPriceFormatted = appData.data.price_overview.initial_formatted || finalPriceFormatted;

                responseData.push({ appId, initialPrice, initialPriceFormatted, finalPrice, finalPriceFormatted });
                prices.push(initialPrice);

                totalInitial += initialPrice;
                totalFinal += finalPrice;
            }
        }
    }

    // Sort response data finalPrice high to low
    responseData.sort((a, b) => b.finalPrice - a.finalPrice);

    // Format total prices
    const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

    const totalInitialFormatted = formatter.format(totalInitial / 100);
    const totalFinalFormatted = formatter.format(totalFinal / 100);
    const averageGamePrice = formatter.format(getAverage(prices) / 100);
    const totalPlaytimeHours = minutesToHoursCompact(totalPlaytime);

    return {
        responseData,
        totals: { totalInitial, totalInitialFormatted, totalFinal, totalFinalFormatted, averageGamePrice, totalPlaytimeHours },
        playCount: { gameCount, playedCount, unplayedCount },
    }
}