import { test } from '@japa/runner';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import UserFactory from 'Database/factories/UserFactory';

test.group('POST /register', (group) => {
    let email: string;
    let password: string;

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(() => {
        email = 'test@user.spec.ts.register';
        password = 'password';
    });

    test('creates a new user', async ({ client }) => {
        const response = await client.post('/register').json({ email, password });

        response.assertStatus(200);
        response.assertBodyContains({
            message: 'User registered successfully',
            user: {
                id: Number,
                email,
                remember_me_token: null,
                status: 1,
                email_verified_ind: 5,
                create_at: Date,
                updated_at: Date,
            },
        });
    });

    test('does not create a new user when inputs are invalid', async ({ client }) => {
        password = 'sml'; // too small

        const response = await client.post('/register').json({ email, password });

        response.assertStatus(422);
        response.assertBody({
            errors: [
                {
                    args: { minLength: 8 },
                    field: 'password',
                    message: 'minLength validation failed',
                    rule: 'minLength',
                },
            ],
        });
    });

    test('does not create a new user if the email is already used', async ({ client }) => {
        await User.create(await UserFactory.merge({ email }).create());

        const response = await client.post('/register').json({ email, password });

        response.assertStatus(400);
        response.assertBody({
            message: `E_EMAIL_ALREADY_EXISTS: The email '${email}' already exists`,
            code: 'E_EMAIL_ALREADY_EXISTS',
        });
    });
});

test.group('POST /login', (group) => {
    let email: string;
    let password: string;

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(async () => {
        email = 'test@user.spec.ts.login';
        password = 'password';

        await User.create(await UserFactory.merge({ email, password }).create());
    });

    test('creates token when credentials are correct', async ({ client }) => {
        const response = await client.post('/login').json({ email, password });

        response.assertStatus(200);
        response.assertBodyContains({
            message: 'User logged in successfully',
            data: {
                type: 'bearer',
                token: String,
                expires_at: Date,
            },
        });
    });

    test('does not create a token when credentials are incorrect', async ({ client }) => {
        const response = await client.post('/login').json({ email, password: 'an incorrect password' });

        response.assertStatus(400);
        response.assertBodyContains({
            errors: [
                {
                    message: 'E_INVALID_AUTH_PASSWORD: Password mis-match',
                },
            ],
        });
    });
});
