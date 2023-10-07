'use client';

import { useRouter } from 'next/navigation';

export default function Page(): JSX.Element {
    const router = useRouter();
    router.push('/dashboard');

    return <>Index</>;
}
