import http from 'http';

import { CustomError, IErrorResponse, winstonLogger } from '@wrightkhlebisol/jobber-shared';
import { config } from '@gateway/config';
import { Logger } from 'winston';
import cookieSession from 'cookie-session';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import { Application, NextFunction, json, urlencoded, Request, Response } from 'express';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import { elasticSearch } from '@gateway/elasticsearch';
import { appRoutes } from '@gateway/routes';

import { axiosAuthInstance } from './services/api/auth.service';

const SERVER_PORT = 4000;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug');

export class GatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware();
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer();
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 60 * 60 * 1000,
        secure: config.NODE_ENV !== 'development',
        // sameSite: 'none',
      }),
    );
    app.use(hpp());
    app.use(helmet());
    app.use(cors({
      origin: `${config.CLIENT_URL}`,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }));
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
      }
      next();
    });
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(): void {
    appRoutes(this.app);
  }

  private startElasticSearch(): void {
    elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullUrl: string = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.log('error', `Route not found: ${fullUrl}`);
      res.status(StatusCodes.NOT_FOUND).json({ message: 'Endpoint does not exist' });
      next();
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.log('error', `GatewayService: ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private startServer(): void {
    try {
      const httpServer = http.createServer(this.app);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.error('GatewayService: startServer() method error:', error);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    try {
      log.info(`GatewayService: Started on process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`GatewayService: Starting server on port ${SERVER_PORT}`);
      });
    } catch (error) {
      log.log('error', 'GatewayService: startHttpServer method error:', error);
    }
  }
}