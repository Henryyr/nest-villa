import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class WelcomeController {
  @Get('*')
  getWelcome(@Res() res: Response) {
    return res.json({
      message: 'Welcome to Nest Villa API',
      version: process.env.APP_VERSION,
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: 'Check /api/doc for available endpoints'
    });
  }
} 