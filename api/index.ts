import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

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

    const config = new DocumentBuilder()
      .setTitle('NestJS Experiment API (Deployed)')
      .setDescription(
        'The NestJS Experiment API description for Vercel deployment',
      )
      .setVersion('1.0')
      .addTag('items')
      .build();
    const document = SwaggerModule.createDocument(nestAppInstance, config);

    // --- Use CDN for ALL Swagger UI Assets (CSS and JS) ---
    const customOptions: SwaggerCustomOptions = {
      customCssUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css', // Or your preferred CDN/version
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.js',
      ],
      // customfavIcon: 'https://your-cdn.com/favicon.png', // Optional: if you want a CDN favicon
      // customSiteTitle: 'My API Docs', // Optional
    };

    SwaggerModule.setup('api-docs', nestAppInstance, document, customOptions); // Pass customOptions
    // --- End of CDN Setup ---

    await nestAppInstance.init(); // Initialize the NestJS application

    expressApp = newExpressApp; // Assign the configured Express app
    isNestAppReady = true;
    console.log(
      'NestJS application bootstrapped and ready for Vercel, with Swagger UI (CDN Assets) at /api-docs.',
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
