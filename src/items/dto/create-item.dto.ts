import { ApiProperty } from '@nestjs/swagger';
// You might also want to add class-validator decorators here
// import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'The name of the item',
    example: 'New Gadget',
    required: true,
  })
  // @IsNotEmpty()
  // @IsString()
  name!: string;

  @ApiProperty({
    description: 'An optional description for the item',
    example: 'A very useful new gadget.',
    required: false,
    nullable: true,
  })
  // @IsOptional()
  // @IsString()
  description?: string;
}
