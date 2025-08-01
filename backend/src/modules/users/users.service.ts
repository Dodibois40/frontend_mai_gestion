import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto/user.dto';
// import { User, RoleEnum } from '@prisma/client';

// Types temporaires en attendant la génération complète de Prisma
type User = any;
enum RoleEnum {
  ADMIN_SYS = 'ADMIN_SYS',
  CHEF_ATELIER = 'CHEF_ATELIER',
  CHARGE_AFFAIRE = 'CHARGE_AFFAIRE',
  ACHETEUR = 'ACHETEUR',
  EMPLOYE = 'EMPLOYE'
}
import * as bcrypt from 'bcrypt';

// Palette de couleurs conforme aux préférences UI (terre, bois, olive, soleil)
const COULEURS_PLANNING = [
  // Tons terre
  '#8B4513', // Marron terre cuite
  '#A0522D', // Brun sienna
  '#CD853F', // Brun doré
  '#D2691E', // Chocolat
  
  // Tons bois
  '#DEB887', // Bois clair
  '#BC8F8F', // Bois rosé
  '#F4A460', // Bois de sable
  '#DAA520', // Bois doré
  
  // Tons olive
  '#556B2F', // Olive foncé
  '#6B8E23', // Olive yellow green
  '#808000', // Olive classique
  '#9ACD32', // Olive clair
  
  // Tons soleil
  '#FF8C00', // Orange soleil
  '#FFB347', // Orange pêche
  '#FFA500', // Orange vif
  '#F0E68C', // Jaune khaki soleil
  
  // Couleurs complémentaires terre
  '#B22222', // Rouge brique
  '#CD5C5C', // Rouge indien
  '#D2B48C', // Tan
  '#F5DEB3'  // Blé
];

// Fonction pour obtenir une couleur unique basée sur l'index utilisateur
export function attribuerCouleurPlanning(indexUtilisateur: number): string {
  return COULEURS_PLANNING[indexUtilisateur % COULEURS_PLANNING.length];
}

// Fonction pour regénérer toutes les couleurs planning
export async function regenererCouleursPlanning(prisma: any) {
  const utilisateurs = await prisma.user.findMany({
    where: { actif: true, supprime: false },
    orderBy: { createdAt: 'asc' }
  });

  for (let i = 0; i < utilisateurs.length; i++) {
    const nouvelleCouleur = attribuerCouleurPlanning(i);
    await prisma.user.update({
      where: { id: utilisateurs[i].id },
      data: { couleurPlanning: nouvelleCouleur }
    });
  }

  return utilisateurs.length;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: UserFilterDto) {
    const { page = 1, limit = 20, search, role, actif } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      supprime: false,
    };

    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { prenom: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (actif !== undefined && actif !== 'all') {
      where.actif = actif === 'true';
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user: any) => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const { password, ...userData } = createUserDto;
    
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Obtenir le nombre d'utilisateurs actifs pour déterminer l'index de couleur
    const nbUtilisateursExistants = await this.prisma.user.count({
      where: { actif: true, supprime: false }
    });
    
    // Attribuer automatiquement une couleur unique de la palette
    const couleurPlanning = attribuerCouleurPlanning(nbUtilisateursExistants);

    // Convertir la date d'embauche au format ISO-8601 DateTime si elle est fournie
    const dataToCreate: any = {
      ...userData,
      role: userData.role as any, // Conversion explicite pour éviter conflit d'enum
      statutContractuel: userData.statutContractuel as any || 'SALARIE',
      passwordHash: hashedPassword,
      couleurPlanning, // Assigner la couleur automatiquement
      dateEmbauche: userData.dateEmbauche ? new Date(userData.dateEmbauche + 'T00:00:00.000Z') : undefined,
    };

    const user = await this.prisma.user.create({
      data: dataToCreate,
    });

    // Retourner l'utilisateur sans le mot de passe
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    console.log('🔍 [UPDATE USER] Données reçues:', updateUserDto);
    
    const { password, ...userData } = updateUserDto;
    
    const data: any = { ...userData };
    
    // Convertir la date d'embauche au format ISO-8601 DateTime si elle est fournie
    if (data.dateEmbauche) {
      data.dateEmbauche = new Date(data.dateEmbauche + 'T00:00:00.000Z');
    }
    
    // Convertir le rôle au bon type enum
    if (data.role) {
      data.role = data.role as RoleEnum;
    }
    
    // Convertir le statut contractuel au bon type enum
    if (data.statutContractuel) {
      data.statutContractuel = data.statutContractuel as any;
    }
    
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    console.log('🔍 [UPDATE USER] Données à sauvegarder:', data);

    const user = await this.prisma.user.update({
      where: { id },
      data: data as any,
    });

    console.log('✅ [UPDATE USER] Utilisateur mis à jour:', {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      tarifHoraireBase: (user as any).tarifHoraireBase,
      tarifHoraireCout: (user as any).tarifHoraireCout,
      tarifHoraireVente: (user as any).tarifHoraireVente
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async remove(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: {
        supprime: true,
        supprimeLe: new Date(),
        actif: false,
      },
    });

    return { message: 'Utilisateur supprimé avec succès' };
  }

  async reactivate(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        actif: true,
        supprime: false,
        supprimeLe: null,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(id: string, passwordData: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedNewPassword,
      },
    });

    return { message: 'Mot de passe modifié avec succès' };
  }

  async getStats() {
    const [total, actifs, inactifs] = await Promise.all([
      this.prisma.user.count({ where: { supprime: false } }),
      this.prisma.user.count({ where: { supprime: false, actif: true } }),
      this.prisma.user.count({ where: { supprime: false, actif: false } }),
    ]);

    // Compter les ouvriers (chantier + atelier)
    const ouvriersCount = await this.prisma.user.count({
      where: {
        supprime: false,
        actif: true,
        OR: [
          { role: 'OUVRIER_CHANTIER' },
          { role: 'OUVRIER_ATELIER' },
        ],
      },
    });

    // Calcul simple du tarif moyen
    const avgResult = await this.prisma.user.aggregate({
      where: {
        supprime: false,
        actif: true,
        tarifHoraireBase: { gt: 0 }
      },
      _avg: {
        tarifHoraireBase: true,
      },
    });

    return {
      total,
      actifs,
      inactifs,
      ouvriersChantierAtelier: ouvriersCount,
      tarifMoyen: avgResult._avg?.tarifHoraireBase || 0,
    };
  }

  async findByRole(role: string) {
    const users = await this.prisma.user.findMany({
      where: {
        role: role as any,
        supprime: false,
        actif: true,
      },
      orderBy: { nom: 'asc' },
    });

    return users.map((user: any) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async getEquipeForPlanning() {
    console.log('🔍 [UsersService] Récupération équipe pour planning');
    
    try {
      const users = await this.prisma.user.findMany({
        where: {
          supprime: false,
          actif: true,
          disponiblePlanning: true,
          OR: [
            { role: 'OUVRIER_CHANTIER' as any },
            { role: 'OUVRIER_ATELIER' as any },
            { role: 'CHEF_CHANTIER' as any },
            { role: 'SOUS_TRAITANT' as any },
            { role: 'CHARGE_AFFAIRE' as any }
          ]
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          role: true,
          tarifHoraireBase: true,
          telephone: true,
          couleurPlanning: true,
          dateEmbauche: true,
          disponiblePlanning: true
        },
        orderBy: [
          { role: 'asc' },
          { nom: 'asc' }
        ]
      });

      // Grouper par catégorie en utilisant directement les chaînes de caractères
      const salaries = users.filter((u: any) => {
        const role = u.role as string;
        return role === 'OUVRIER_CHANTIER' || 
               role === 'OUVRIER_ATELIER' || 
               role === 'CHEF_CHANTIER' || 
               role === 'CHARGE_AFFAIRE';
      });
      
      const sousTraitants = users.filter((u: any) => {
        const role = u.role as string;
        return role === 'SOUS_TRAITANT';
      });

      console.log(`✅ [UsersService] Équipe récupérée: ${salaries.length} salariés, ${sousTraitants.length} sous-traitants`);
      
      return {
        salaries,
        sousTraitants,
        total: users.length
      };
    } catch (error) {
      console.error('❌ [UsersService] Erreur récupération équipe:', error);
      throw error;
    }
  }
} 