import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger
import { INestApplication } from '@nestjs/common'; // For typing nestAppInstance

// This will hold the initialized NestJS application instance (via its Express adapter)
let expressApp: express.Express;
let isNestAppReady = false;

// This function creates and initializes the NestJS application.
async function ensureNestAppIsReady() {
  if (!isNestAppReady) {
    console.log('NestJS application is not ready. Bootstrapping for Vercel...');
    const newExpressApp = express(); // Create a new Express app instance
    const nestAppInstance: INestApplication = await NestFactory.create(
      // Add INestApplication type
      AppModule,
      new ExpressAdapter(newExpressApp), // Use the Express adapter
    );

    nestAppInstance.enableCors(); // Enable CORS if needed
    // If you have a global prefix in your main.ts (e.g., app.setGlobalPrefix('api')),
    // you might need to set it here as well for consistency in Vercel.
    // Example: nestAppInstance.setGlobalPrefix('api');

    // --- Add Swagger Setup for Vercel Context ---
    const config = new DocumentBuilder()
      .setTitle('NestJS Experiment API (Deployed)')
      .setDescription(
        'The NestJS Experiment API description for Vercel deployment',
      )
      .setVersion('1.0')
      .addTag('items')
      .build();
    const document = SwaggerModule.createDocument(nestAppInstance, config);
    SwaggerModule.setup('api-docs', nestAppInstance, document); // Setup Swagger on THIS instance
    // --- End of Swagger Setup for Vercel Context ---

    await nestAppInstance.init(); // Initialize the NestJS application

    expressApp = newExpressApp; // Assign the configured Express app
    isNestAppReady = true;
    console.log(
      'NestJS application bootstrapped and ready for Vercel, with Swagger UI at /api-docs.',
    );
  }
}

// --- Vercel Serverless Function Handler ---
export default async (req: express.Request, res: express.Response) => {
  try {
    await ensureNestAppIsReady(); // Ensure NestJS app is initialized

    if (expressApp) {
      expressApp(req, res); // Forward requests to the Express server (which NestJS uses)
    } else {
      console.error(
        'NestJS Express app instance is not available in Vercel handler.',
      );
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Application not initialized.');
    }
  } catch (error) {
    console.error('Error in Vercel handler for NestJS:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
};
