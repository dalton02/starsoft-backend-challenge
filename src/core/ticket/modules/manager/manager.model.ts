import { ApiProperty } from '@nestjs/swagger';

export namespace ManagerTicketModel {
  export class CreateSession {
    @ApiProperty({ description: 'Nome do filme' })
    movie: string;

    @ApiProperty({ example: ['A12', 'B12'] })
    placements: string[];

    @ApiProperty({ description: 'Em centavos' })
    price: number;

    @ApiProperty({})
    showtime: Date;

    @ApiProperty({ description: 'Em minutos' })
    duration: number;
  }
}
