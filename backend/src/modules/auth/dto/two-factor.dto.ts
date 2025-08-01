import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupTwoFactorDto {
  @ApiProperty({
    description: 'Email de l\'utilisateur pour la configuration 2FA',
    example: 'user@example.com'
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'Code de vérification à 6 chiffres ou code de récupération',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 8, { message: 'Le code doit contenir entre 6 et 8 caractères' })
  token: string;
}

export class EnableTwoFactorDto {
  @ApiProperty({
    description: 'Code de vérification à 6 chiffres pour activer la 2FA',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
  token: string;
}

export class TwoFactorStatusDto {
  @ApiProperty({ description: 'Indique si la 2FA est activée' })
  isEnabled: boolean;

  @ApiProperty({ description: 'Indique si la 2FA est configurée' })
  isConfigured: boolean;

  @ApiProperty({ description: 'Date de dernière utilisation', nullable: true })
  lastUsed: Date | null;

  @ApiProperty({ description: 'Nombre de codes de récupération restants' })
  backupCodesCount: number;
}

export class TwoFactorSetupResponseDto {
  @ApiProperty({ description: 'Secret base32 pour configuration manuelle' })
  secret: string;

  @ApiProperty({ description: 'QR code en base64 pour scanner' })
  qrCode: string;

  @ApiProperty({ description: 'Codes de récupération d\'urgence', type: [String] })
  backupCodes: string[];

  @ApiProperty({ description: 'Clé manuelle pour saisie dans l\'app' })
  manualEntryKey: string;
}

export class BackupCodesResponseDto {
  @ApiProperty({ description: 'Nouveaux codes de récupération', type: [String] })
  backupCodes: string[];
}

export class TwoFactorSuccessDto {
  @ApiProperty({ description: 'Succès de l\'opération' })
  success: boolean;

  @ApiProperty({ description: 'Message de confirmation' })
  message: string;

  @ApiProperty({ description: 'Indique si un code de récupération a été utilisé', required: false })
  usedBackupCode?: boolean;
} 