import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
                <Link href={'/'} className='z-50'>
                    <div className='flex justify-center items-center w-[30px] h-[30px] bg-pop text-white dark:text-black rounded-md cursor-pointer hover:opacity-[.8]'>
                        <TiArrowBack fontSize={22} />
                    </div>
                </Link>

                <div className='absolute flex justify-center items-center gap-1 w-full select-none flex-grow'>
                    <Link href={'/'} className='flex justify-center items-center gap-1'>
                        <Image src={resolvedTheme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'} width={30} height={30} alt='steeeam logo' />
                        <p className={`${Engrain.className} text-lg text-black dark:text-white font-medium`}>
                            Steeeam
                        </p>
                    </Link>
                </div>
            </div>
        </React.Fragment>
    )
}