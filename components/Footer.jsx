import React from 'react';
import ThemeSwitch from './theme/ThemeSwitch';

export default function Footer() {
    return (
        <React.Fragment>
            <div className='flex justify-center items-center flex-col gap-2 w-full h-[100px] border-t border-light-border'>
                <div>
                    <p className='text-xs'>
                        Copyright © {new Date().getFullYear()} ProbablyRaging.
                    </p>
                </div>
                <ThemeSwitch />
            </div>
        </React.Fragment>
    )
}