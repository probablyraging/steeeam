import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Profile from '@/components/Profile';

export default function index() {
    const router = useRouter();
    const { uid } = router.query;

    return (
        <Layout>
            <Profile uid={uid} />
        </Layout>
    )
}