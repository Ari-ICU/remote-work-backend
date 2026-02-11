import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'https:'],
        scriptSrc: [`'self'`, `'unsafe-inline'`, `https:`, `http:`],
      },
    },
  }));

  app.use(cookieParser());

  // Enable CORS
  const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:3000';
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173', // Default Vite port
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Freelance Platform API')
    .setDescription('AI-powered freelance platform API documentation and testing tools')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('jobs', 'Job postings')
    .addTag('applications', 'Job applications')
    .addTag('payments', 'Payment processing')
    .addTag('messaging', 'Real-time messaging')
    .addTag('ai', 'AI/ML features')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Backend API running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
