export type Role = "ADMIN" | "STAFF" | "VIEWER";
export type Gender = "MALE" | "FEMALE";
export type ReportType = "DAILY" | "WEEKLY" | "MONTHLY";
export type ProviderType = "OPENROUTER" | "OPENAI_COMPAT";

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  isActive: boolean;
}

export interface Pet {
  id: string;
  nameZh: string;
  nameEn: string;
  species: string;
  breed: string;
  gender: Gender;
  dob: string;
  weight?: number | null;
  avatarSvg?: string | null;
  isActive: boolean;
}

export interface DailyLog {
  id: string;
  date: string;
  summary?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  type: ReportType;
  periodStart: string;
  periodEnd: string;
  title: string;
  htmlContent: string;
  createdAt: string;
}

export interface LlmConfig {
  id: string;
  provider: ProviderType;
  apiBaseUrl: string;
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}
