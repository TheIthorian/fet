import { schema, rules } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import EmailAlreadyExistsException from 'App/Exceptions/EmailAlreadyExistsException';

export default class AuthController {
    public async register({ request, response }: HttpContextContract) {
        // create validation schema for expected user form data
        const userSchema = schema.create({
            email: schema.string({ trim: true }),
            password: schema.string({}, [rules.minLength(8)]),
        });

        const data = await request.validate({ schema: userSchema });

        const hasExistingUser = await User.query()
            .select('id')
            .from('users')
            .where('email', data.email);

        if (hasExistingUser.length) {
            throw EmailAlreadyExistsException.new(data.email);
        }

        // create a user record with the validated data
        const user = await User.create({
            email: data.email,
            password: data.password,
            rememberMeToken: null,
            emailVerifiedInd: 5,
            status: 1,
        });

        response.json({ message: 'User registered successfully', user });
    }

    public async login({ request, response, auth }: HttpContextContract) {
        const loginSchema = schema.create({
            email: schema.string({ trim: true }),
            password: schema.string(),
        });

        const data = await request.validate({ schema: loginSchema });

        const { email, password } = data;

        const user = await auth.attempt(email, password, {
            expiresIn: '7days',
        });

        response.json({ message: 'User logged in successfully', data: user });
    }

    public async logout({ response, auth }: HttpContextContract) {
        await auth.logout();
        response.json({ message: 'User logged out successfully' });
    }

    public async me({ response, auth }: HttpContextContract) {
        await auth.use('api').authenticate();
        response.json({ data: auth.user });
    }
}
