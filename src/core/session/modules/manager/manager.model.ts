import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export namespace ManagerSessionModel {
  export namespace Request {
    export class CreateSession {
      @ApiProperty({ description: 'Movie name', example: 'Homem Aranha 2' })
      @IsNotEmpty()
      @IsString()
      movie: string;

      @ApiProperty({ description: 'Room name', example: 'Sala A06' })
      @IsNotEmpty()
      @IsString()
      room: string;

      @ApiProperty({ example: ['A12', 'B12'] })
      @IsArray()
      @IsString({ each: true })
      @IsNotEmpty({ each: true })
      @Transform((d) => Array.from(new Set(d.value)))
      placements: string[];

      @ApiProperty({ description: 'In cents' })
      @IsNumber()
      price: number;

      @ApiProperty({ example: new Date().toISOString() })
      @IsDateString()
      showtime: Date;

      @ApiProperty({ description: 'In minutes' })
      @IsNumber()
      duration: number;
    }
  }
}
