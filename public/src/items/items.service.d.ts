import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
export declare class ItemsService {
    private itemsRepository;
    constructor(itemsRepository: Repository<Item>);
    findAll(): Promise<Item[]>;
    findOne(id: number): Promise<Item>;
    create(createItemDto: CreateItemDto): Promise<Item>;
    update(id: number, updateItemDto: UpdateItemDto): Promise<Item>;
    remove(id: number): Promise<void>;
}
