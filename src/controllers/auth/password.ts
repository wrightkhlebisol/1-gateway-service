import { authService } from '@gateway/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class Password {
  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.forgotPassword(req.body.email);
    res.status(StatusCodes.OK).json({ message: response.data.message });
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword, email } = req.body;
    const response: AxiosResponse = await authService.resetPassword(req.params.token, password, confirmPassword, email);
    res.status(StatusCodes.OK).json({ message: response.data.message });
  }

  public static async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    const response: AxiosResponse = await authService.changePassword(currentPassword, newPassword);
    res.status(StatusCodes.OK).json({ message: response.data.message });
  }
}