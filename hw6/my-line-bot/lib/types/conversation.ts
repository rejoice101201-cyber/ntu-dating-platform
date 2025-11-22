export type ConversationState =
  | 'idle'
  | 'greeting'
  | 'menu_selection'
  | 'clinic_info'
  | 'service_info'
  | 'appointment_reminder'
  | 'appointment_confirm'
  | 'appointment_cancel'
  | 'appointment_policy'
  | 'post_treatment_care'
  | 'faq'
  | 'symptom_consultation'
  | 'human_transfer'
  | 'ended';

export interface ConversationMetadata {
  state?: ConversationState;
  locale?: 'zh-TW' | 'en-US';
  userName?: string;
  phone?: string;
  appointmentDate?: string;
  symptoms?: string[];
  [key: string]: any;
}

