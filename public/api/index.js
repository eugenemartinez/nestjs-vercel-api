"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const swagger_1 = require("@nestjs/swagger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let expressApp;
let isNestAppReady = false;
async function ensureNestAppIsReady() {
    if (!isNestAppReady) {
        console.log('NestJS application is not ready. Bootstrapping for Vercel...');
        const newExpressApp = (0, express_1.default)();
        const nestAppInstance = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(newExpressApp));
        nestAppInstance.enableCors();
        try {
            const swaggerUiDist = require('swagger-ui-dist');
            if (!swaggerUiDist ||
                typeof swaggerUiDist.getAbsoluteFSPath !== 'function') {
                console.error('[Vercel Swagger Debug] swagger-ui-dist package not found or is invalid!');
            }
            else {
                const uiPath = swaggerUiDist.getAbsoluteFSPath();
                console.log('[Vercel Swagger Debug] Swagger UI absolute path from swagger-ui-dist:', uiPath);
                try {
                    if (fs.existsSync(uiPath)) {
                        const files = fs.readdirSync(uiPath);
                        console.log('[Vercel Swagger Debug] Files in UI path (sample):', files.slice(0, 10));
                        const cssFilePath = path.join(uiPath, 'swagger-ui.css');
                        const cssFileExists = fs.existsSync(cssFilePath);
                        console.log(`[Vercel Swagger Debug] Does swagger-ui.css exist at ${cssFilePath}? ${cssFileExists}`);
                    }
                    else {
                        console.log('[Vercel Swagger Debug] UI path does not exist or fs.existsSync is false.');
                    }
                }
                catch (fsError) {
                    let errorMessage = 'Unknown FS error';
                    if (fsError instanceof Error) {
                        errorMessage = fsError.message;
                    }
                    console.error('[Vercel Swagger Debug] Error listing files in UI path:', errorMessage);
                }
            }
        }
        catch (e) {
            let errorMessage = 'Unknown error';
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            else if (typeof e === 'string') {
                errorMessage = e;
            }
            console.error('[Vercel Swagger Debug] Error inspecting swagger-ui-dist:', errorMessage);
        }
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