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

export interface MessageMetadata {
  // 事件資訊
  eventType?: string;
  source?: {
    type: string;
    userId: string;
    groupId?: string;
    roomId?: string;
  };
  replyToken?: string;
  
  // 處理資訊
  processingTime?: number; // milliseconds
  processingStatus?: 'success' | 'error' | 'timeout';
  errorLog?: {
    message: string;
    stack?: string;
    timestamp: string;
  };
  
  // LLM 資訊（如果使用）
  llmDetails?: {
    model?: string;
    latency?: number;
    tokens?: {
      input?: number;
      output?: number;
    };
    success?: boolean;
    error?: string;
  };
  
  // 原始事件資料
  rawEvent?: any;
  
  // 其他自訂 metadata
  [key: string]: any;
}

