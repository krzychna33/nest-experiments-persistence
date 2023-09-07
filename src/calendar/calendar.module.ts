import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleCalendarApiTokenEntity } from './entities/google-calendar-api-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleCalendarApiTokenEntity])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
