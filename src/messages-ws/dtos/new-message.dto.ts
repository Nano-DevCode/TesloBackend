import { IsString, MinLength } from "class-validator";


export class NewMessage{

    @IsString()
    @MinLength(1)
    message: string;

}