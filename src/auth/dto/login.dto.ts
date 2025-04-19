/* eslint-disable @darraghor/nestjs-typed/all-properties-are-whitelisted */
/* eslint-disable @darraghor/nestjs-typed/all-properties-have-explicit-defined */
import { IsEmail } from 'class-validator';
import { IsStringDefined } from 'common';

export class LoginDto {
  @IsEmail()
  @IsStringDefined()
  email: string;

  @IsStringDefined()
  password: string;
}
