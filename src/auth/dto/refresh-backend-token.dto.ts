/* eslint-disable @darraghor/nestjs-typed/all-properties-are-whitelisted */
/* eslint-disable @darraghor/nestjs-typed/all-properties-have-explicit-defined */
import { IsStringDefined } from 'common';

export class RefreshBackendTokenDto {
  @IsStringDefined()
  backend_token: string;
}
