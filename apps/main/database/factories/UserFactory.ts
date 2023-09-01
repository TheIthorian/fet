import User from 'App/Models/User';
import Factory from '@ioc:Adonis/Lucid/Factory';

export default Factory.define(User, ({ faker }) => {
    return {
        email: faker.internet.email(),
        password: faker.string.alphanumeric({ length: { min: 8, max: 20 } }),
        emailVerifiedInd: 6 as 6,
        status: 1 as 1,
    };
}).build();
