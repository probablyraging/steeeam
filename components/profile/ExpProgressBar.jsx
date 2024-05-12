import React, { useState, useEffect } from 'react';
import { Progress, Skeleton } from '@nextui-org/react';
import PrivateGames from '../PrivateGames';

export default function ExpProgressBar({ steamId }) {
    const [userExp, setUserExp] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!steamId) return;
        async function fetchUserExp() {
            const userExpResponse = await fetch(`/api/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-exp', steamId: steamId }),
            }).then(res => res.json());
            console.log(userExpResponse);
            if (userExpResponse.error) {
                return setError(true);
            }
            setUserExp(userExpResponse);
        }
        fetchUserExp();
    }, [steamId]);

    if (error) return <PrivateGames steamId={steamId} />;

    if (!userExp) {
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
                <React.Fragment>
                    <Progress
                        value={userExp.xpRemaining}
                        maxValue={userExp.requiredXP}
                        color='primary'
                        formatOptions={{ style: 'percent' }}
                        showValueLabel
                        valueLabel={`Level ${userExp.level}`}
                        label={
                            <React.Fragment>
                                <p>
                                    <span className='font-bold text-blue-400'>{userExp.xpRemaining}</span> / <span className='font-bold text-blue-400'>{userExp.requiredXP}</span> XP to next level
                                </p>
                            </React.Fragment>
                        }
                        classNames={{
                            value: ['font-medium']
                        }}
                    />
                </React.Fragment>
            </div>
        </React.Fragment >
    )
}