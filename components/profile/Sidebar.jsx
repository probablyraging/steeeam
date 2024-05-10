import React from 'react';
import Navigation from './Navigation';
import Avatar from './Avatar';
import UserDetails from './UserDetails';
import UserConnection from './UserConnection';
import UserLocation from './UserLocation';
import UserBans from './UserBans';

export default function Sidebar({ steamId, userSummary }) {
    return (
        <React.Fragment>
            <div className='flex flex-col gap-4 w-full items-center z-50 lg:absolute lg:item-start lg:max-w-[240px] lg:w-fit'>
                <Navigation />
                <Avatar userSummary={userSummary} />
                <UserDetails userSummary={userSummary} />
                <UserConnection steamId={userSummary.steamId} userSummary={userSummary} />
                <UserLocation userSummary={userSummary} />

                <div className='flex justify-center w-full mt-3 lg:block'>
                    <UserBans steamId={steamId} />
                </div>
            </div>
        </React.Fragment>
    )
}