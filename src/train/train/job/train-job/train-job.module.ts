import { Module } from '@nestjs/common';
import { TrainJobService } from './train-job.service';
import {TrenitaliaModule} from "../../trenitalia/trenitalia.module";
import {MailModule} from "../../../../mail/mail.module";

@Module({
  imports: [
      TrenitaliaModule,
      MailModule
  ],
  providers: [TrainJobService]
})
export class TrainJobModule {}
