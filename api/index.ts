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

    const config = new DocumentBuilder()
      .setTitle('NestJS Experiment API (Deployed)')
      .setDescription(
        'The NestJS Experiment API description for Vercel deployment',
      )
      .setVersion('1.0')
      .addTag('items')
      .build();
    const document = SwaggerModule.createDocument(nestAppInstance, config);

    // --- Use Custom Local CSS served from Vercel's public directory ---
    const customOptions: SwaggerCustomOptions = {
      // This URL points to where Vercel will serve your static CSS file
      // from the 'public/css/custom-swagger.css' path in your project.
      customCssUrl: '/css/custom-swagger.css',
      // You can also customize other aspects:
      // customSiteTitle: 'My Custom API Documentation',
      // customfavIcon: '/my-favicon.ico', // If you have a favicon in public/
    };

    SwaggerModule.setup('api-docs', nestAppInstance, document, customOptions);
    // --- End of Custom Local CSS Setup ---

    await nestAppInstance.init();

    expressApp = newExpressApp;
    isNestAppReady = true;
    console.log(
      'NestJS application bootstrapped for Vercel. Swagger UI (custom local CSS) at /api-docs.',
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
