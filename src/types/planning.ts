export interface AffairePlanning {
  id: string;
  numero: string;
  libelle: string;
  client: string;
  dateDebut: Date;
  dateFin: Date;
  dureeJours: number;
  couleur: string;
  statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  equipe: User[];
  phases: PhasePlanning[];
  estimationBudget: number;
  montantRealise: number;
  description?: string;
  progression?: number;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  email?: string;
  telephone?: string;
  couleur?: string;
}

export interface PhasePlanning {
  id: string;
  nom: string;
  typePhase: string;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
  dureeEstimee: number;
  dureeReelle?: number;
  responsable?: User;
}

export interface PlanningView {
  type: 'day' | 'week' | 'month' | 'timeline' | 'kanban';
  startDate: Date;
  endDate: Date;
  zoom: number;
}

export interface PlanningFilter {
  users: string[];
  statuts: string[];
  clients: string[];
  search: string;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface DropZoneData {
  date: Date;
  time?: string;
  user?: string;
  isValid: boolean;
  conflictingAffaires?: AffairePlanning[];
}

export interface DragData {
  affaire: AffairePlanning;
  originalPosition: {
    date: Date;
    duration: number;
  };
  isDragging: boolean;
}

export interface PlanningStats {
  totalAffaires: number;
  affairesEnCours: number;
  affairesTerminees: number;
  affairesPlanifiees: number;
  affairesEnRetard: number;
  chargeEquipe: number;
  efficacite: number;
}

export interface PlanningEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AffairePlanning;
  color: string;
  isDraggable: boolean;
  isResizable: boolean;
}

export interface PlanningCell {
  date: Date;
  affaires: AffairePlanning[];
  capacity: number;
  isWeekend: boolean;
  isToday: boolean;
  isDisabled: boolean;
}

export interface PlanningConfig {
  workingHours: {
    start: number; // 8 pour 8h
    end: number;   // 18 pour 18h
  };
  workingDays: number[]; // [1,2,3,4,5] pour lun-ven
  timeSlotDuration: number; // en minutes
  snapToGrid: boolean;
  allowOverlap: boolean;
  maxConcurrentAffaires: number;
}

export interface GestureConfig {
  drag: boolean;
  pinch: boolean;
  pan: boolean;
  longPress: boolean;
  doubleTap: boolean;
  swipe: boolean;
  penHover: boolean;
  penPressure: boolean;
  barrelButton: boolean;
}

export interface TouchEvent {
  type: 'start' | 'move' | 'end';
  touches: Touch[];
  target: Element;
  timestamp: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} 