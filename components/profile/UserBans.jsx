import React, { useState, useEffect } from 'react';
import { Divider, Spinner } from '@nextui-org/react';
import { FaCheck } from "react-icons/fa6";
import { FaX } from "react-icons/fa6";

export default function UserBans({ steamId }) {
    const [userBans, setUserBans] = useState(null);

    useEffect(() => {
        if (!steamId) return;
        async function fetchUserBans() {
            const userBansResponse = await fetch(`/api/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-bans', steamId: steamId }),
            }).then(res => res.json());
            setUserBans(userBansResponse);
        }
        fetchUserBans();
    }, [steamId]);

    return (
        <React.Fragment>
            <Divider className='hidden bg-light-border mb-7 lg:block' />
            <div className='flex justify-center lg:block'>
                <div className='grid grid-cols-4 grid-rows-3 text-sm lg:gap-y-2 lg:grid-cols-2 lg:max-w-[200px]'>
                    <div className='flex items-center'>
                        <p>VAC Status</p>
                    </div>
                    <div className='flex justify-center items-center'>
                        {!userBans ? (
                            <Spinner size='sm' color='current' />
                        ) : (
                            <p>{!userBans.vacBanned ? (<FaCheck className='text-green-400' />) : (<FaX className='text-red-400' />)}</p>
                        )}
                    </div>

                    <div className='flex items-center'>
                        <p>Comm. Status</p>
                    </div>
                    <div className='flex justify-center items-center'>
                        {!userBans ? (
                            <Spinner size='sm' color='current' />
                        ) : (
                            <p>{!userBans.communityBanned ? (<FaCheck className='text-green-400' />) : (<FaX className='text-red-400' />)}</p>
                        )}
                    </div>

                    <div className='flex items-center'>
                        <p>Trade Status</p>
                    </div>
                    <div className='flex justify-center items-center'>
                        {!userBans ? (
                            <Spinner size='sm' color='current' />
                        ) : (
                            <p>{userBans.economyBan === 'none' ? (<FaCheck className='text-green-400' />) : (<FaX className='text-red-400' />)}</p>
                        )}
                    </div>

                    <div className='flex items-center'>
                        <p>VAC Bans</p>
                    </div>
                    <div className='flex justify-center items-center'>
                        {!userBans ? (
                            <Spinner size='sm' color='current' />
                        ) : (
                            <p>{userBans.vacBans}</p>
                        )}
                    </div>

                    <div className='flex items-center'>
                        <p>Game Bans</p>
                    </div>
                    <div className='flex justify-center items-center'>
                        {!userBans ? (
                            <Spinner size='sm' color='current' />
                        ) : (
                            <p>{userBans.gameBans}</p>
                        )}
                    </div>

                    <div className='flex items-center'>
                        <p>Last Ban</p>
                    </div>
                    <div className='flex justify-center items-center'>
                        {!userBans ? (
                            <Spinner size='sm' color='current' />
                        ) : (
                            <p className='truncate'>{userBans.daysSinceLastBan} days ago</p>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}