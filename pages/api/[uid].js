import { getRelativeTimeImprecise, resolveVanityUrl, getAverage, minutesToHoursPrecise, minutesToHoursCompact, pricePerHour } from '@/utils/utils';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import SteamAPI from "steamapi";
import * as sidr from 'steamid-resolver';
import moment from 'moment';
import path from 'path';
import axios from 'axios';

async function getUserData(uid) {
    try {
        const steamId = await resolveVanityUrl(uid);

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const userSummary = await sapi.getUserSummary(steamId);
        const sidrSummary = await sidr.steamID64ToFullInfo(steamId);

        return {
            steamId: steamId,
            personaName: userSummary.nickname,
            visible: userSummary.visible,
            avatar: userSummary.avatar.large,
            lastLogOff: userSummary.lastLogOffTimestamp,
            createdAt: userSummary.createdTimestamp,
            countryCode: userSummary.countryCode,
            stateCode: userSummary.stateCode,
            onlineState: sidrSummary.onlineState ? sidrSummary.onlineState[0] : null,
            location: sidrSummary.location ? sidrSummary.location[0] : 'Unknown',
        };
    } catch (e) {
        console.error(e);
        return { message: 'Error' };
    }
}

async function getGameData(uid) {
    try {
        const steamId = await resolveVanityUrl(uid);

        const sapi = new SteamAPI(process.env.STEAM_API_KEY);

        const userGames = await sapi.getUserOwnedGames(steamId, { includeExtendedAppInfo: true, includeFreeGames: true, includeFreeSubGames: true, includeUnvettedApps: true })
            .catch(() => {
                return { message: 'Private games' };
            });

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
            const gamePrices = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${chunkString}&filters=price_overview`);

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
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        const totalInitialFormatted = formatter.format(totalInitial / 100);
        const totalFinalFormatted = formatter.format(totalFinal / 100);
        const averageGamePrice = formatter.format(getAverage(prices) / 100);
        const totalPlaytimeHours = minutesToHoursCompact(totalPlaytime);
        const averagePlaytime = minutesToHoursPrecise(getAverage(playtime));
        const totalGames = userGames.length;

        return {
            totals: { totalInitialFormatted, totalFinalFormatted, averageGamePrice, totalPlaytimeHours, averagePlaytime, totalGames },
            playCount: { playedCount, unplayedCount, totalPlaytime }
        };
    } catch (e) {
        console.error(e);
        return { message: 'Error' };
    }
}

export default async function handler(req, res) {
    const { uid } = req.query;

    let canvasBuffer;

    const userData = await getUserData(uid);
    const gameData = await getGameData(uid);

    if (gameData.message === 'Private games') {
        canvasBuffer = await createPartialCanvas(userData);
    } else {
        canvasBuffer = await createFullCanvas(userData, gameData);
    }

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(canvasBuffer);
}










async function createFullCanvas(userData, gameData) {
    // Canvas
    const width = 705;
    const height = 385;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    GlobalFonts.registerFromPath(path.join(process.cwd(), 'public', 'GeistVF.woff2'), 'Geist');

    // Background
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, width, height);

    // Username (truncated if too long)
    ctx.fillStyle = '#fff';
    ctx.font = '700 20px Geist';
    let username = userData.personaName;
    const usernameWidth = ctx.measureText(username).width;
    if (usernameWidth > 180) {
        let truncatedLength = 0;
        for (let i = 0; i < username.length; i++) {
            let truncatedText = username.slice(0, i) + '...';
            let textWidth = ctx.measureText(truncatedText).width;
            if (textWidth > 180) {
                break;
            }
            truncatedLength = i;
        }
        const truncatedUsername = username.slice(0, truncatedLength) + '...';
        ctx.fillText(truncatedUsername, 20, 180);
    } else {
        ctx.fillText(username, 20, 180);
    }

    // SteamID
    ctx.fillStyle = '#adadad';
    ctx.font = '10px Geist';
    const steamId = userData.steamId;
    ctx.fillText(steamId, 20, 200);

    // Location
    const locIcon = await loadImage(path.join(process.cwd(), 'public', 'loc-icon.png'));
    ctx.drawImage(locIcon, 20, 220);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Geist';
    let location = userData.location || 'Unknown';
    if (location.length > 22) location = location.slice(0, 22) + '...';
    ctx.fillText(location, 43, 234);

    // Last seen
    const seenIcon = await loadImage(path.join(process.cwd(), 'public', 'seen-icon.png'));
    ctx.drawImage(seenIcon, 20, 245);
    ctx.font = '12px Geist';
    const lastSeen = `Last seen ${userData.lastLogOff ? moment.unix(userData.lastLogOff).fromNow() : 'never'}`;
    ctx.fillText(lastSeen, 43, 259);

    // Created at
    const joinIcon = await loadImage(path.join(process.cwd(), 'public', 'join-icon.png'));
    ctx.drawImage(joinIcon, 20, 270);
    ctx.font = '12px Geist';
    const createdAt = `${userData.createdAt ? `Joined ${getRelativeTimeImprecise(userData.createdAt)} ago` : 'Unknown'}`;
    ctx.fillText(createdAt, 43, 284);

    // Vertical divider
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff30';
    ctx.beginPath();
    ctx.moveTo(200, 15);
    ctx.lineTo(200, canvas.height - 15);
    ctx.stroke();

    // Account stats header
    const gameStatsIcon = await loadImage(path.join(process.cwd(), 'public', 'game-stats-icon.png'));
    ctx.drawImage(gameStatsIcon, 215, 20);
    ctx.font = '600 16px Geist';
    const gameStatsHeader = 'Account Statistics';
    ctx.fillText(gameStatsHeader, 245, 37);

    // Horizontal divider
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff30';
    ctx.beginPath();
    ctx.moveTo(215, 50);
    ctx.lineTo(canvas.width - 15, 50);
    ctx.stroke();

    // Account value
    // Current
    ctx.fillStyle = '#adadad';
    ctx.font = '16px Geist';
    ctx.fillText('Current Price', 215, 80);
    ctx.fillStyle = '#f87171';
    ctx.font = '600 26px Geist';
    ctx.fillText(`${gameData.totals?.totalFinalFormatted || '$0'}`, 215, 110);
    //Initial
    ctx.fillStyle = '#adadad';
    ctx.font = '16px Geist';
    ctx.fillText('Initial Price', 370, 80);
    ctx.fillStyle = '#4ade80';
    ctx.font = '600 26px Geist';
    ctx.fillText(`${gameData.totals?.totalInitialFormatted || '$0'}`, 370, 110);

    // Game stats
    // Total games
    ctx.fillStyle = '#adadad';
    ctx.font = '16px Geist';
    ctx.fillText('Total Games', 215, 160);
    ctx.fillStyle = '#fff';
    ctx.font = '600 26px Geist';
    ctx.fillText(`${gameData.totals?.totalGames || '0'}`, 215, 190);
    // Average price
    ctx.fillStyle = '#adadad';
    ctx.font = '16px Geist';
    ctx.fillText('Avg. Price', 370, 160);
    ctx.fillStyle = '#fff';
    ctx.font = '600 26px Geist';
    ctx.fillText(`${gameData.totals?.averageGamePrice || '$0'}`, 370, 190);
    // Price per hour
    ctx.fillStyle = '#adadad';
    ctx.font = '16px Geist';
    ctx.fillText('Price Per Hour', 510, 160);
    ctx.fillStyle = '#fff';
    ctx.font = '600 26px Geist';
    ctx.fillText(`${pricePerHour(gameData.totals.totalFinalFormatted, gameData.totals.totalPlaytimeHours) || '0'}`, 510, 190);
    // Average playtime
    ctx.fillStyle = '#adadad';
    ctx.font = '16px Geist';
    ctx.fillText('Avg, Playtime', 215, 240);
    ctx.fillStyle = '#fff';
    ctx.font = '600 26px Geist';
    ctx.fillText(`${gameData.totals.averagePlaytime || '0'}`, 215, 270);
    // Total playtime
    ctx.fillStyle = '#adadad';
    ctx.font = '16px Geist';
    ctx.fillText('Avg, Playtime', 370, 240);
    ctx.fillStyle = '#fff';
    ctx.font = '600 26px Geist';
    ctx.fillText(`${gameData.totals?.totalPlaytimeHours || '0'}h`, 370, 270);

    // Game progress bar
    const playedCount = gameData.playCount?.playedCount.toString() || '0';
    const gameCount = gameData.totals?.totalGames.toString() || '0';
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(playedCount, 215, 324);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(`/`, (ctx.measureText(playedCount).width + 215) + 5, 324);
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(gameCount, (ctx.measureText(playedCount).width + 215) + 15, 324);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(`games played`, (ctx.measureText(playedCount).width + ctx.measureText(gameCount).width) + 215 + 20, 324);
    ctx.fillText(`${((parseInt(playedCount) / parseInt(gameCount)) * 100).toFixed(0)}%`, 405, 324);

    function createRoundedProgressBar(barwidth, barheight, progress, barColor, backgroundColor, borderRadius) {
        ctx.fillStyle = backgroundColor;
        roundRect(ctx, 215, 330, barwidth, barheight, borderRadius, true, false);
        const barWidth = Math.floor(barwidth * (progress / 100));
        ctx.fillStyle = barColor;
        roundRect(ctx, 215, 330, barWidth, barheight, borderRadius, true, true);
    }

    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
    }
    const barwidth = 220;
    const barheight = 12;
    const progress = (parseInt(playedCount) / parseInt(gameCount)) * 100;
    const barColor = '#006fee';
    const backgroundColor = '#313131';
    const borderRadius = 6;
    createRoundedProgressBar(barwidth, barheight, progress, barColor, backgroundColor, borderRadius);

    // Exp progress bar
    // const playedCountt = gameData.playCount.playedCount.toString();
    // const gameCountt = gameData.totals.totalGames.toString();
    // ctx.fillStyle = '#60a5fa';
    // ctx.font = 'bold 14px Ubuntu';
    // ctx.fillText(playedCountt, 470, 324);
    // ctx.fillStyle = 'white';
    // ctx.font = 'bold 14px Ubuntu';
    // ctx.fillText(`/`, (ctx.measureText(playedCountt).width + 470) + 5, 324);
    // ctx.fillStyle = '#60a5fa';
    // ctx.font = 'bold 14px Ubuntu';
    // ctx.fillText(gameCountt, (ctx.measureText(playedCountt).width + 470) + 15, 324);
    // ctx.fillStyle = 'white';
    // ctx.font = 'bold 14px Ubuntu';
    // ctx.fillText(`games played`, (ctx.measureText(playedCountt).width + ctx.measureText(gameCountt).width) + 470 + 20, 324);
    // ctx.fillText(`${((parseInt(playedCountt) / parseInt(gameCountt)) * 100).toFixed(0)}%`, 630, 324);

    // function createRoundedProgressBarr(barwidth, barheight, progress, barColor, backgroundColor, borderRadius) {
    //     ctx.fillStyle = backgroundColor;
    //     roundRect(ctx, 470, 330, barwidth, barheight, borderRadius, true, false);
    //     const barWidth = Math.floor(barwidth * (progress / 100));
    //     ctx.fillStyle = barColor;
    //     roundRect(ctx, 470, 330, barWidth, barheight, borderRadius, true, true);
    // }

    // function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    //     if (typeof stroke === 'undefined') {
    //         stroke = true;
    //     }
    //     if (typeof radius === 'undefined') {
    //         radius = 5;
    //     }
    //     ctx.beginPath();
    //     ctx.moveTo(x + radius, y);
    //     ctx.lineTo(x + width - radius, y);
    //     ctx.arcTo(x + width, y, x + width, y + radius, radius);
    //     ctx.lineTo(x + width, y + height - radius);
    //     ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    //     ctx.lineTo(x + radius, y + height);
    //     ctx.arcTo(x, y + height, x, y + height - radius, radius);
    //     ctx.lineTo(x, y + radius);
    //     ctx.arcTo(x, y, x + radius, y, radius);
    //     ctx.closePath();
    //     if (stroke) {
    //         ctx.stroke();
    //     }
    //     if (fill) {
    //         ctx.fill();
    //     }
    // }
    // const barwidthh = 220;
    // const barheightt = 12;
    // const progresss = (parseInt(playedCountt) / parseInt(gameCountt)) * 100;
    // const barColorr = '#006fee';
    // const backgroundColorr = '#313131';
    // const borderRadiuss = 6;
    // createRoundedProgressBarr(barwidthh, barheightt, progresss, barColorr, backgroundColorr, borderRadiuss);

    // Avatar
    async function drawCenteredRoundedImage() {
        const avatar = await loadImage(userData.avatar);
        const desiredWidth = 130;
        const desiredHeight = 130;
        const scaleFactor = Math.min(desiredWidth / avatar.width, desiredHeight / avatar.height);
        const newWidth = avatar.width * scaleFactor;
        const newHeight = avatar.height * scaleFactor;
        ctx.save();
        ctx.beginPath();
        const cornerRadius = newWidth / 2;
        const x = 40;
        const y = 20;
        ctx.moveTo(x + cornerRadius, y);
        ctx.arcTo(x + newWidth, y, x + newWidth, y + newHeight, cornerRadius);
        ctx.arcTo(x + newWidth, y + newHeight, x, y + newHeight, cornerRadius);
        ctx.arcTo(x, y + newHeight, x, y, cornerRadius);
        ctx.arcTo(x, y, x + newWidth, y, cornerRadius);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, x, y, newWidth, newHeight);
        ctx.restore();
    }
    await drawCenteredRoundedImage();

    const buffer = canvas.toBuffer('image/png');
    return buffer;
}










// async function createFullCanvasOld(userData, gameData) {
//     // Canvas
//     const width = 385;
//     const height = 503;
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d');
//     GlobalFonts.registerFromPath(path.join(process.cwd(), 'public', 'Ubuntu-Bold.ttf'), 'Ubuntu');

//     // Opaque rectangle
//     const cornerRadius = 0;
//     ctx.fillStyle = '#0b0b0b';
//     ctx.beginPath();
//     ctx.moveTo(0 + cornerRadius, 0);
//     ctx.lineTo(canvas.width - 0 - cornerRadius, 0);
//     ctx.arcTo(canvas.width - 0, 0, canvas.width - 0, 0 + cornerRadius, cornerRadius);
//     ctx.lineTo(canvas.width - 0, canvas.height - 0 - cornerRadius);
//     ctx.arcTo(canvas.width - 0, canvas.height - 0, canvas.width - 0 - cornerRadius, canvas.height - 0, cornerRadius);
//     ctx.lineTo(0 + cornerRadius, canvas.height - 0);
//     ctx.arcTo(0, canvas.height - 0, 0, canvas.height - 0 - cornerRadius, cornerRadius);
//     ctx.lineTo(0, 0 + cornerRadius);
//     ctx.arcTo(0, 0, 0 + cornerRadius, 0, cornerRadius);
//     ctx.closePath();
//     ctx.fill();

//     // Username
//     async function drawCenteredText() {
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 26px Ubuntu';
//         const username = userData.profile.personaname
//         const textWidth = ctx.measureText(username).width;
//         ctx.fillText(username, (canvas.width - textWidth) / 2, 160);
//     }
//     await drawCenteredText();

//     // User details
//     if (userData.profile.loccountrycode) {
//         const countryImage = await loadImage(`https://flagsapi.com/${userData.profile.loccountrycode}/flat/24.png`);
//         ctx.drawImage(countryImage, 70, 184);
//         ctx.fillStyle = 'white';
//         ctx.font = '18px Ubuntu';
//         ctx.fillText(userData.profile.loccountrycode, 100, 203);
//     } else {
//         const countryImage = await loadImage(`https://flagsapi.com/US/flat/24.png`);
//         ctx.drawImage(countryImage, 70, 184);
//         ctx.fillStyle = 'white';
//         ctx.font = '18px Ubuntu';
//         ctx.fillText('US', 100, 203);
//     }

//     ctx.font = '12px Ubuntu';
//     ctx.fillText('•', 135, 201);

//     ctx.font = '18px Ubuntu';
//     ctx.fillText(getRelativeTimeImprecise(userData.profile.timecreated), 150, 203);

//     ctx.font = '12px Ubuntu';
//     ctx.fillText('•', 235, 201);

//     ctx.font = '18px Ubuntu';
//     ctx.fillText(`Level ${userData.level}`, 250, 203);

//     // Account details
//     ctx.fillStyle = '#f87171';
//     ctx.font = 'bold 26px Ubuntu';
//     ctx.fillText(`$${gameData.totals.totalFinalFormatted}`, 50, 285);
//     ctx.fillStyle = 'white';
//     ctx.font = 'bold 12px Ubuntu';
//     ctx.fillText(`Current Price`, 50, 260);

//     ctx.fillStyle = '#4ade80';
//     ctx.font = 'bold 26px Ubuntu';
//     ctx.fillText(`$${gameData.totals.totalInitialFormatted}`, 227, 285);
//     ctx.fillStyle = 'white';
//     ctx.font = 'bold 12px Ubuntu';
//     ctx.fillText(`Initial Price`, 227, 260);

//     const playedCount = gameData.playCount.playedCount.toString();
//     const gameCount = gameData.playCount.gameCount.toString();
//     ctx.fillStyle = '#f5a524';
//     ctx.font = 'bold 14px Ubuntu';
//     ctx.fillText(playedCount, 50, 343);
//     ctx.fillStyle = 'white';
//     ctx.font = 'bold 14px Ubuntu';
//     ctx.fillText(`/`, (ctx.measureText(playedCount).width + 50) + 5, 343);
//     ctx.fillStyle = '#f5a524';
//     ctx.font = 'bold 14px Ubuntu';
//     ctx.fillText(gameCount, (ctx.measureText(playedCount).width + 50) + 15, 343);
//     ctx.fillStyle = 'white';
//     ctx.font = 'bold 14px Ubuntu';
//     ctx.fillText(`games played`, (ctx.measureText(playedCount).width + ctx.measureText(gameCount).width) + 50 + 20, 343);
//     ctx.fillText(`${((parseInt(playedCount) / parseInt(gameCount)) * 100).toFixed(0)}%`, 310, 343);

//     function createRoundedProgressBar(barwidth, barheight, progress, barColor, backgroundColor, borderRadius) {
//         ctx.fillStyle = backgroundColor;
//         roundRect(ctx, 50, 350, barwidth, barheight, borderRadius, true, false);
//         const barWidth = Math.floor(barwidth * (progress / 100));
//         ctx.fillStyle = barColor;
//         roundRect(ctx, 50, 350, barWidth, barheight, borderRadius, true, true);
//     }

//     function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
//         if (typeof stroke === 'undefined') {
//             stroke = true;
//         }
//         if (typeof radius === 'undefined') {
//             radius = 5;
//         }
//         ctx.beginPath();
//         ctx.moveTo(x + radius, y);
//         ctx.lineTo(x + width - radius, y);
//         ctx.arcTo(x + width, y, x + width, y + radius, radius);
//         ctx.lineTo(x + width, y + height - radius);
//         ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
//         ctx.lineTo(x + radius, y + height);
//         ctx.arcTo(x, y + height, x, y + height - radius, radius);
//         ctx.lineTo(x, y + radius);
//         ctx.arcTo(x, y, x + radius, y, radius);
//         ctx.closePath();
//         if (stroke) {
//             ctx.stroke();
//         }
//         if (fill) {
//             ctx.fill();
//         }
//     }
//     const barwidth = 293;
//     const barheight = 12;
//     const progress = (parseInt(playedCount) / parseInt(gameCount)) * 100;
//     const barColor = '#f5a524';
//     const backgroundColor = '#313131';
//     const borderRadius = 6;
//     createRoundedProgressBar(barwidth, barheight, progress, barColor, backgroundColor, borderRadius);

//     // Other stats
//     ctx.fillStyle = 'white';
//     ctx.font = 'bold 16px Ubuntu';
//     ctx.fillText(`Avg. Game Price`, 50, 420);
//     ctx.fillStyle = '#f5a524';
//     ctx.font = 'bold 24px Ubuntu';
//     ctx.fillText(`$${gameData.totals.averageGamePrice}`, 50, 446);

//     ctx.fillStyle = 'white';
//     ctx.font = 'bold 16px Ubuntu';
//     ctx.fillText(`Total Playtime`, 230, 420);
//     ctx.fillStyle = '#f5a524';
//     ctx.font = 'bold 24px Ubuntu';
//     ctx.fillText(`${gameData.totals.totalPlaytimeHours}h`, 230, 446);

//     // Watermark
//     const watermarkText = 'https://steeeam.vercel.app';
//     ctx.fillStyle = 'grey';
//     ctx.font = '10px Ubuntu';
//     ctx.fillText(watermarkText, (canvas.width - ctx.measureText(watermarkText).width) - 5, canvas.height - 5);

//     // User avatar
//     async function drawCenteredRoundedImage() {
//         const avatar = await loadImage(userData.profile.avatarfull);
//         const desiredWidth = 100;
//         const desiredHeight = 100;
//         const scaleFactor = Math.min(desiredWidth / avatar.width, desiredHeight / avatar.height);
//         const newWidth = avatar.width * scaleFactor;
//         const newHeight = avatar.height * scaleFactor;
//         const x = (canvas.width - newWidth) / 2;
//         ctx.save();
//         ctx.beginPath();
//         const cornerRadius = 10;
//         const y = 20;
//         ctx.moveTo(x + cornerRadius, y);
//         ctx.arcTo(x + newWidth, y, x + newWidth, y + newHeight, cornerRadius);
//         ctx.arcTo(x + newWidth, y + newHeight, x, y + newHeight, cornerRadius);
//         ctx.arcTo(x, y + newHeight, x, y, cornerRadius);
//         ctx.arcTo(x, y, x + newWidth, y, cornerRadius);
//         ctx.closePath();
//         ctx.clip();
//         ctx.drawImage(avatar, x, y, newWidth, newHeight);
//         ctx.restore();
//     }
//     await drawCenteredRoundedImage();

//     const buffer = canvas.toBuffer('image/png');
//     return buffer;
// }













// async function createPartialCanvas(userData) {
//     // Canvas
//     const width = 385;
//     const height = 503;
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d');
//     GlobalFonts.registerFromPath(path.join(process.cwd(), 'public', 'Ubuntu-Bold.ttf'), 'Ubuntu');

//     // Opaque rectangle
//     const cornerRadius = 0;
//     ctx.fillStyle = '#0b0b0b';
//     ctx.beginPath();
//     ctx.moveTo(0 + cornerRadius, 0);
//     ctx.lineTo(canvas.width - 0 - cornerRadius, 0);
//     ctx.arcTo(canvas.width - 0, 0, canvas.width - 0, 0 + cornerRadius, cornerRadius);
//     ctx.lineTo(canvas.width - 0, canvas.height - 0 - cornerRadius);
//     ctx.arcTo(canvas.width - 0, canvas.height - 0, canvas.width - 0 - cornerRadius, canvas.height - 0, cornerRadius);
//     ctx.lineTo(0 + cornerRadius, canvas.height - 0);
//     ctx.arcTo(0, canvas.height - 0, 0, canvas.height - 0 - cornerRadius, cornerRadius);
//     ctx.lineTo(0, 0 + cornerRadius);
//     ctx.arcTo(0, 0, 0 + cornerRadius, 0, cornerRadius);
//     ctx.closePath();
//     ctx.fill();

//     // Username
//     async function drawCenteredText() {
//         ctx.fillStyle = 'white';
//         ctx.font = 'bold 26px Ubuntu';
//         const username = userData.profile.personaname
//         const textWidth = ctx.measureText(username).width;
//         ctx.fillText(username, (canvas.width - textWidth) / 2, 160);
//     }
//     await drawCenteredText();

//     // User details
//     if (userData.profile.loccountrycode) {
//         const countryImage = await loadImage(`https://flagsapi.com/${userData.profile.loccountrycode}/flat/24.png`);
//         ctx.drawImage(countryImage, 70, 184);
//         ctx.fillStyle = 'white';
//         ctx.font = '18px Ubuntu';
//         ctx.fillText(userData.profile.loccountrycode, 100, 203);
//     } else {
//         const countryImage = await loadImage(`https://flagsapi.com/US/flat/24.png`);
//         ctx.drawImage(countryImage, 70, 184);
//         ctx.fillStyle = 'white';
//         ctx.font = '18px Ubuntu';
//         ctx.fillText('US', 100, 203);
//     }

//     ctx.font = '12px Ubuntu';
//     ctx.fillText('•', 135, 201);

//     ctx.font = '18px Ubuntu';
//     ctx.fillText(getRelativeTimeImprecise(userData.profile.timecreated), 150, 203);

//     ctx.font = '12px Ubuntu';
//     ctx.fillText('•', 235, 201);

//     ctx.font = '18px Ubuntu';
//     ctx.fillText(`Level ${userData.level}`, 250, 203);

//     // Private
//     const privateText = 'Private games list';
//     ctx.fillStyle = '#d54e4e';
//     ctx.font = '24px Ubuntu';
//     ctx.fillText(privateText, (canvas.width - ctx.measureText(privateText).width) / 2, canvas.height / 1.5);

//     // Watermark
//     const watermarkText = 'https://steeeam.vercel.app';
//     ctx.fillStyle = 'grey';
//     ctx.font = '10px Ubuntu';
//     ctx.fillText(watermarkText, (canvas.width - ctx.measureText(watermarkText).width) - 5, canvas.height - 5);

//     // User avatar
//     async function drawCenteredRoundedImage() {
//         const avatar = await loadImage(userData.profile.avatarfull);
//         const desiredWidth = 100;
//         const desiredHeight = 100;
//         const scaleFactor = Math.min(desiredWidth / avatar.width, desiredHeight / avatar.height);
//         const newWidth = avatar.width * scaleFactor;
//         const newHeight = avatar.height * scaleFactor;
//         const x = (canvas.width - newWidth) / 2;
//         ctx.save();
//         ctx.beginPath();
//         const cornerRadius = 10;
//         const y = 20;
//         ctx.moveTo(x + cornerRadius, y);
//         ctx.arcTo(x + newWidth, y, x + newWidth, y + newHeight, cornerRadius);
//         ctx.arcTo(x + newWidth, y + newHeight, x, y + newHeight, cornerRadius);
//         ctx.arcTo(x, y + newHeight, x, y, cornerRadius);
//         ctx.arcTo(x, y, x + newWidth, y, cornerRadius);
//         ctx.closePath();
//         ctx.clip();
//         ctx.drawImage(avatar, x, y, newWidth, newHeight);
//         ctx.restore();
//     }
//     await drawCenteredRoundedImage();

//     const buffer = canvas.toBuffer('image/png');
//     return buffer;
// }