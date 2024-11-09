import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {TrainRequestDto} from "./dto/request/train-request.dto";
import {AxiosRequestConfig} from "axios";
import {HttpService} from "../../../http/http.service";
import {TrainApiResponse} from "./dto/response/train-journey.model";

@Injectable()
export class TrenitaliaService {
    private readonly apiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.apiUrl = this.configService.get<string>('TRENITALIA_API_URL');
    }

    async getTrainSolutions(data: TrainRequestDto): Promise<TrainApiResponse> {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
        };

        try {
            return await this.httpService.post<TrainApiResponse>(this.apiUrl, data, TrainApiResponse, config);
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error fetching train solutions',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
