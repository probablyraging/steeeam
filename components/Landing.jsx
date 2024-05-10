import React from 'react';
import Image from 'next/image';
import SearchInput from './landing/SearchInput';
import Link from 'next/link';
import { BiCoffeeTogo } from 'react-icons/bi';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import localFont from 'next/font/local';
import Footer from './Footer';

const Engrain = localFont({ src: '../public/Elgraine-Black-Italic.ttf' });

export default function Landing() {
    const { resolvedTheme } = useTheme();

    return (
        <React.Fragment>
            <div className='min-h-screen'>
                <header className='h-[64px] bg-base'>
                    <nav className='flex justify-between items-center h-full px-6'>
                        <Link href={'/'}>
                            <div className='flex items-center gap-1 select-none'>
                                <Image src={resolvedTheme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'} width={30} height={30} alt='steeeam logo' />
                                <p className={`${Engrain.className} hidden text-lg text-black dark:text-white font-medium sm:block`}>
                                    Steeeam
                                </p>
                            </div>
                        </Link>

                        <div className='flex items-center gap-4'>
                            <Link href={'https://github.com/probablyraging'} target='_blank'>
                                <FaGithub fontSize={26} className='text-black dark:text-white hover:text-link dark:hover:text-link' />
                            </Link>
                            <Link href={'https://discord.com/users/438434841617367080'} target='_blank'>
                                <FaDiscord fontSize={26} className='text-black dark:text-white hover:text-link dark:hover:text-link' />
                            </Link>
                            <Link href={'https://buymeacoffee.com/probablyraging'} target='_blank'>
                                <BiCoffeeTogo fontSize={26} className='text-black dark:text-white hover:text-link dark:hover:text-link' />
                            </Link>
                        </div>
                    </nav>
                </header>

                <div className='flex justify-center items-stretch flex-col min-h-[calc(100vh-64px)]'>
                    <div className='flex justify-center items-center w-full bg-base flex-grow bg-image bg-cover bg-center'>
                        <SearchInput />
                    </div>

                    <Footer />
                </div>
            </div>
        </React.Fragment>
    )
}