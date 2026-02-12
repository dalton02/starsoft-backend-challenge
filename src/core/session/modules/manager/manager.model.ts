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
import { AppErrorBadRequest } from 'src/utils/errors/app-errors';

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

      @ApiProperty({
        example: [
          'A1',
          'B1',
          'C1',
          'D1',
          'A2',
          'B2',
          'C2',
          'D2',
          'A3',
          'B3',
          'C3',
          'D3',
          'A4',
          'B4',
          'C4',
          'D4',
        ],
      })
      @IsArray()
      @IsString({ each: true })
      @IsNotEmpty({ each: true })
      @Transform((d) => {
        const data = Array.from(new Set(d.value));
        if (data.length < 16) {
          throw new AppErrorBadRequest(
            'Minimo de assentos na criação é 16 (evite inserir assentos duplicados)',
          );
        }
        return data;
      })
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
