import { Injectable } from '@nestjs/common';
import { HttpService as AxiosHttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, Observable } from 'rxjs';
import { ValidationUtil } from "../utils/validation.util";

@Injectable()
export class HttpService {
    constructor(private readonly httpService: AxiosHttpService) {}

    async get<T extends object>(url: string, dto: new () => T, config?: AxiosRequestConfig): Promise<T> {
        const response = await lastValueFrom(this.httpService.get(url, config));
        return ValidationUtil.validateResponse(response.data, dto);
    }

    async post<T extends object, D = any>(url: string, data?: D, dto?: new () => T, config?: AxiosRequestConfig): Promise<T> {
        const response = await lastValueFrom(this.httpService.post(url, data, config));
        return ValidationUtil.validateResponse(response.data, dto);
    }
}
