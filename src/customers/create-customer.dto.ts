import {IsNotEmpty} from "@nestjs/class-validator";

export class CreateCustomerDto{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    password: string;
}