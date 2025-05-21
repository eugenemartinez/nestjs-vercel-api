import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

// DTOs (Data Transfer Objects)
// export class CreateItemDto {
//   @ApiProperty({
//     description: 'The name of the item',
//     example: 'New Gadget',
//     required: true,
//   })
//   name!: string;

//   @ApiProperty({
//     description: 'An optional description for the item',
//     example: 'A very useful new gadget.',
//     required: false,
//     nullable: true,
//   })
//   description?: string;
// }

// export class UpdateItemDto {
//   @ApiProperty({
//     description: 'The new name of the item (optional)',
//     example: 'Updated Gadget Name',
//     required: false, // For PUT, often all fields are optional, or you might use a PatchDto
//   })
//   name?: string;

//   @ApiProperty({
//     description: 'The new description for the item (optional)',
//     example: 'An updated description.',
//     required: false,
//     nullable: true,
//   })
//   description?: string;
// }

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find();
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  create(createItemDto: CreateItemDto): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemDto);
    return this.itemsRepository.save(newItem);
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepository.preload({
      id: id,
      ...updateItemDto,
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return this.itemsRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const result = await this.itemsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
  }
}
