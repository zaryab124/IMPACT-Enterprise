export interface UIMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
  citations?: string[];
  isMock?: boolean;
}

export interface QuickSuggestion {
  label: string;
  query: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: string;
  timeline?: string;
}
