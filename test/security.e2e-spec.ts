import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';

describe('Security (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Mimic the actual main.ts configuration
        app.use(helmet());
        app.enableCors({
            origin: ['http://localhost:3000'],
            credentials: true,
        });
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Security Headers', () => {
        it('should have security headers (Helmet)', async () => {
            const response = await request(app.getHttpServer()).get('/');

            // X-Powered-By should be removed
            expect(response.headers['x-powered-by']).toBeUndefined();

            // Basic security headers
            expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['content-security-policy']).toBeDefined();
        });
    });

    describe('Authentication & Authorization', () => {
        it('should block unauthorized access to protected routes', async () => {
            // Trying to access getProfile without token
            return request(app.getHttpServer())
                .get('/users/profile/me')
                .expect(401);
        });
    });

    describe('Input Validation & Data Exposure', () => {
        it('should block requests with non-whitelisted properties', async () => {
            // Trying to register with extra fields
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                    hackerField: 'should-be-blocked'
                })
                .expect(400); // ValidationPipe with forbidNonWhitelisted: true
        });

        it('should block weak passwords', async () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'weak@example.com',
                    password: '123', // Too short and no complexity
                    firstName: 'Weak',
                    lastName: 'User',
                    role: 'FREELANCER'
                })
                .expect(400); // ValidationPipe with Matches/MinLength
        });

        it('should not return password in user responses', async () => {
            const email = `secure${Date.now()}@example.com`;
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email,
                    password: 'securePassword123!',
                    firstName: 'Secure',
                    lastName: 'User',
                    role: 'FREELANCER'
                })
                .expect(201);

            expect(response.body.user.password).toBeUndefined();
            expect(response.body.accessToken).toBeDefined();
        });
    });

    describe('CORS', () => {
        it('should allow requests from allowed origins', async () => {
            return request(app.getHttpServer())
                .get('/')
                .set('Origin', 'http://localhost:3000')
                .expect('Access-Control-Allow-Origin', 'http://localhost:3000');
        });

        it('should block requests from unauthorized origins', async () => {
            const response = await request(app.getHttpServer())
                .get('/')
                .set('Origin', 'http://malicious-site.com');

            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });
    });

    describe('Rate Limiting', () => {
        it('should eventually throttle many requests', async () => {
            // The register route has a throttle of 5 requests per 60s
            // In the e2e test environment, we might need to mock the Redis or use the default memory store
            for (let i = 0; i < 5; i++) {
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({ email: `test${i}@example.com`, password: 'password123', firstName: 'a', lastName: 'b', role: 'FREELANCER' });
            }

            // 6th request should be throttled
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'test5@example.com', password: 'password123', firstName: 'a', lastName: 'b', role: 'FREELANCER' })
                .expect(429);
        });
    });

    describe('Payload Size Limits', () => {
        it('should block requests larger than 1MB', async () => {
            const largeString = 'a'.repeat(1024 * 1024 + 100); // > 1MB
            return request(app.getHttpServer())
                .post('/auth/login') // Any endpoint
                .send({ email: 'test@example.com', password: largeString })
                .expect(413); // Payload Too Large
        });
    });
});
