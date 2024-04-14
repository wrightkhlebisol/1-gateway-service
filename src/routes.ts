import { healthRoutes } from '@gateway/routes/health';
import { Application } from 'express';

export const appRoutes = (app: Application) => {
  app.use(healthRoutes.routes());

};