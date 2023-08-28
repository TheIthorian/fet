import { test } from '@japa/runner';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';

test.group('POST /register', (group) => {
    let email: string;
    let password: string;

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(() => {
        email = 'tes@user.spec.ts';
        password = 'password';
    });

    test('creates a new user', async ({ client }) => {
        const response = await client.post('/register').json({
            email,
            password,
        });

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

        const response = await client.post('/register').json({
            email,
            password,
        });

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
        const user = await User.create({
            email,
            password,
            emailVerifiedInd: 5,
            status: 1,
        });

        const response = await client.post('/register').json({
            email,
            password,
        });

        response.assertStatus(422);
        response.assertBody({
            errors: [
                {
                    rule: 'unique',
                    field: 'email',
                    message: 'unique validation failure',
                },
            ],
        });
    });
});
