import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  CognitoAccessTokenCheckGuard,
  RequestWithUser,
} from '../auth/cognito-access-token-check.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly configService: ConfigService,
  ) {}

  @Get('events')
  @UseGuards(CognitoAccessTokenCheckGuard)
  async getUserEvents(@Req() request: RequestWithUser) {
    const getEventsResult = await this.calendarService.getUserEvents(
      request.user.id,
    );

    return getEventsResult;
  }

  @Get('google-auth-url')
  @UseGuards(CognitoAccessTokenCheckGuard)
  getGoogleAuthUrl(@Req() request: RequestWithUser) {
    return this.calendarService.getGoogleAuthUrl(request.user.id);
  }

  @Get('google-auth-callback')
  async handleGoogleAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('No code provided');
    }
    await this.calendarService.handleGoogleAuthCallback(code, state);
    return res.redirect(this.configService.get('FE_URL'));
  }
}
