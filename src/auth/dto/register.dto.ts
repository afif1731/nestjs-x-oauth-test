/* eslint-disable @darraghor/nestjs-typed/all-properties-are-whitelisted */
/* eslint-disable @darraghor/nestjs-typed/all-properties-have-explicit-defined */
import { IsEmail } from 'class-validator';
import { IsStringDefined } from 'common';

export class RegisterDto {
  @IsStringDefined()
  username: string;

  @IsEmail()
  @IsStringDefined()
  email: string;

  @IsStringDefined()
  password: string;

  @IsStringDefined()
  confirm_password: string;
}
