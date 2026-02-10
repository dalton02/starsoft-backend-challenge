import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: 'Número da página',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Itens por página',
    default: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  limit: number = 10;
}

export class PaginatedResponseFactory<T> {
  @ApiProperty({ example: 20 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 2 })
  totalPages: number;

  @ApiProperty()
  data: T[];

  constructor({
    data,
    total,
    page,
    limit,
  }: {
    data: T[];
    total: number;
    page: number;
    limit: number;
    query?: Record<string, string | number>;
  }) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.data = data;
  }
}
