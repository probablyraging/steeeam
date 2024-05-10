import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Divider, Skeleton } from '@nextui-org/react';
import { HiMiniUserGroup } from 'react-icons/hi2';
import { RiBuilding4Fill } from "react-icons/ri";

export default function UserConnection({ steamId, userSummary }) {
    const [userConnections, setUserConnections] = useState(null);

    useEffect(() => {
        if (!steamId) return;
        async function fetchUserFriends() {
            const userConnectionsResponse = await fetch(`/api/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-connections', steamId: steamId }),
            }).then(res => res.json());
            setUserConnections(userConnectionsResponse);
        }
        fetchUserFriends();
    }, [steamId]);

    if (!userConnections) return <Skeleton className='w-full h-[18px] rounded-full mt-2' />;

    return (
        <React.Fragment>
            <div className='flex justify-center items-center max-w-[240px] gap-2 w-full mt-2 lg:justify-start'>
                <div className='flex items-center max-w-[100px] text-sm text-neutral-500 gap-2'>
                    <HiMiniUserGroup fontSize={16} />
                    <Link href={`${userSummary.customURL}friends`} target='_blank'>
                        <p className='flex gap-1 truncate'>
                            <span className='text-black dark:text-white'>{userConnections.friendCount > 99 ? '99+' : userConnections.friendCount}</span> friends
                        </p>
                    </Link>
                </div>

                <Divider orientation='vertical' className='w-[2px] h-[2px] bg-white rounded-full' />

                <div className='flex items-center max-w-[100px] text-sm text-neutral-500 gap-2'>
                    <RiBuilding4Fill fontSize={16} />
                    <Link href={`${userSummary.customURL}groups`} target='_blank'>
                        <p className='flex gap-1 truncate'>
                            <span className='text-black dark:text-white'>{userConnections.groupCount > 99 ? '99+' : userConnections.groupCount}</span> groups
                        </p>
                    </Link>
                </div>
            </div>
        </React.Fragment>
    )
}