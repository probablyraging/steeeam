import React from 'react';
import moment from 'moment';
import { Tooltip } from '@nextui-org/react';
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaEye } from "react-icons/fa";

export default function UserLocation({ userSummary }) {
    return (
        <React.Fragment>
            <div className='flex items-center flex-col w-full gap-2 mt-4 lg:items-start'>
                <Tooltip closeDelay={0} className='bg-tooltip' content={userSummary.location ? userSummary.location : 'Unknown location'}>
                    <div className='flex items-center max-w-[200px] text-sm text-neutral-500 gap-2'>
                        <FaMapMarkerAlt fontSize={16} className='min-w-[16px]' />
                        <p className='text-black dark:text-white truncate'>
                            {userSummary.location ? userSummary.location : 'Unknown location'}
                        </p>
                    </div>
                </Tooltip>

                <div className='flex items-center max-w-[200px] text-sm text-neutral-500 gap-2'>
                    <FaEye fontSize={16} />
                    {userSummary.onlineState === 'online' ? (
                        <p className='text-black dark:text-white truncate'>
                            Last seen now
                        </p>
                    ) : (
                        <p className='text-black dark:text-white truncate'>
                            Last seen {userSummary && userSummary.lastLogOff ? moment.unix(userSummary.lastLogOff).fromNow() : 'never'}
                        </p>
                    )}
                </div>
            </div>
        </React.Fragment>
    )
}