import React from 'react';
import Link from 'next/link';
import { Progress, Skeleton } from '@nextui-org/react';

export default function GameProgressBar({ playCount, gameData, totals }) {

    if (!playCount || !gameData) {
        return (
            <div className='w-full flex-grow lg:w-fit'>
                <div className='flex flex-col gap-2'>
                    <Skeleton className='w-[200px] h-[18px] rounded-full' />
                    <Skeleton className='w-full h-[14px] rounded-full' />
                    <Skeleton className='w-[120px] h-[16px] rounded-full' />
                </div>
            </div>
        )
    }

    return (
        <React.Fragment>
            <div className='w-full flex-grow lg:w-fit'>
                <Progress
                    value={playCount.playedCount ? playCount.playedCount : 0}
                    maxValue={totals.totalGames ? totals.totalGames : 1}
                    color='primary'
                    formatOptions={{ style: 'percent' }}
                    showValueLabel={true}
                    label={
                        <p>
                            <span className='font-bold text-blue-400'>{playCount.playedCount}</span> / <span className='font-bold text-blue-400'>{totals.totalGames}</span> games played
                        </p>
                    }
                    classNames={{
                        value: ['font-medium']
                    }}
                />

                <Link href={'#games-list'}>
                    <p className='text-sm mt-1'>
                        View Games List
                    </p>
                </Link>
            </div>
        </React.Fragment >
    )
}