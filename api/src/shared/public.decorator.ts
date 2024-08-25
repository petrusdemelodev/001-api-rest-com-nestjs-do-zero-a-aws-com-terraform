import { PUBLIC_ENDPOINT_METADATA_KEY } from './constants';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const Public = (): CustomDecorator<string> =>
  SetMetadata(PUBLIC_ENDPOINT_METADATA_KEY, true);
