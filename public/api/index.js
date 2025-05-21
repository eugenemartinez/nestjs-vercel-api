"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const swagger_1 = require("@nestjs/swagger");
let expressApp;
let isNestAppReady = false;
async function ensureNestAppIsReady() {
    if (!isNestAppReady) {
        console.log('NestJS application is not ready. Bootstrapping for Vercel...');
        const newExpressApp = (0, express_1.default)();
        const nestAppInstance = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(newExpressApp));
        nestAppInstance.enableCors();
        const config = new swagger_1.DocumentBuilder()
            .setTitle('NestJS Experiment API (Deployed)')
            .setDescription('The NestJS Experiment API description for Vercel deployment')
            .setVersion('1.0')
            .addTag('items')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(nestAppInstance, config);
        swagger_1.SwaggerModule.setup('api-docs', nestAppInstance, document);
        await nestAppInstance.init();
        expressApp = newExpressApp;
        isNestAppReady = true;
        console.log('NestJS application bootstrapped and ready for Vercel, with Swagger UI at /api-docs.');
    }
}
exports.default = async (req, res) => {
    try {
        await ensureNestAppIsReady();
        if (expressApp) {
            expressApp(req, res);
        }
        else {
            console.error('NestJS Express app instance is not available in Vercel handler.');
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error: Application not initialized.');
        }
    }
    catch (error) {
        console.error('Error in Vercel handler for NestJS:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};
//# sourceMappingURL=index.js.map