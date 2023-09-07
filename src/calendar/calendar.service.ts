import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleCalendarApiTokenEntity } from './entities/google-calendar-api-token.entity';
import { And, IsNull, MoreThan, Not, Repository } from 'typeorm';
import { google } from 'googleapis';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(GoogleCalendarApiTokenEntity)
    private googleCalendarApiTokenRepository: Repository<GoogleCalendarApiTokenEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getGoogleAuthUrl(userId: string) {
    const googleOuath2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_API_CALENDAR_OAUTH2_CLIENT_ID'),
      this.configService.get('GOOGLE_API_CALENDAR_OAUTH2_CLIENT_SECRET'),
      `http://localhost:3000/calendar/google-auth-callback`,
    );

    const authorizationId = randomUUID();

    const newGoogleCalendarApiToken =
      this.googleCalendarApiTokenRepository.create({
        userId,
        authorizationId,
      });

    await this.googleCalendarApiTokenRepository.save(newGoogleCalendarApiToken);

    const authorizationUrl = googleOuath2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events.readonly'],
      state: authorizationId,
    });
    return {
      data: { authorizationUrl },
    };
  }

  async handleGoogleAuthCallback(code: string, authorizationId: string) {
    const googleOuath2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_API_CALENDAR_OAUTH2_CLIENT_ID'),
      this.configService.get('GOOGLE_API_CALENDAR_OAUTH2_CLIENT_SECRET'),
      `http://localhost:3000/calendar/google-auth-callback`,
    );

    const { tokens } = await googleOuath2Client.getToken(code);

    const newGoogleCalendarApiToken =
      await this.googleCalendarApiTokenRepository.findOneOrFail({
        where: { authorizationId },
      });

    newGoogleCalendarApiToken.access_token = tokens.access_token;
    newGoogleCalendarApiToken.refresh_token = tokens.refresh_token;
    newGoogleCalendarApiToken.id_token = tokens.id_token;
    newGoogleCalendarApiToken.scope = tokens.scope;
    newGoogleCalendarApiToken.token_type = tokens.token_type;
    newGoogleCalendarApiToken.expiry_date = tokens.expiry_date;

    await this.googleCalendarApiTokenRepository.save(newGoogleCalendarApiToken);
  }

  async getUserEvents(userId: string) {
    const userGoogleApiTokens =
      await this.googleCalendarApiTokenRepository.find({
        where: {
          userId,
          expiry_date: And(Not(IsNull()), MoreThan(new Date().getTime())),
        },
        order: { expiry_date: 'DESC' },
      });

    const googleOAuth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_API_CALENDAR_OAUTH2_CLIENT_ID'),
      this.configService.get('GOOGLE_API_CALENDAR_OAUTH2_CLIENT_SECRET'),
      `http://localhost:3000/calendar/google-auth-callback`,
    );

    if (!userGoogleApiTokens[0] || !userGoogleApiTokens[0].access_token) {
      throw new UnauthorizedException({
        message: 'Google Authorization required',
      });
    }

    googleOAuth2Client.setCredentials({ ...userGoogleApiTokens[0] });

    const calendar = google.calendar({
      version: 'v3',
      auth: googleOAuth2Client,
    });

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;

    return {
      data: {
        events: [...(events || [])],
      },
    };
  }
}
