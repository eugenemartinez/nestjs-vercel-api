import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; // Adjust path if your app.module.ts is elsewhere
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express'; // Add this line for default import

// Create an Express app instance
const server = express(); // This should now work correctly

// Function to bootstrap the NestJS application
export async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server), // Use the Express adapter with our server instance
  );
  app.enableCors(); // Enable CORS if needed
  // If you have a global prefix in your main.ts (e.g., app.setGlobalPrefix('api')),
  // you might need to set it here as well, or adjust routing in vercel.json accordingly.
  // Example: app.setGlobalPrefix('api');
  await app.init();
}

// Bootstrap the app and export the server
// Vercel will call this default export with (req, res)
let appBootstrapped = false;

export default async (req: express.Request, res: express.Response) => {
  if (!appBootstrapped) {
    await bootstrap();
    appBootstrapped = true;
  }
  server(req, res); // Forward requests to the Express server
};
