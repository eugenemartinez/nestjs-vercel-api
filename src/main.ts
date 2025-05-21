import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS Experiment API')
    .setDescription('The NestJS Experiment API description')
    .setVersion('1.0')
    .addTag('items') // Example tag, you can add more for different resources
    // .addBearerAuth() // Uncomment if you use Bearer token authentication
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // This sets up the UI at /api-docs

  await app.listen(process.env.PORT ?? 3000);
}

// Handle the promise returned by bootstrap
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
