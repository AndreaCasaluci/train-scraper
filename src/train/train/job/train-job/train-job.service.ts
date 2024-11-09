import { Inject, Injectable, Logger } from '@nestjs/common';
import { TrenitaliaService } from "../../trenitalia/trenitalia.service";
import { IMailService } from "../../../../interfaces/mail.interface";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TrainRequestDto } from "../../trenitalia/dto/request/train-request.dto";
import {TrainApiResponse, TicketSolution, CO2Emission} from "../../trenitalia/dto/response/train-journey.model";
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
        return `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f9f9f9;
                        color: #333;
                    }
                    .container {
                        width: 90%;
                        max-width: 800px;
                        margin: 20px auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #4CAF50;
                    }
                    h3 {
                        margin-top: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Train Availability Notification</h2>
                    <p>Below are the latest available train journeys based on your request:</p>`;
    }

    private generateEmailFooter(): string {
        return `
                    <p style="text-align: center; color: #888; font-size: 12px;">
                        This is an automated message. Please do not reply directly to this email.
                    </p>
                </div>
            </body>
        </html>`;
    }

    private generateEmailContent(trains: TicketSolution[], date: string): string {
        let content = `<h3 style="color: #4CAF50;">Trains Available for ${date}</h3>`;
        trains.forEach((trainSolution) => {
            const journey = trainSolution.solution;
            const mainTrain = journey.trains[0]; // Assuming the first train provides the main info

            // Extract necessary information
            const origin = journey.origin;
            const destination = journey.destination;
            const departureTime = journey.departureTime;
            const arrivalTime = journey.arrivalTime;
            const duration = journey.duration;
            const price = journey.price?.amount ? `${journey.price.amount} ${journey.price.currency || ''}` : 'N/A';
            const trainName = mainTrain.name || 'Unnamed Train';
            const trainCategory = mainTrain.trainCategory || 'Unknown Category';
            const trainDescription = mainTrain.description || 'No Description Available';
            const co2EmissionInfo = this.generateCO2EmissionInfo(trainSolution.co2Emission);

            content += `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th colspan="2" style="padding: 10px; text-align: left; font-size: 1.2em;">Train: ${trainName} (${trainCategory})</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 10px;"><strong>Origin:</strong> ${origin}</td>
                        <td style="padding: 10px;"><strong>Destination:</strong> ${destination}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Departure Time:</strong> ${departureTime}</td>
                        <td style="padding: 10px;"><strong>Arrival Time:</strong> ${arrivalTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>Duration:</strong> ${duration}</td>
                        <td style="padding: 10px;"><strong>Price:</strong> ${price}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 10px;"><strong>Description:</strong> ${trainDescription}</td>
                    </tr>
                    ${co2EmissionInfo}
                </tbody>
            </table>`;
        });
        return content;
    }

    private generateCO2EmissionInfo(co2Emission: CO2Emission): string {
        if (!co2Emission || !co2Emission.vehicleDetails.length) return '';

        let content = `
        <tr style="background-color: #e8f5e9;">
            <td colspan="2" style="padding: 10px;">
                <strong>CO2 Emission Info:</strong>
                <ul style="margin: 0; padding-left: 20px;">`;

        co2Emission.vehicleDetails.forEach((detail) => {
            content += `<li>${detail.type}: ${detail.kgEmissions.toFixed(2)} kg CO2</li>`;
        });

        content += `
                </ul>
            </td>
        </tr>`;

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
