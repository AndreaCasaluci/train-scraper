import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import { MailModule } from './mail/mail.module';
import { HttpModule } from './http/http.module';
import {TrenitaliaModule} from "./train/train/trenitalia/trenitalia.module";
import {ScheduleModule} from "@nestjs/schedule";
import {TrainJobModule} from "./train/train/job/train-job/train-job.module";

@Module({
  imports: [
      ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true
      }),
      ScheduleModule.forRoot(),
      MailModule,
      HttpModule,
      TrenitaliaModule,
      TrainJobModule,
  ],
})
export class AppModule {}
