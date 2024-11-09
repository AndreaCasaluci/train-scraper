export interface IMailService {
    sendMail(to: string, subject: string, text: string, html?: string): Promise<void>
}