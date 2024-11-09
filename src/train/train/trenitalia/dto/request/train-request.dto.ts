import { IsInt, IsString, IsDateString, IsObject } from 'class-validator';
import { CriteriaDto } from './criteria.dto';
import { AdvancedSearchRequestDto } from './advanced-search-request.dto';

export class TrainRequestDto {
    @IsInt()
    departureLocationId: number;

    @IsInt()
    arrivalLocationId: number;

    @IsDateString()
    departureTime: string;

    @IsInt()
    adults: number;

    @IsInt()
    children: number;

    @IsObject()
    criteria: CriteriaDto;

    @IsObject()
    advancedSearchRequest: AdvancedSearchRequestDto;
}
