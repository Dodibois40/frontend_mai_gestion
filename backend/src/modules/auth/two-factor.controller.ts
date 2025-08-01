import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import {
  SetupTwoFactorDto,
  VerifyTwoFactorDto,
  EnableTwoFactorDto,
  TwoFactorStatusDto,
  TwoFactorSetupResponseDto,
  BackupCodesResponseDto,
  TwoFactorSuccessDto,
} from './dto/two-factor.dto';

@ApiTags('2FA - Authentification à deux facteurs')
@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('status')
  @ApiOperation({ summary: 'Récupérer le statut de la 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Statut 2FA récupéré avec succès',
    type: TwoFactorStatusDto,
  })
  async getTwoFactorStatus(@Req() req: RequestWithUser) {
    try {
      return await this.twoFactorService.getTwoFactorStatus(req.user.id);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération du statut 2FA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('setup')
  @ApiOperation({ summary: 'Configurer la 2FA pour un utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Configuration 2FA créée avec succès',
    type: TwoFactorSetupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '2FA déjà activée ou erreur de validation',
  })
  @ApiBody({ type: SetupTwoFactorDto })
  async setupTwoFactorAuth(
    @Req() req: RequestWithUser,
    @Body() setupDto: SetupTwoFactorDto,
  ) {
    try {
      return await this.twoFactorService.setupTwoFactorAuth(
        req.user.id,
        setupDto.email,
      );
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Erreur lors de la configuration 2FA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify')
  @ApiOperation({ summary: 'Vérifier le code et activer la 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA activée avec succès',
    type: TwoFactorSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Code invalide ou configuration non trouvée',
  })
  @ApiBody({ type: EnableTwoFactorDto })
  async verifyAndEnableTwoFactorAuth(
    @Req() req: RequestWithUser,
    @Body() verifyDto: EnableTwoFactorDto,
  ) {
    try {
      return await this.twoFactorService.verifyAndEnableTwoFactorAuth(
        req.user.id,
        verifyDto.token,
      );
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Erreur lors de la vérification du code 2FA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-login')
  @ApiOperation({ summary: 'Vérifier le code 2FA lors de la connexion' })
  @ApiResponse({
    status: 200,
    description: 'Code 2FA valide',
    type: TwoFactorSuccessDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Code 2FA invalide',
  })
  @ApiBody({ type: VerifyTwoFactorDto })
  async verifyTwoFactorLogin(
    @Req() req: RequestWithUser,
    @Body() verifyDto: VerifyTwoFactorDto,
  ) {
    try {
      return await this.twoFactorService.verifyTwoFactorToken(
        req.user.id,
        verifyDto.token,
      );
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Erreur lors de la vérification du code 2FA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('disable')
  @ApiOperation({ summary: 'Désactiver la 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA désactivée avec succès',
    type: TwoFactorSuccessDto,
  })
  @ApiResponse({
    status: 404,
    description: '2FA non configurée',
  })
  async disableTwoFactorAuth(@Req() req: RequestWithUser) {
    try {
      return await this.twoFactorService.disableTwoFactorAuth(req.user.id);
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Erreur lors de la désactivation de la 2FA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('regenerate-backup-codes')
  @ApiOperation({ summary: 'Générer de nouveaux codes de récupération' })
  @ApiResponse({
    status: 200,
    description: 'Nouveaux codes de récupération générés',
    type: BackupCodesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '2FA non configurée',
  })
  async regenerateBackupCodes(@Req() req: RequestWithUser) {
    try {
      return await this.twoFactorService.regenerateBackupCodes(req.user.id);
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Erreur lors de la génération des codes de récupération',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 