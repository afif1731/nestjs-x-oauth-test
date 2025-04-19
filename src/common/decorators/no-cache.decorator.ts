import { SetMetadata } from '@nestjs/common';

export const NO_CACHE = () => SetMetadata('ignoreCaching', true);
