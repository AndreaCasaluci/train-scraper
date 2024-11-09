import { Injectable } from '@nestjs/common';
import {IMailService} from "../../interfaces/mail.interface";
import { createTransport } from "nodemailer";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class NodemailerMailService implements IMailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            }
        });
    }

    async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
        await this.transporter.sendMail({
            from: `"Train Scraper" <${this.configService.get<string>('EMAIL_USER')}>`,
            to,
            subject,
            text,
            html,
        });
    }
}
