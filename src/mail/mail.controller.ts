import {Controller, Get, Inject, Query} from '@nestjs/common';
import {IMailService} from "../interfaces/mail.interface";

@Controller('mail')
export class MailController {
    constructor(
        @Inject('IMailService') private readonly mailService: IMailService
    ) {}

    @Get('send')
    async sendMail(@Query('to') to: string) {
        await this.mailService.sendMail(to, 'Test Email', 'This is a test email');
        return {message: "Email sent"};
    }

}
