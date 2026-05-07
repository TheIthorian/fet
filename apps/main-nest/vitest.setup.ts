import 'reflect-metadata';

process.env.MONGODB_URI ??= 'mongodb://localhost:27017/fet-test';
process.env.JWT_SECRET ??= 'test-secret';
process.env.INTERNAL_KEY ??= 'test-internal-key';
process.env.JOURNEY_SERVICE_URL ??= 'http://localhost:3010';
process.env.PROXY_URL ??= 'http://localhost:3000';
