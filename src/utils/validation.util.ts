import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationUtil {
    static async validateResponse<T extends object>(data: any, dto: new () => T): Promise<T> {

        const instance = plainToInstance(dto, data);

        const errors = await validate(instance);

        if (errors.length > 0) {
            throw new HttpException(
                {
                    message: 'Validation failed',
                    errors: errors.map((error) => ({
                        property: error.property,
                        constraints: error.constraints,
                    })),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return instance;
    }
}
