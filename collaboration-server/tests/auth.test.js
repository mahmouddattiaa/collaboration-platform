const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.body.user.name).toBe('Test User');

        const user = await User.findOne({ email: 'test@example.com' });
        expect(user).not.toBeNull();
    });

    it('should login an existing user', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
    });

    it('should fail to login with wrong password', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toEqual(401);
    });

    it('should fail to login with non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'no-user@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(401);
    });


    it('should get the current user profile', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('test@example.com');
    });
});
