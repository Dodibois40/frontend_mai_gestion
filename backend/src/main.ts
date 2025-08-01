import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BigIntTransformInterceptor } from './common/interceptors/bigint-transform.interceptor';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Debug Railway environment variables
  console.log('🚀 Starting application...');
  console.log('📊 Environment Variables Debug:', {
    totalVars: Object.keys(process.env).length,
    railwayVars: Object.keys(process.env).filter(k => k.startsWith('RAILWAY')).map(k => k),
    customVars: Object.keys(process.env).filter(k => ['JWT_SECRET', 'DATABASE_URL', 'NODE_ENV', 'PORT'].includes(k)).map(k => `${k}=${process.env[k]?.substring(0, 20) || 'undefined'}`),
    nodeVersion: process.version,
    platform: process.platform
  });
  
  // Configuration des variables d'environnement
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env' });
  }
  
  // Configuration globale pour sérialiser les BigInt en JSON
  (BigInt.prototype as any).toJSON = function() {
    return Number(this);
  };
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration pour les gros uploads d'images (base64)
  app.use(require('express').json({ limit: '100mb' }));
  app.use(require('express').urlencoded({ limit: '100mb', extended: true }));

  // Middleware global pour logger toutes les requêtes (PREMIER middleware)
  app.use((req: any, res: any, next: any) => {
    const timestamp = new Date().toISOString();
    console.log(`🌐 [${timestamp}] ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('📦 Body:', JSON.stringify(req.body, null, 2));
      console.log('🔧 Headers:', JSON.stringify(req.headers, null, 2));
    }
    next();
  });
  
  // Configuration CORS améliorée pour Chrome
  app.enableCors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Permettre les requêtes sans origin (applications mobiles, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:8080',  // Port frontend configuré
        'http://localhost:8081',  // Port frontend alternatif
        'http://localhost:8082',  // Port frontend alternatif
        'http://localhost:8083',  // Port frontend alternatif
        'http://localhost:8084',  // Port frontend alternatif
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080',  // Port frontend configuré
        'http://127.0.0.1:8081',  // Port frontend alternatif
        'http://127.0.0.1:8082',  // Port frontend alternatif
        'http://127.0.0.1:8083',  // Port frontend alternatif
        'http://127.0.0.1:8084',  // Port frontend alternatif
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:4173',
        'http://localhost:4174',
        'https://mai-gestion.netlify.app',
        'https://mai-gestion-main.netlify.app',
        'https://crm.lamanufacturedubois.com',
        'https://api-crm.lamanufacturedubois.com',
        'https://lamanufacturedubois.com',
        'http://lamanufacturedubois.com',
        'https://www.lamanufacturedubois.com',
        'http://www.lamanufacturedubois.com'
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: Origin ${origin} non autorisée`);
        // En développement, on permet quand même (pour Chrome strict)
        if (process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Origin', 
      'X-Requested-With',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: ['Set-Cookie', 'Content-Disposition'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200 // Chrome préfère 200 à 204
  });

  // Middleware pour les en-têtes de sécurité Chrome
  app.use((req: any, res: any, next: any) => {
    // En-têtes de sécurité compatibles Chrome
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Gestion explicite des requêtes OPTIONS pour Chrome
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With,Cache-Control,Pragma');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // Cache preflight pour 24h
      return res.status(200).end();
    }
    
    next();
  });
  
  // Middleware de debug pour traquer les requêtes qui causent les 502
  app.use((req: any, res: any, next: any) => {
    console.log(`🔍 REQUÊTE REÇUE: ${req.method} ${req.url} - ${new Date().toISOString()}`);
    console.log(`🔍 User-Agent:`, req.headers['user-agent']?.substring(0, 50) || 'N/A');
    
    // Intercepter la fin de la réponse
    const originalSend = res.send;
    res.send = function(data: any) {
      console.log(`✅ RÉPONSE ENVOYÉE: ${req.method} ${req.url} - Status: ${res.statusCode}`);
      return originalSend.call(this, data);
    };
    
    next();
  });
  
  // Préfixe global pour toutes les routes API, sauf certaines exceptions
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/', '/setup-admin', '/debug-db']
  });

  // Validation des requêtes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true, // On commente cette ligne pour plus de souplesse
      transform: true,
    }),
  );

  // Intercepteur pour transformer les BigInt
  app.useGlobalInterceptors(new BigIntTransformInterceptor());
  
  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API Entreprise Organiser')
    .setDescription('API pour la gestion des affaires, achats et pointages')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Configuration statique temporairement désactivée pour débugger Railway
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Démarrage du serveur  
  const port = process.env.PORT || 8080;
  
  console.log(`🔄 Tentative de démarrage sur port: ${port}`);
  console.log(`🔄 Listening on interface: 0.0.0.0:${port}`);
  
  try {
    // Railway nécessite l'écoute sur toutes les interfaces (0.0.0.0)
    await app.listen(port, '0.0.0.0');
    
    console.log(`🚀 Application démarrée avec SUCCÈS sur le port: ${port}`);
    console.log(`📖 Documentation API disponible sur http://localhost:${port}/api/docs`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Railway PORT: ${process.env.PORT || 'not set'}`);
    console.log(`✅ App écoute sur toutes les interfaces (0.0.0.0:${port})`);
    
    // Log pour débugger Railway
    if (process.env.PORT) {
      console.log('✅ Using Railway assigned PORT:', process.env.PORT);
    } else {
      console.log('⚠️ No PORT env var found, using default:', port);
    }
    
    console.log('🎉 BACKEND PRÊT À RECEVOIR DES REQUÊTES !');
  } catch (error) {
    console.error('❌ ERREUR lors du démarrage du serveur:', error);
    throw error;
  }
}

bootstrap(); 