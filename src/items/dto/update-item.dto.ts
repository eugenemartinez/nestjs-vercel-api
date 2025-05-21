import { ApiProperty } from '@nestjs/swagger';
// import { IsString, IsOptional } from 'class-validator';

export class UpdateItemDto {
  @ApiProperty({
    description: 'The new name of the item (optional)',
    example: 'Updated Gadget Name',
    required: false,
  })
  // @IsOptional()
  // @IsString()
  name?: string;

  @ApiProperty({
    description: 'The new description for the item (optional)',
    example: 'An updated description.',
    required: false,
    nullable: true,
  })
  // @IsOptional()
  // @IsString()
  description?: string;
}
