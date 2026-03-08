export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export interface BindingConfig {
  templateId: string | null;
  personaId: string | null;
}

export interface InspectorBindings {
  [fieldKey: string]: BindingConfig;
}
