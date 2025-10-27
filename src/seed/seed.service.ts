import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    
    private readonly productsService : ProductsService,
  ){}
  async runSeed(){

    await this.insertNewProducts();

    return "Seed execute";
  }

  private async insertNewProducts(){

    this.productsService.deleteAllProducts();

    const product = initialData.products;

    const insertPromises = [];

    product.forEach( product => {
      this.productsService.create(product);
    });

    await Promise.all(insertPromises);

    return true;

  }

}
