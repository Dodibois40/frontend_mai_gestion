// Types pour le module Planning Équipe - Frontend

// ========== ÉNUMÉRATIONS ==========

export enum PeriodePlanning {
  MATIN = 'MATIN',
  APREM = 'APREM',
}

export enum TypeActivite {
  FABRICATION = 'FABRICATION',
  POSE = 'POSE',
}

export enum StatutAffectation {
  ACTIVE = 'ACTIVE',
  ANNULEE = 'ANNULEE',
  TERMINEE = 'TERMINEE',
}

export enum RoleOuvrier {
  OUVRIER_CHANTIER = 'OUVRIER_CHANTIER',
  OUVRIER_ATELIER = 'OUVRIER_ATELIER',
  SOUS_TRAITANT = 'SOUS_TRAITANT',
}

// ========== INTERFACES CORE ==========

export interface Ouvrier {
  id: string;
  nom: string;
  prenom: string;
  role: RoleOuvrier;
  couleurPlanning: string;
  tarifHoraireBase?: number;
  dateEmbauche?: string;
  telephone?: string;
  disponible?: boolean;
}

export interface AffaireSimple {
  id: string;
  numero: string;
  libelle: string;
  client: string;
  statut: string;
  dateCommencement?: string;
  dateCloturePrevue?: string;
  adresse?: string;
  ville?: string;
}

export interface Affectation {
  id: string;
  dateAffectation: string;
  periode: PeriodePlanning;
  typeActivite: TypeActivite;
  statut: StatutAffectation;
  commentaire?: string;
  couleurPersonne?: string;
  ordreAffichage: number;
  ouvrier: Ouvrier;
  affaire?: AffaireSimple;
}

export interface AffairePlanning extends AffaireSimple {
  affectations: Affectation[];
}

// ========== INTERFACES UTILITAIRES ==========

export interface JourSemaine {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  month: string;
}

export interface SemainePlanning {
  debut: Date;
  fin: Date;
  libelle: string;
}

export interface OuvriersDisponibles {
  gestionEquipe: Ouvrier[];
  sousTraitants: Ouvrier[];
  total: number;
}

export interface StatistiquesPlanning {
  totalAffectations: number;
  affectationsActives: number;
  affectationsTerminees: number;
  nombreOuvriers: number;
  tauxOccupation: number;
}

// ========== INTERFACES DONNÉES API ==========

export interface PlanningHebdomadaire {
  semaine: SemainePlanning;
  affaires: AffairePlanning[];
}

export interface CreateAffectationData {
  affaireId: string;
  userId: string;
  dateAffectation: string;
  periode: PeriodePlanning;
  typeActivite?: TypeActivite;
  commentaire?: string;
  couleurPersonne?: string;
  ordreAffichage?: number;
}

export interface UpdateAffectationData {
  typeActivite?: TypeActivite;
  statut?: StatutAffectation;
  commentaire?: string;
  couleurPersonne?: string;
  ordreAffichage?: number;
}

// ========== INTERFACES DRAG & DROP ==========

export interface DragData {
  type: 'ouvrier';
  ouvrier: Ouvrier;
  sourceType: 'panel' | 'planning';
  sourcePosition?: {
    affaireId: string;
    date: string;
    periode: PeriodePlanning;
  };
}

export interface DropData {
  type: 'planning-cell';
  affaireId: string;
  date: string;
  periode: PeriodePlanning;
  affaire: AffaireSimple;
}

export interface DragResult {
  success: boolean;
  message?: string;
  affectation?: Affectation;
}

// ========== INTERFACES COMPOSANTS ==========

export interface PlanningGridProps {
  affaires: AffairePlanning[];
  weekDays: JourSemaine[];
  onAffectationClick?: (affectation: Affectation) => void;
  onAffectationRightClick?: (affectation: Affectation, event: React.MouseEvent) => void;
  onCellClick?: (affaireId: string, date: string, periode: PeriodePlanning) => void;
  isLoading?: boolean;
  className?: string;
}

export interface OuvriersPanelProps {
  ouvriers: OuvriersDisponibles;
  onOuvrierClick?: (ouvrier: Ouvrier) => void;
  isLoading?: boolean;
  className?: string;
}

export interface WeekNavigatorProps {
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
  onToday: () => void;
  className?: string;
}

export interface AffectationChipProps {
  affectation: Affectation;
  onClick?: (affectation: Affectation) => void;
  onRightClick?: (affectation: Affectation, event: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

// ========== INTERFACES CONTEXTE ==========

export interface PlanningContextValue {
  // État
  currentWeek: Date;
  planningData: PlanningHebdomadaire | null;
  ouvriers: OuvriersDisponibles | null;
  affaires: AffaireSimple[];
  statistiques: StatistiquesPlanning | null;
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentWeek: (week: Date) => void;
  refreshPlanning: () => Promise<void>;
  affecterOuvrier: (data: CreateAffectationData) => Promise<DragResult>;
  changerTypeActivite: (affectationId: string, type: TypeActivite) => Promise<void>;
  desaffecterOuvrier: (affectationId: string) => Promise<void>;
  
  // Utilitaires
  getWeekDays: () => JourSemaine[];
  navigateWeek: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
}

// ========== INTERFACES HOOKS ==========

export interface UsePlanningDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  loadOnMount?: boolean;
}

export interface UsePlanningDataReturn extends PlanningContextValue {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refreshCount: number;
}

export interface UseDragAndDropOptions {
  onDragStart?: (data: DragData) => void;
  onDragEnd?: (result: DragResult) => void;
  validateDrop?: (dragData: DragData, dropData: DropData) => boolean;
}

export interface UseDragAndDropReturn {
  isDragging: boolean;
  dragData: DragData | null;
  dropData: DropData | null;
  canDrop: boolean;
  handleDragStart: (data: DragData) => void;
  handleDragEnd: (result: DragResult) => void;
  handleDrop: (dragData: DragData, dropData: DropData) => Promise<DragResult>;
}

// ========== INTERFACES MENU CONTEXTUEL ==========

export interface ContextMenuOption {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ContextMenuProps {
  affectation: Affectation;
  onClose: () => void;
  position: { x: number; y: number };
  options?: ContextMenuOption[];
}

// ========== INTERFACES VALIDATION ==========

export interface ValidationResult {
  valide: boolean;
  message?: string;
  code?: string | number;
  warnings?: string[];
}

export interface ConflitAffectation {
  type: 'meme_periode' | 'chevauchement' | 'indisponible';
  message: string;
  affectationConflictuelle?: Affectation;
  suggestions?: string[];
}

// ========== INTERFACES STYLE ==========

export interface PlanningTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    muted: string;
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// ========== TYPES UTILITAIRES ==========

export type PeriodeString = 'MATIN' | 'APREM';
export type TypeActiviteString = 'FABRICATION' | 'POSE';
export type StatutAffectationString = 'ACTIVE' | 'ANNULEE' | 'TERMINEE';
export type RoleOuvrierString = 'OUVRIER_CHANTIER' | 'OUVRIER_ATELIER' | 'SOUS_TRAITANT';

export type WeekDirection = 'prev' | 'next';
export type ViewMode = 'grid' | 'timeline' | 'calendar';
export type SortOption = 'nom' | 'role' | 'dateEmbauche' | 'tarifHoraire';
export type FilterOption = 'tous' | 'salaries' | 'soustraitants' | 'disponibles';

// ========== EXPORT GLOBAL ==========

export default {
  PeriodePlanning,
  TypeActivite,
  StatutAffectation,
  RoleOuvrier,
}; 