import React, { useState, useEffect } from 'react';
import AccountValue from './AccountValue';
import SearchInput from './SearchInput';
import GameProgressBar from './GameProgressBar';
import GameStats from './GameStats';
import TopGames from './TopGames';
import PrivateGames from '../PrivateGames';
import ExpProgressBar from './ExpProgressBar';
import ShareableImage from './ShareableImage';

export default function ProfileSummary({ steamId, countryCode, countryAbbr, isLoading }) {
    const [gameData, setGameData] = useState(null);
    const [totals, setTotals] = useState(null);
    const [playCount, setPlayCount] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!steamId) return;
        setError(false);
        async function request() {
            const gameDataResponse = await fetch(`/api/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    route: 'user-game-data', steamId: steamId, countryCode: countryCode, countryAbbr: countryAbbr
                }),
            }).then(res => res.json());
            if (gameDataResponse.error) {
                return setError(true);
            }
            setGameData(gameDataResponse);
            setTotals(gameDataResponse[gameDataResponse.length - 2].totals);
            setPlayCount(gameDataResponse[gameDataResponse.length - 1].playCount);
        }
        request();
    }, [steamId]);

    if (error) return <PrivateGames steamId={steamId} />;

    return (
        <React.Fragment>
            <div className='flex justify-between items-center flex-col gap-4 lg:items-end lg:flex-row'>
                <SearchInput countryCode={countryCode} countryAbbr={countryAbbr} isLoading={isLoading} />
            </div>

            <div className='flex items-start flex-col gap-12'>
                <AccountValue totals={totals} />
                <GameStats gameData={gameData} totals={totals} countryAbbr={countryAbbr} />
                <div className='flex justify-between items-start flex-col w-full gap-8 lg:flex-row'>
                    <GameProgressBar steamId={steamId} playCount={playCount} gameData={gameData} totals={totals} />
                    <ExpProgressBar steamId={steamId} />
                </div>
            </div>

            <div className='flex items-start flex-col gap-4'>
                <TopGames steamId={steamId} countryCode={countryCode} />
            </div>

            <div className='flex items-start flex-col gap-4'>
                <ShareableImage />
            </div>
        </React.Fragment>
    )
}