import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button } from '@nextui-org/react';
import { TiArrowBack } from "react-icons/ti";
import { useTheme } from 'next-themes';
import localFont from 'next/font/local';

const Engrain = localFont({ src: '../../public/Elgraine-Black-Italic.ttf' });

export default function Navigation() {
    const router = useRouter();
    const { resolvedTheme } = useTheme();

    const handleClick = () => {
        router.push('/');
    };

    return (
        <React.Fragment>
            <div className='relative flex justify-between items-center w-full'>
                <Button
                    isIconOnly
                    startContent={<TiArrowBack fontSize={22} />}
                    size='sm'
                    onClick={handleClick}
                    className='bg-pop text-white dark:text-black rounded-md z-50'
                />

                <div className='absolute flex justify-center items-center gap-1 w-full select-none flex-grow'>
                    <Image src={resolvedTheme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'} width={30} height={30} alt='steeeam logo' />
                    <p className={`${Engrain.className} text-lg font-medium`}>
                        Steeeam
                    </p>
                </div>
            </div>
        </React.Fragment>
    )
}