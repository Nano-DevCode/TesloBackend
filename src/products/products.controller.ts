import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dtos';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiResponse({status: 201, description: 'Product was created' , type: Product})
  @ApiResponse({status: 400, description: 'Bad Request'})
  @ApiResponse({status: 403, description: 'Forbidden. Token related'})
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user:User
  ){
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOnePlain(id);
  }

  @Auth(ValidRoles.admin)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto,
    @GetUser() user:User
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Auth(ValidRoles.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
