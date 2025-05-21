import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

// DTOs (Data Transfer Objects) for request validation (optional but good practice)
export class CreateItemDto {
  name!: string; // Add !
  description?: string;
}

export class UpdateItemDto {
  name?: string;
  description?: string;
}

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
