import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { IsNonNegativeInteger } from '@libs/common/validators';

import { SortDirection } from '../common.constants';

export class PagingQuery {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNonNegativeInteger()
    @Type(() => Number)
    readonly take?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNonNegativeInteger()
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
