import { getGameData, getUserData, getRelativeTimeImprecise } from '@/utils/utils';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';

async function createPartialCanvas(userData) {
    // Canvas
    const width = 385;
    const height = 503;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    GlobalFonts.registerFromPath(path.join(process.cwd(), 'public', 'Ubuntu-Bold.ttf'), 'Ubuntu');

    // Opaque rectangle
    const cornerRadius = 0;
    ctx.fillStyle = '#0b0b0b';
    ctx.beginPath();
    ctx.moveTo(0 + cornerRadius, 0);
    ctx.lineTo(canvas.width - 0 - cornerRadius, 0);
    ctx.arcTo(canvas.width - 0, 0, canvas.width - 0, 0 + cornerRadius, cornerRadius);
    ctx.lineTo(canvas.width - 0, canvas.height - 0 - cornerRadius);
    ctx.arcTo(canvas.width - 0, canvas.height - 0, canvas.width - 0 - cornerRadius, canvas.height - 0, cornerRadius);
    ctx.lineTo(0 + cornerRadius, canvas.height - 0);
    ctx.arcTo(0, canvas.height - 0, 0, canvas.height - 0 - cornerRadius, cornerRadius);
    ctx.lineTo(0, 0 + cornerRadius);
    ctx.arcTo(0, 0, 0 + cornerRadius, 0, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Username
    async function drawCenteredText() {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 26px Ubuntu';
        const username = userData.profile.personaname
        const textWidth = ctx.measureText(username).width;
        ctx.fillText(username, (canvas.width - textWidth) / 2, 160);
    }
    await drawCenteredText();

    // User details
    if (userData.profile.loccountrycode) {
        const countryImage = await loadImage(`https://flagsapi.com/${userData.profile.loccountrycode}/flat/24.png`);
        ctx.drawImage(countryImage, 70, 184);
        ctx.fillStyle = 'white';
        ctx.font = '18px Ubuntu';
        ctx.fillText(userData.profile.loccountrycode, 100, 203);
    } else {
        const countryImage = await loadImage(`https://flagsapi.com/US/flat/24.png`);
        ctx.drawImage(countryImage, 70, 184);
        ctx.fillStyle = 'white';
        ctx.font = '18px Ubuntu';
        ctx.fillText('US', 100, 203);
    }

    ctx.font = '12px Ubuntu';
    ctx.fillText('•', 135, 201);

    ctx.font = '18px Ubuntu';
    ctx.fillText(getRelativeTimeImprecise(userData.profile.timecreated), 150, 203);

    ctx.font = '12px Ubuntu';
    ctx.fillText('•', 235, 201);

    ctx.font = '18px Ubuntu';
    ctx.fillText(`Level ${userData.level}`, 250, 203);

    // Private
    const privateText = 'Private games list';
    ctx.fillStyle = '#d54e4e';
    ctx.font = '24px Ubuntu';
    ctx.fillText(privateText, (canvas.width - ctx.measureText(privateText).width) / 2, canvas.height / 1.5);

    // Watermark
    const watermarkText = 'https://steeeam.vercel.app';
    ctx.fillStyle = 'grey';
    ctx.font = '10px Ubuntu';
    ctx.fillText(watermarkText, (canvas.width - ctx.measureText(watermarkText).width) - 5, canvas.height - 5);

    // User avatar
    async function drawCenteredRoundedImage() {
        const avatar = await loadImage(userData.profile.avatarfull);
        const desiredWidth = 100;
        const desiredHeight = 100;
        const scaleFactor = Math.min(desiredWidth / avatar.width, desiredHeight / avatar.height);
        const newWidth = avatar.width * scaleFactor;
        const newHeight = avatar.height * scaleFactor;
        const x = (canvas.width - newWidth) / 2;
        ctx.save();
        ctx.beginPath();
        const cornerRadius = 10;
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

async function createFullCanvas(userData, gameData) {
    // Canvas
    const width = 385;
    const height = 503;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    GlobalFonts.registerFromPath(path.join(process.cwd(), 'public', 'Ubuntu-Bold.ttf'), 'Ubuntu');

    // Opaque rectangle
    const cornerRadius = 0;
    ctx.fillStyle = '#0b0b0b';
    ctx.beginPath();
    ctx.moveTo(0 + cornerRadius, 0);
    ctx.lineTo(canvas.width - 0 - cornerRadius, 0);
    ctx.arcTo(canvas.width - 0, 0, canvas.width - 0, 0 + cornerRadius, cornerRadius);
    ctx.lineTo(canvas.width - 0, canvas.height - 0 - cornerRadius);
    ctx.arcTo(canvas.width - 0, canvas.height - 0, canvas.width - 0 - cornerRadius, canvas.height - 0, cornerRadius);
    ctx.lineTo(0 + cornerRadius, canvas.height - 0);
    ctx.arcTo(0, canvas.height - 0, 0, canvas.height - 0 - cornerRadius, cornerRadius);
    ctx.lineTo(0, 0 + cornerRadius);
    ctx.arcTo(0, 0, 0 + cornerRadius, 0, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Username
    async function drawCenteredText() {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 26px Ubuntu';
        const username = userData.profile.personaname
        const textWidth = ctx.measureText(username).width;
        ctx.fillText(username, (canvas.width - textWidth) / 2, 160);
    }
    await drawCenteredText();

    // User details
    if (userData.profile.loccountrycode) {
        const countryImage = await loadImage(`https://flagsapi.com/${userData.profile.loccountrycode}/flat/24.png`);
        ctx.drawImage(countryImage, 70, 184);
        ctx.fillStyle = 'white';
        ctx.font = '18px Ubuntu';
        ctx.fillText(userData.profile.loccountrycode, 100, 203);
    } else {
        const countryImage = await loadImage(`https://flagsapi.com/US/flat/24.png`);
        ctx.drawImage(countryImage, 70, 184);
        ctx.fillStyle = 'white';
        ctx.font = '18px Ubuntu';
        ctx.fillText('US', 100, 203);
    }

    ctx.font = '12px Ubuntu';
    ctx.fillText('•', 135, 201);

    ctx.font = '18px Ubuntu';
    ctx.fillText(getRelativeTimeImprecise(userData.profile.timecreated), 150, 203);

    ctx.font = '12px Ubuntu';
    ctx.fillText('•', 235, 201);

    ctx.font = '18px Ubuntu';
    ctx.fillText(`Level ${userData.level}`, 250, 203);

    // Account details
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 26px Ubuntu';
    ctx.fillText(`$${gameData.totals.totalFinalFormatted}`, 50, 285);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Ubuntu';
    ctx.fillText(`Current Price`, 50, 260);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 26px Ubuntu';
    ctx.fillText(`$${gameData.totals.totalInitialFormatted}`, 227, 285);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Ubuntu';
    ctx.fillText(`Initial Price`, 227, 260);

    const playedCount = gameData.playCount.playedCount.toString();
    const gameCount = gameData.playCount.gameCount.toString();
    ctx.fillStyle = '#f5a524';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(playedCount, 50, 343);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(`/`, (ctx.measureText(playedCount).width + 50) + 5, 343);
    ctx.fillStyle = '#f5a524';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(gameCount, (ctx.measureText(playedCount).width + 50) + 15, 343);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Ubuntu';
    ctx.fillText(`games played`, (ctx.measureText(playedCount).width + ctx.measureText(gameCount).width) + 50 + 20, 343);
    ctx.fillText(`${((parseInt(playedCount) / parseInt(gameCount)) * 100).toFixed(0)}%`, 310, 343);

    function createRoundedProgressBar(barwidth, barheight, progress, barColor, backgroundColor, borderRadius) {
        ctx.fillStyle = backgroundColor;
        roundRect(ctx, 50, 350, barwidth, barheight, borderRadius, true, false);
        const barWidth = Math.floor(barwidth * (progress / 100));
        ctx.fillStyle = barColor;
        roundRect(ctx, 50, 350, barWidth, barheight, borderRadius, true, true);
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
    const barwidth = 293;
    const barheight = 12;
    const progress = (parseInt(playedCount) / parseInt(gameCount)) * 100;
    const barColor = '#f5a524';
    const backgroundColor = '#313131';
    const borderRadius = 6;
    createRoundedProgressBar(barwidth, barheight, progress, barColor, backgroundColor, borderRadius);

    // Other stats
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Ubuntu';
    ctx.fillText(`Avg. Game Price`, 50, 420);
    ctx.fillStyle = '#f5a524';
    ctx.font = 'bold 24px Ubuntu';
    ctx.fillText(`$${gameData.totals.averageGamePrice}`, 50, 446);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Ubuntu';
    ctx.fillText(`Total Playtime`, 230, 420);
    ctx.fillStyle = '#f5a524';
    ctx.font = 'bold 24px Ubuntu';
    ctx.fillText(`${gameData.totals.totalPlaytimeHours}h`, 230, 446);

    // Watermark
    const watermarkText = 'https://steeeam.vercel.app';
    ctx.fillStyle = 'grey';
    ctx.font = '10px Ubuntu';
    ctx.fillText(watermarkText, (canvas.width - ctx.measureText(watermarkText).width) - 5, canvas.height - 5);

    // User avatar
    async function drawCenteredRoundedImage() {
        const avatar = await loadImage(userData.profile.avatarfull);
        const desiredWidth = 100;
        const desiredHeight = 100;
        const scaleFactor = Math.min(desiredWidth / avatar.width, desiredHeight / avatar.height);
        const newWidth = avatar.width * scaleFactor;
        const newHeight = avatar.height * scaleFactor;
        const x = (canvas.width - newWidth) / 2;
        ctx.save();
        ctx.beginPath();
        const cornerRadius = 10;
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

export default async function handler(req, res) {
    const { uid } = req.query;

    let canvasBuffer;

    const userData = await getUserData(uid);
    if (userData.message === 'Private profile') {
        return res.redirect(`/${uid}`);
    }

    const gameData = await getGameData(uid);
    if (gameData.message === 'Private games list') {
        canvasBuffer = await createPartialCanvas(userData);
    } else {
        canvasBuffer = await createFullCanvas(userData, gameData);
    }

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(canvasBuffer);
}