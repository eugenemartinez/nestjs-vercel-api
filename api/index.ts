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

let expressApp: express.Express;
let isNestAppReady = false;

async function ensureNestAppIsReady() {
  if (!isNestAppReady) {
    console.log('NestJS application is not ready. Bootstrapping for Vercel...');
    const newExpressApp = express();
    const nestAppInstance: INestApplication = await NestFactory.create(
      AppModule,
      new ExpressAdapter(newExpressApp),
    );

    nestAppInstance.enableCors();
    // If you have a global prefix in your main.ts (e.g., app.setGlobalPrefix('api')),
    // you might need to set it here as well for consistency in Vercel.
    // Example: nestAppInstance.setGlobalPrefix('api');

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

    SwaggerModule.setup('api-docs', nestAppInstance, document, customOptions);
    // --- End of CDN Setup ---

    await nestAppInstance.init();

    expressApp = newExpressApp;
    isNestAppReady = true;
    console.log(
      'NestJS application bootstrapped and ready for Vercel, with Swagger UI (CDN CSS) at /api-docs.',
    );
  }
}

export default async (req: express.Request, res: express.Response) => {
  try {
    await ensureNestAppIsReady();

    if (expressApp) {
      expressApp(req, res);
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
