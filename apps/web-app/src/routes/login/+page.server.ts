import { StatusCodeError, request } from '$lib/server/http-client.js';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ cookies, request }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email) {
            return fail(400, { email, missing: true });
        }

        if (!password) {
            return fail(400, { email, missing: true });
        }

        let data;
        try {
            ({ data } = await login({ email, password }));
        } catch (error) {
            console.log((error as StatusCodeError).error);
            return fail(400, { email, incorrect: true });
        }

        cookies.set('token', data.token);
        throw redirect(303, '/dashboard');
    },
};

async function login({ email, password }: { email: string; password: string }) {
    console.log({ email, password });
    const response = await request('http://127.0.0.1:3333/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'content-type': 'application/json' },
    });

    const body = await response.json();
    return body;
}
