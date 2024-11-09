import { Injectable } from '@nestjs/common';
import {IMailService} from "../interfaces/mail.interface";

@Injectable()
export class MailService implements IMailService {
    async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
        console.log(`Sending mail to ${to} with subject ${subject} and text ${text}`)
    }
}
