import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class Health {
  public static health(_req: Request, res: Response): void {
    res.status(StatusCodes.OK).send('API Gateway service is health and OK.');
  }
}