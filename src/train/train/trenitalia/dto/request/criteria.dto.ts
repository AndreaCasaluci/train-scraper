import { IsBoolean, IsString, IsOptional, IsInt } from 'class-validator';

export class CriteriaDto {
    @IsBoolean()
    frecceOnly: boolean;

    @IsBoolean()
    regionalOnly: boolean;

    @IsBoolean()
    intercityOnly: boolean;

    @IsBoolean()
    tourismOnly: boolean;

    @IsBoolean()
    noChanges: boolean;

    @IsString()
    order: string;

    @IsInt()
    offset: number;

    @IsInt()
    limit: number;
}
