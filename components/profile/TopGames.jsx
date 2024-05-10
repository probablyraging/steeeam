import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IoGameController } from "react-icons/io5";
import { Skeleton } from '@nextui-org/react';
import GameDetails from './GameDetails';

export default function TopGames({ steamId, countryCode }) {
    const router = useRouter();
    const { uid } = router.query;
    const [gameList, setGameList] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoaded(false);
            const gameListResponse = await fetch(`/api/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-game-list', steamId: steamId }),
            }).then(res => res.json());
            setGameList(gameListResponse);
        }
        fetchData();
    }, [steamId]);

    const handleImageLoaded = () => {
        setIsLoaded(true);
    };

    if (!gameList || !gameList?.length) {
        return (
            <div className='flex flex-col w-full gap-4 mt-10'>
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
            </div>
        )
    };

    gameList && gameList.sort((a, b) => b.minutes - a.minutes);
    const slicedData = gameList && gameList.slice(0, 5);

    return (
        <React.Fragment>
            <div className='flex flex-col w-full'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-1'>
                        <IoGameController fontSize={22} />
                        <p id='games-list' className='text-lg font-medium py-2'>
                            Top 5 Games
                        </p>
                    </div>
                    <Link href={`https://steamcommunity.com/profiles/${steamId}/games?tab=all`} target='_blank'>
                        <p className='text-sm'>
                            View All
                        </p>
                    </Link>
                </div>

                <div className='flex flex-col w-full gap-4'>
                    {slicedData.map((item, index) => (
                        <Link key={item.game.id} href={`https://store.steampowered.com/app/${item.game.id}`} target='_blank'>
                            <div className='bg-base border border-light-border rounded-md min-h-[61.22px] hover:bg-base-hover hover:border-hover-border md:min-h-[110px]'>
                                <div className='flex gap-2'>
                                    <Skeleton isLoaded={isLoaded}>
                                        <Image
                                            className='rounded-md-lg md:rounded-bl-md min-h-[110px] min-w-[131px] max-w-[131px] object-cover md:min-w-[231px] md:max-w-[231px]'
                                            src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.game.id}/header.jpg`}
                                            width={231}
                                            height={87}
                                            alt={`${item.game.name} capsule image`}
                                            onLoad={handleImageLoaded}
                                        />
                                    </Skeleton>

                                    <GameDetails gameId={item.game.id} minutes={item.minutes} lastPlayedTimestamp={item.lastPlayedTimestamp} countryCode={countryCode} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </React.Fragment>
    )
}