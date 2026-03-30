export type LabModuleStatus = 'ready' | 'coming-soon' | 'deprecated';

export interface LabModuleTranslations {
  zh: string;
  en: string;
}

export interface LabModule {
  id: string;
  title: LabModuleTranslations;
  description: LabModuleTranslations;
  path: string;
  icon: string;
  status: LabModuleStatus;
  badge?: LabModuleTranslations;
}