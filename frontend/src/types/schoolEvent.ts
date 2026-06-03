export type EventCategory = 'EXAM' | 'PROJECT' | 'TUITION' | 'EVENT' | 'DEADLINE';

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
  estimatedCost: number | null;
  notes: string | null;
  daysUntil: number;
  isUpcoming: boolean;
  budgetSuggestion: string | null;
  createdAt: string;
}

export interface SchoolEventPayload {
  title: string;
  date: string;
  category: EventCategory;
  estimatedCost?: number | null;
  notes?: string;
}
