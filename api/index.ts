import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger'; // Import SwaggerCustomOptions
import { INestApplication } from '@nestjs/common'; // For typing nestAppInstance
import * as fs from 'fs'; // Import fs at the top
import * as path from 'path'; // Import path for joining

// This will hold the initialized NestJS application instance (via its Express adapter)
let expressApp: express.Express;
let isNestAppReady = false;

// Define a simple interface for the swagger-ui-dist module
interface SwaggerUiDistModule {
  getAbsoluteFSPath: () => string;
}

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
    try {
      // We are using require here specifically for swagger-ui-dist as it's a common pattern
      // for this package to get the absolute path to its assets.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const swaggerUiDist = require('swagger-ui-dist') as SwaggerUiDistModule;
      if (
        !swaggerUiDist ||
        typeof swaggerUiDist.getAbsoluteFSPath !== 'function'
      ) {
        console.error(
          '[Vercel Swagger Debug] swagger-ui-dist package not found or is invalid!',
        );
      } else {
        const uiPath: string = swaggerUiDist.getAbsoluteFSPath();
        console.log(
          '[Vercel Swagger Debug] Swagger UI absolute path from swagger-ui-dist:',
          uiPath,
        );

        try {
          if (fs.existsSync(uiPath)) {
            const files = fs.readdirSync(uiPath);
            console.log(
              '[Vercel Swagger Debug] Files in UI path (sample):',
              files.slice(0, 10), // Log more files
            );
            const cssFilePath = path.join(uiPath, 'swagger-ui.css');
            const cssFileExists = fs.existsSync(cssFilePath);
            console.log(
              `[Vercel Swagger Debug] Does swagger-ui.css exist at ${cssFilePath}? ${cssFileExists}`,
            );
          } else {
            console.log(
              '[Vercel Swagger Debug] UI path does not exist or fs.existsSync is false.',
            );
          }
        } catch (fsError: unknown) {
          let errorMessage = 'Unknown FS error';
          if (fsError instanceof Error) {
            errorMessage = fsError.message;
          }
          console.error(
            '[Vercel Swagger Debug] Error listing files in UI path:',
            errorMessage,
          );
        }
      }
    } catch (e: unknown) {
      // Use unknown for better type safety
      let errorMessage = 'Unknown error';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      console.error(
        '[Vercel Swagger Debug] Error inspecting swagger-ui-dist:',
        errorMessage,
      );
    }

    const config = new DocumentBuilder()
      .setTitle('NestJS Experiment API (Deployed)')
      .setDescription(
        'The NestJS Experiment API description for Vercel deployment',
      )
      .setVersion('1.0')
      .addTag('items')
      .build();
    const document = SwaggerModule.createDocument(nestAppInstance, config);

    // --- Use CDN for Swagger CSS ---
    const customOptions: SwaggerCustomOptions = {
      customCssUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
      // Or: 'https://unpkg.com/swagger-ui-dist@latest/swagger-ui.css'
      // If JS assets also cause issues, you can add them here:
      // customJs: [
      //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.js',
      //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.js',
      // ],
    };

    SwaggerModule.setup('api-docs', nestAppInstance, document, customOptions); // Pass customOptions
    // --- End of CDN Setup ---

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
