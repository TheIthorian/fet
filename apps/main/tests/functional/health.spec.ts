import { test } from '@japa/runner';

test('display welcome page', async ({ client }) => {
    const response = await client.get('/api/health');

    response.assertStatus(200);
    response.assertTextIncludes('ok');
});
