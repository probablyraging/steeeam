import React from 'react';
import Image from 'next/image';
import { Spinner } from '@nextui-org/react';
import { useTheme } from 'next-themes';

export default function Loader() {
    const { resolvedTheme } = useTheme();

    return (
        <div className='flex justify-center items-center w-full h-screen'>
            <div className='absolute'>
                <Image src={resolvedTheme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'} width={18} height={18} alt='steeeam logo' />
            </div>
            <Spinner size='lg' color='current' />
        </div>
    )
}