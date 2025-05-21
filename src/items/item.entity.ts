import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('items') // Specifies the table name
export class Item {
  @PrimaryGeneratedColumn()
  id!: number; // Add !

  @Column()
  name!: string; // Add !

  @Column({ nullable: true })
  description?: string; // Or use ? if it can truly be undefined in your code, or ! if TypeORM always sets it (even to null)
}
