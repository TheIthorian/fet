import { test } from '@japa/runner';

test('gets api health', async ({ client }) => {
    const response = await client.get('/api/health');

    response.assertStatus(200);
    response.assertTextIncludes('ok');
});
