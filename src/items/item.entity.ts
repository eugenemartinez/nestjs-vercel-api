import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Import ApiProperty

@Entity('items') // Specifies the table name
export class Item {
  @ApiProperty({ description: 'The unique identifier of the item', example: 1 })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    description: 'The name of the item',
    example: 'My Awesome Item',
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: 'An optional description for the item',
    example: 'This item is truly awesome.',
    required: false, // Indicates it's optional
    nullable: true, // Indicates it can be null in the database/response
  })
  @Column({ nullable: true })
  description?: string;
}
