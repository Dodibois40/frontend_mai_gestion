import { PartialType } from '@nestjs/swagger';
import { CreateFraisGeneralDto } from './create-frais-general.dto';

export class UpdateFraisGeneralDto extends PartialType(CreateFraisGeneralDto) {} 