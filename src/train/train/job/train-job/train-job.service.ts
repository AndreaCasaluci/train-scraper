import { Inject, Injectable, Logger } from '@nestjs/common';
import { TrenitaliaService } from "../../trenitalia/trenitalia.service";
import { IMailService } from "../../../../interfaces/mail.interface";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TrainRequestDto } from "../../trenitalia/dto/request/train-request.dto";
import { TrainApiResponse, TicketSolution } from "../../trenitalia/dto/response/train-journey.model";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TrainJobService {
    private readonly logger = new Logger(TrainJobService.name);

    // Cache to track notifications per user per date
    private sentNotificationsCache: Map<string, Set<string>> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly trenitaliaService: TrenitaliaService,
        @Inject('IMailService') private readonly mailService: IMailService
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleTrainJob() {
        this.logger.log('Train job started.');

        const datesToCheck = this.getDatesToCheck();
        const trainCategories = this.getTrainCategories();
        const denominations = this.getDenominations();
        const emailRecipients = this.getEmailRecipients();

        if (!datesToCheck.length || !trainCategories.length || !denominations.length || !emailRecipients.length) {
            this.logger.warn('Missing configuration data.');
            return;
        }

        for (const recipient of emailRecipients) {
            let emailContent = this.generateEmailHeader();
            let hasNewContent = false;

            // Create personalized content for each user
            for (const date of datesToCheck) {
                try {
                    const matchingTrains = await this.fetchAndFilterTrains(date, trainCategories, denominations);
                    const newTrains = this.getNewTrainsForUser(recipient, date, matchingTrains);

                    // Only add to content if there are new trains
                    if (newTrains.length > 0) {
                        emailContent += this.generateEmailContent(newTrains, date);
                        this.updateSentNotificationsCache(recipient, date, newTrains);
                        hasNewContent = true;
                    }
                } catch (error) {
                    this.logger.error(`Error fetching data for date ${date}: `, error);
                }
            }

            // Send email if there is new content
            if (hasNewContent) {
                emailContent += this.generateEmailFooter();
                await this.sendEmail(recipient, 'Available Trains Found', emailContent);
            } else {
                this.logger.log(`No new trains found for recipient: ${recipient}`);
            }
        }

        this.logger.log('Train job completed.');
    }


    // Helper methods to get configuration values
    private getDatesToCheck(): string[] {
        return this.configService.get<string>('DATES_TO_CHECK', '').split(',').map(date => date.trim());
    }

    private getTrainCategories(): string[] {
        return this.configService.get<string>('TRAIN_CATEGORIES', '').split(',').map(category => category.trim());
    }

    private getDenominations(): string[] {
        return this.configService.get<string>('DENOMINATIONS', '').split(',').map(denom => denom.trim());
    }

    private getEmailRecipients(): string[] {
        return this.configService.get<string>('EMAIL_RECIPIENTS', '').split(',').map(email => email.trim());
    }

    // Fetch and filter trains
    private async fetchAndFilterTrains(date: string, trainCategories: string[], denominations: string[]): Promise<TicketSolution[]> {
        const trainRequest: TrainRequestDto = this.buildTrainRequest(date);
        const response: TrainApiResponse = await this.trenitaliaService.getTrainSolutions(trainRequest);
        return this.filterTrains(response.solutions, trainCategories, denominations);
    }

    private buildTrainRequest(date: string): TrainRequestDto {
        return {
            departureLocationId: this.configService.get<number>('DEPARTURE_LOCATION_ID') || 830000219,
            arrivalLocationId: this.configService.get<number>('ARRIVAL_LOCATION_ID') || 830011145,
            departureTime: date,
            adults: 1,
            children: 0,
            criteria: {
                frecceOnly: false,
                noChanges: true,
                order: 'DEPARTURE_DATE',
                regionalOnly: false,
                intercityOnly: false,
                tourismOnly: false,
                offset:0,
                limit: 100
            },
            advancedSearchRequest: {
                bestFare: false,
                bikeFilter: false
            }
        };
    }

    private filterTrains(solutions: TicketSolution[], trainCategories: string[], denominations: string[]): TicketSolution[] {
        return solutions.filter(solution =>
            solution.solution.trains.some(train =>
                trainCategories.includes(train.trainCategory) || denominations.includes(train.denomination)
            )
        );
    }


    private getNewTrainsForUser(recipient: string, date: string, trains: TicketSolution[]): TicketSolution[] {
        const cacheKey = `${recipient}-${date}`;
        const notifiedTrains = this.sentNotificationsCache.get(cacheKey) || new Set<string>();
        return trains.filter(train => !notifiedTrains.has(train.solution.trains[0].name));
    }

    // Update cache with new notifications
    private updateSentNotificationsCache(recipient: string, date: string, newTrains: TicketSolution[]) {
        const cacheKey = `${recipient}-${date}`;
        if (!this.sentNotificationsCache.has(cacheKey)) {
            this.sentNotificationsCache.set(cacheKey, new Set());
        }
        const notifiedTrains = this.sentNotificationsCache.get(cacheKey)!;
        newTrains.forEach(train => notifiedTrains.add(train.solution.trains[0].name));
    }

    private generateEmailHeader(): string {
        return `<html><body><h2>New Train Availability</h2><p>Here are new trains found:</p>`;
    }

    private generateEmailFooter(): string {
        return `<p>End of list.</p></body></html>`;
    }

    private generateEmailContent(trains: TicketSolution[], date: string): string {
        let content = `<h3>For Date: ${date}</h3>`;
        trains.forEach(train => {
            content += `<p>Train ID: ${train.solution.id}, Origin: ${train.solution.origin}, Price: ${train.solution.price?.amount || 'N/A'}</p>`;
        });
        return content;
    }

    private async sendEmail(recipient: string, subject: string, content: string) {
        try {
            await this.mailService.sendMail(recipient, subject, '', content);
            this.logger.log(`Email sent to: ${recipient}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${recipient}: ${error.message}`);
        }
    }
}
