import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NodemailerMailService } from './impl/nodemailer-mail.service';
import { IMailService } from "../interfaces/mail.interface";
import { MailController } from './mail.controller';

@Module({
  providers: [
      {
          provide: 'IMailService',
          useClass: NodemailerMailService
      }
  ],
  exports: ['IMailService'],
  controllers: [MailController]
})
export class MailModule {}
