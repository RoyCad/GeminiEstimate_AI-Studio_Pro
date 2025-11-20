
export enum UserRole {
  ADMIN = 'Admin',
  CLIENT = 'Client'
}

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export type PartType =
  | 'pile'
  | 'pile-cap'
  | 'column'
  | 'short-column'
  | 'beam'
  | 'grade-beam'
  | 'slab'
  | 'brickwork'
  | 'earthwork'
  | 'mat-foundation'
  | 'combined-footing'
  | 'standalone-footing'
  | 'staircase'
  | 'retaining-wall'
  | 'cc-casting';

export interface MaterialCost {
  name: string;
  unit: string;
  rate: number;
}

export interface StructuralPart {
  id: string;
  name: string;
  type: PartType;
  data: any;
}

export type MaterialQuantities = { [key: string]: number | string };

export interface ProjectService {
  id: string;
  label: string;
  charge?: number;
  remarks?: string;
  selected: boolean;
}

export interface Billing {
    type: 'sqft' | 'package';
    ratePerSqft?: number;
    totalSqft?: number;
    packageAmount?: number;
    soilTestFee?: number;
}

export interface Project {
  id: string;
  userId: string;
  projectNumber: string;
  name: string; // Mapped from projectName in some places
  projectName?: string; // Direct map from firestore
  clientName: string;
  clientEmail?: string;
  location: string; // Mapped from projectAddress
  projectAddress?: string;
  status: ProjectStatus | string;
  startDate?: string;
  createdAt?: { seconds: number, nanoseconds: number };
  budget: number;
  estimatedCost: number;
  parts: StructuralPart[];
  materialPrices: { [key: string]: number };
  transactions?: PaymentTransaction[];
  attendances?: DailyAttendance[];
  services?: ProjectService[];
  billing?: Billing;
}

export interface PaymentTransaction {
  id: string;
  projectId: string;
  type: 'Expense' | 'Payment';
  category: string;
  amount: number;
  description: string;
  date: any; // Firestore Timestamp or string or Date
}

export interface DailyAttendance {
    id: string;
    projectId?: string;
    date: any; // Firestore Timestamp or string or Date
    numberOfLaborers: number;
    wagePerLaborer: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
