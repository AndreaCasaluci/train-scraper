import { IsBoolean } from 'class-validator';

export class AdvancedSearchRequestDto {
    @IsBoolean()
    bestFare: boolean;

    @IsBoolean()
    bikeFilter: boolean;
}
