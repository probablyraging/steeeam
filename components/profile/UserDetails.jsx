import Link from 'next/link';
import React from 'react';
import { Button } from '@nextui-org/react';
import { useDisclosure } from '@nextui-org/react';
import IdModal from './IdModal';

export default function UserDetails({ userSummary }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <React.Fragment>
            <div className='flex flex-col w-full gap-6 items-center lg:items-start'>
                <div className='flex flex-col w-full items-center lg:items-start lg:w-fit lg:max-w-[240px]'>
                    <div className='max-w-[220px]'>
                        <Link href={userSummary.customURL} target='_blank'>
                            <p className='text-2xl text-black dark:text-white truncate'>
                                {userSummary.personaName}
                            </p>
                        </Link>
                    </div>

                    <div className='flex items-center gap-2 max-w-[220px]'>
                        <Link href={`https://steamcommunity.com/profiles/${userSummary.steamId}`} target='_blank'>
                            <p className='text-sm truncate'>
                                {userSummary.steamId}
                            </p>
                        </Link>
                        <div
                            className='flex justify-center items-center w-[16px] h-[16px] border border-black dark:border-white rounded-[4px] cursor-pointer'
                            onClick={onOpen}
                        >
                            <p className='text-[10px] font-medium'>id</p>
                        </div>
                    </div>
                </div>

                <div className='w-[214px]'>
                    <Link href={userSummary.customURL} target='_blank'>
                        <Button
                            fullWidth
                            size='sm'
                            className='bg-pop text-white dark:text-black font-medium rounded-md'
                        >
                            View Steam Profile
                        </Button>
                    </Link>
                </div>
            </div>

            <IdModal isOpen={isOpen} onOpenChange={onOpenChange} userSummary={userSummary} />
        </React.Fragment>
    )
}