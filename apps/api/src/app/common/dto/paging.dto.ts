import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';

import { SortDirection } from '../common.constants';

export class PagingQuery {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    readonly take?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    readonly skip?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    readonly search?: string;

    @ApiProperty({ enum: SortDirection, required: false })
    @IsOptional()
    @IsEnum(SortDirection)
    readonly sortDirection?: SortDirection;
}

export class PagingMeta {
    readonly count!: number;
    readonly totalCount!: number;
    readonly skip!: number;
}
