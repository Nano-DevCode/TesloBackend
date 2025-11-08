import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name:'products'})
export class Product {

    @ApiProperty({
        example: '1da45964-6a28-47a5-ac92-fb94cf5f8310',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty({
        example: 'Kids Checkered Tee',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    title:string;

    @ApiProperty({
        example: 99.99,
        description: 'Product Price',
    })
    @Column('float', {
        default: 0
    })
    price:number;

    @ApiProperty({
        example: 'Est excepteur cillum aute dolor veniam laboris laboris ex laborum.',
        description: 'Product Description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description:string;

    @ApiProperty({
        example: 'kids_checkered_tee',
        description: 'Product Slug',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Product Quantity',
        default: 0,
    })
    @Column('int', {
        default: 0
    })
    stock:number;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product Size',
    })
    @Column('text', {
        array: true
    })
    sizes:string[];

    @ApiProperty({
        example: 'men',
        description: 'Product Gender',
    })
    @Column('text')
    gender:string;

    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        {cascade:true, eager:true}
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert(){
        if(!this.slug){
            this.slug = this.title
        }
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
}
