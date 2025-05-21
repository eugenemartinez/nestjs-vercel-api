import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto'; // Updated import
import { UpdateItemDto } from './dto/update-item.dto'; // Updated import
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('items') // Groups all endpoints in this controller under the 'items' tag
@Controller('items') // Base path for all routes in this controller will be /items
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiBody({ type: CreateItemDto, description: 'Data to create a new item' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The item has been successfully created.',
    type: Item,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input.',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createItemDto: CreateItemDto): Promise<Item> {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all items.',
    type: [Item],
  }) // Note: type is Item[]
  findAll(): Promise<Item[]> {
    return this.itemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the item to retrieve',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found item.',
    type: Item,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Item> {
    return this.itemsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an item by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the item to update',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateItemDto, description: 'Data to update the item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The item has been successfully updated.',
    type: Item,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<Item> {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the item to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The item has been successfully deleted.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item not found.' })
  @HttpCode(HttpStatus.NO_CONTENT) // Important for DELETE operations that return no body
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.itemsService.remove(id);
  }
}
