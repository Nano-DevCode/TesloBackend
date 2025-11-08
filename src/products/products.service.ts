import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from '../common/dtos/pagination.dtos';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    try{

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) ),
        user,
      });

      await this.productRepository.save(product);

      const productWithUrls = {
        images: product.images?.map(img => `${process.env.HOST_API}/files/product/${img.url}`),
      };

      return {...product, productWithUrls};
      
    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    try{
      const {limit, offset} = paginationDto;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        }
      });
      return products.map(product => ({
        ...product,
        images: product.images?.map(img => `${process.env.HOST_API}/files/product/${img.url}`)
      }));
    }catch(error){
      this.handleDBExceptions(error);
    }
  }

  async findOne(term: string) {
    let product:Product|null = null;
    if(isUUID(term)){
      product = await this.productRepository.findOneBy({ id: term });
    }else{
      const queryBuilder = await this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('LOWER(title) = LOWER(:term)', { term })
        .orWhere('slug = :term', { term })
        .leftJoinAndSelect('product.images', 'productImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with id or slug "${term}" not found`);
    }

    return product;
  }

  async findOnePlain(term: string){
    const {images = [], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(images => `${process.env.HOST_API}/files/product/${images.url}` )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {

    const {images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
    });

    if(!product){
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{

      if(images){
        await queryRunner.manager.delete(ProductImage, {
          product: {id : id}
        });
        product.images = images.map(image => this.productImageRepository.create({url: image}))
      }
      //await this.productRepository.save(product);
      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    }catch(error){
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne( id ) ;
    await this.productRepository.remove(product);
    return product;
  }

  private handleDBExceptions(error: any){

    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try{
      return await query
        .delete()
        .where({})
        .execute();
    }catch(error){
      this.handleDBExceptions(error);
    }

  }
}
