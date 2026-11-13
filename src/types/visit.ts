export const VISIT_STATUSES = [
  'Agendada',
  'Em Triagem Técnica',
  'Confirmada',
  'Concluída',
  'Cancelada',
] as const;

export type VisitStatus = (typeof VISIT_STATUSES)[number];

export interface VisitRecord {
  id: string;
  protocol: string;
  serviceType: string;
  sector: string;
  urgency: string;
  motorCount: string;
  preferredDate: string;
  preferredShift: string;
  plantAddress: string;
  cityState: string;
  companyName: string;
  cnpj?: string;
  contactName: string;
  contactRole?: string;
  contactEmail: string;
  contactPhone: string;
  motorDetails: string;
  status: VisitStatus;
  assignedTechnician: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicVisitSummary {
  protocol: string;
  companyName: string;
  serviceType: string;
  preferredDate: string;
  preferredShift: string;
  status: VisitStatus;
  assignedTechnician: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitPayload {
  serviceType: string;
  sector: string;
  urgency: string;
  motorCount: string;
  preferredDate: string;
  preferredShift: string;
  plantAddress: string;
  cityState: string;
  companyName: string;
  cnpj?: string;
  contactName: string;
  contactRole?: string;
  contactEmail: string;
  contactPhone: string;
  motorDetails?: string;
}

export interface UpdateVisitAdminPayload {
  status?: VisitStatus;
  assignedTechnician?: string;
  internalNotes?: string;
  preferredDate?: string;
  preferredShift?: string;
}

export interface AdminMetrics {
  total: number;
  pending: number;
  emergency: number;
  confirmedOrDone: number;
}
