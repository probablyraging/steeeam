import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Loader from './Loader';
import ProfileSummary from './profile/ProfileSummary';
import Error from './Error';
import Sidebar from './profile/Sidebar';
import { Divider } from '@nextui-org/react';
import Footer from './Footer';

export default function Profile({ uid }) {
    const router = useRouter();
    const countryCode = router.query.cc;
    const countryAbbr = router.query.abbr;
    const [isLoading, setIsLoading] = useState(false);
    const [userSummary, setUserSummary] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!uid) return;
        setIsLoading(true);
        async function fetchUserSummary() {
            const userSummaryResponse = await fetch(`/api/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ route: 'user-summary', uid: uid }),
            }).then(res => res.json());
            if (userSummaryResponse.error) return setError(userSummaryResponse.error);
            setUserSummary(userSummaryResponse);
            setIsLoading(false);
        }
        fetchUserSummary();
    }, [uid]);

    if (error) return <Error error={error} setError={setError} />;

    if (!uid || !userSummary) return <Loader />;

    return (
        <React.Fragment>
            <Head>
                <title>{userSummary.personaName} - Steeeam</title>
            </Head>

            <div className='bg-base'>
                <div className='max-w-[1300px] mx-auto'>
                    <div className='flex items-center flex-col lg:items-start lg:gap-10 p-4 lg:p-6'>
                        <Sidebar steamId={userSummary.steamId} userSummary={userSummary} />

                        <div className='relative w-full h-full min-h-screen lg:pl-[250px]'>
                            <Divider className='mt-5 mb-7 bg-light-border lg:m-0 lg:absolute lg:top-0 lg:left-[230px] lg:w-[1px] lg:h-full' />
                            <ProfileSummary steamId={userSummary.steamId} countryCode={countryCode} countryAbbr={countryAbbr} isLoading={isLoading} />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </React.Fragment>
    )
}