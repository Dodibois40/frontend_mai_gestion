import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AffairesModule } from './modules/affaires/affaires.module';
import { BdcModule } from './modules/bdc/bdc.module';
import { AchatsModule } from './modules/achats/achats.module';

import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { CategoriesAchatModule } from './modules/categories-achat/categories-achat.module';
import { ParametresModule } from './modules/parametres/parametres.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { MigrationModule } from './modules/migration/migration.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { MockModule } from './modules/mock/mock.module';
import { PhasesModule } from './modules/phases/phases.module';
import { EstimationsAchatsModule } from './modules/estimations-achats/estimations-achats.module';
import { FournisseursModule } from './modules/fournisseurs/fournisseurs.module';

import { PlanningEquipeModule } from './modules/planning-equipe/planning-equipe.module';
import { FraisGenerauxModule } from './modules/frais-generaux/frais-generaux.module';
import { OptiCoupeModule } from './modules/opti-coupe/opti-coupe.module';
import { EstimationReelModule } from './modules/estimation-reel/estimation-reel.module';
import { DocumentationsModule } from './modules/documentations/documentations.module';
import { AmeliorationsModule } from './modules/ameliorations/ameliorations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AffairesModule,
    BdcModule,
    AchatsModule,

    CategoriesAchatModule,
    ParametresModule,
    ArticlesModule,
    ReportingModule,
    PhasesModule,
    EstimationsAchatsModule,
    FournisseursModule,
    PlanningEquipeModule,
    FraisGenerauxModule,
    OptiCoupeModule,
    EstimationReelModule,
    DocumentationsModule,
    AmeliorationsModule,
    // MigrationModule, // Temporairement désactivé
    NotificationsModule, // Réactivé pour les tests
    UsersModule,
    MockModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {} 