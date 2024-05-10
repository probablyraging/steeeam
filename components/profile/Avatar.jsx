import React from 'react';
import Image from 'next/image';
import { Tooltip } from '@nextui-org/react';

export default function Avatar({ userSummary }) {
    return (
        <React.Fragment>
            {userSummary.onlineState === 'offline' ? (
                <div className='relative w-fit'>
                    <Image
                        src={userSummary.avatar}
                        width={214}
                        height={214}
                        alt={`${userSummary.personaName}'s steam avatar`}
                        className='border-2 border-light-border rounded-full w-[114px] h-[114px] lg:w-[214px] lg:h-[214px]'
                    />
                    <div className='absolute right-0 top-[80px] w-[28px] h-[28px] bg-white dark:bg-black rounded-full lg:right-0 lg:top-[150px] lg:w-[38px] lg:h-[38px]'></div>
                    <Tooltip closeDelay={0} className='bg-tooltip' content='Offline'>
                        <div className='absolute right-[5px] top-[85px] w-[18px] h-[18px] bg-red-400 rounded-full lg:right-[5px] lg:top-[155px] lg:w-[28px] lg:h-[28px]'></div>
                    </Tooltip>
                </div>
            ) : (
                <div className='relative w-fit'>
                    <Image
                        src={userSummary.avatar}
                        width={214}
                        height={214}
                        alt={`${userSummary.personaName}'s steam avatar`}
                        className='border-2 border-light-border rounded-full w-[114px] h-[114px] lg:w-[214px] lg:h-[214px]'
                    />
                    <div className='absolute right-0 top-[80px] w-[28px] h-[28px] bg-white dark:bg-black rounded-full lg:right-0 lg:top-[150px] lg:w-[38px] lg:h-[38px]'></div>
                    <Tooltip closeDelay={0} className='bg-tooltip' content='Online'>
                        <div className='absolute right-[5px] top-[85px] w-[18px] h-[18px] bg-green-400 rounded-full lg:right-[5px] lg:top-[155px] lg:w-[28px] lg:h-[28px]'></div>
                    </Tooltip>
                </div>
            )}
        </React.Fragment>
    )
}