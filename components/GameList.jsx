import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Pagination, Skeleton, Spinner } from '@nextui-org/react';
import GameDetails from './profile/GameDetails';
import { useRouter } from 'next/router';

export default function GameList({ uid }) {
    const router = useRouter();
    const countryCode = router.query.cc;
    const [gameList, setGameList] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoaded, setIsLoaded] = useState(false);
    const itemsPerPage = 100;
    const totalPages = Math.ceil(gameList && gameList.length / itemsPerPage);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoaded(false);
            const gameListResponse = await fetch(`/api/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-game-list', uid: uid }),
            }).then(res => res.json());
            setGameList(gameListResponse)
        }
        fetchData();
    }, []);

    const handleImageLoaded = () => {
        setIsLoaded(true);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (!gameList || !gameList?.length) {
        return (
            <div className='flex flex-col w-full gap-4 mt-10'>
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
                <Skeleton className='rounded-lg min-h-[61.22px] md:min-h-[90px]' />
            </div>
        )
    };

    gameList && gameList.sort((a, b) => b.minutes - a.minutes);
    const slicedData = gameList && gameList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <React.Fragment>
            <Head>
                <title>{uid} - Steeeam</title>
            </Head>

            <div className='flex flex-col w-full gap-4'>
                {totalPages > 1 && (
                    <div className='flex justify-center mt-4'>
                        <Pagination
                            isCompact
                            size='lg'
                            radius='sm'
                            loop
                            showControls
                            total={totalPages}
                            initialPage={1}
                            onChange={handlePageChange}
                            classNames={{
                                item: ['bg-slate-800', 'text-white', 'hover:!bg-slate-700'],
                                prev: ['bg-slate-800', 'text-white', 'hover:!bg-slate-700'],
                                next: ['bg-slate-800', 'text-white', 'hover:!bg-slate-700'],
                                cursor: ['bg-streeeam'],
                            }}
                        />
                    </div>
                )}

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

                {totalPages > 1 && (
                    <div className='flex justify-center mt-4'>
                        <Pagination
                            isCompact
                            size='lg'
                            radius='sm'
                            loop
                            showControls
                            total={totalPages}
                            initialPage={1}
                            onChange={handlePageChange}
                            classNames={{
                                item: ['bg-slate-800', 'text-white', 'hover:!bg-slate-700'],
                                prev: ['bg-slate-800', 'text-white', 'hover:!bg-slate-700'],
                                next: ['bg-slate-800', 'text-white', 'hover:!bg-slate-700'],
                                cursor: ['bg-streeeam'],
                            }}
                        />
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}