import React from 'react';
import { useRouter } from 'next/router';
import { RxCross2 } from "react-icons/rx";

export default function Error({ error, setError }) {
    const router = useRouter();

    const handleClick = () => {
        router.back('/');
        setError(false);
    };

    return (
        <React.Fragment>
            <div className='flex justify-center items-center w-full h-full min-h-screen'>
                <div className='relative flex justify-center items-center flex-col gap-8 w-3/4 h-3/4 bg-base border border-light-border p-4 rounded-md md:w-1/2 md:h-1/2'>
                    <p className='text-4xl font-bold text-center'>Uh-oh!</p>
                    <p className='text-center'>{error}</p>

                    <div className='absolute top-0 right-0 p-1 m-4 cursor-pointer' onClick={handleClick}>
                        <RxCross2 fontSize={22} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}