import {IsNotEmpty} from "@nestjs/class-validator";


export class SignInDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;
}
