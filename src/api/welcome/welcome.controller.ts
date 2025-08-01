import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class WelcomeController {
  @Get()
  getWelcome(@Res() res: Response) {
    return res.json({
      message: 'Welcome to Nest Villa API',
      version: process.env.APP_VERSION || '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: 'Check /api/doc for available endpoints'
    });
  }

  @Get('health')
  getHealth(@Res() res: Response) {
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
} 