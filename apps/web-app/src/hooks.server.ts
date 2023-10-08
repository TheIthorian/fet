import { request } from '$lib/server/http-client';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    console.log('loading page ' + event.url);

    if (event.route.id?.startsWith('/login')) {
        return await resolve(event, {});
    }

    const token = event.cookies.get('token');
    console.log({ token });

    if (!token) {
        console.log('no token. redirecting');
        event.cookies.delete('token');
        throw redirect(303, '/login');
    }

    const userDetails = await getUserDetails({ token }).catch((error) => {
        console.error(error);
        console.log('invalid token. redirecting');
        event.cookies.delete('token');
        throw redirect(303, '/login');
    });

    console.log(userDetails);

    return await resolve(event, {});
}

async function getUserDetails({ token }: { token: string }) {
    const response = await request('http://127.0.0.1:3333/api/me', {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
    });

    const body = await response.json();
    return body;
}
