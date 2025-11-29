import type { SupportedLocale } from '../types/locale';

export type SectionId =
  | 'welcome'
  | 'clinic_info'
  | 'service_info'
  | 'appointment'
  | 'appointment_policy'
  | 'cancel_policy'
  | 'post_treatment'
  | 'price'
  | 'coupon'
  | 'companion'
  | 'faq'
  | 'symptom_consultation'
  | 'schedule';

export interface SectionContent {
  title: string;
  body: string[];
}

export type SectionContents = Record<SupportedLocale, Record<SectionId, SectionContent>>;

export const sectionContents: SectionContents = {
  'zh-TW': {
    welcome: {
      title: '👋 歡迎來到木木日安醫學美容！',
      body: [
        '我是您的智能客服助手，可以協助您了解診所資訊、服務項目、預約相關問題。',
        '請選擇您需要的服務：',
      ],
    },
    clinic_info: {
      title: '📍 木木日安【復興館】',
      body: [
        '地址：台北市大安區復興南路一段81號',
        '電話：02-2778-7178',
        '',
        '營業時間：',
        '週一至週五：09:00-18:00',
        '週六：09:00-12:00',
        '週日：休診',
        '',
        '🚇 交通資訊：',
        '捷運：忠孝復興站5號出口，步行3分鐘',
        '',
        '🚌 公車站牌：',
        '捷運忠孝復興站／微風廣場／市民復興路口',
        '',
        '如需預約，請致電 02-2778-7178',
      ],
    },
    service_info: {
      title: '💆 木木日安服務項目',
      body: [
        '• 染料雷射',
        '  （建議1個月進行一次，需多次治療）',
        '',
        '• 光纖亮透淨雷射',
        '',
        '• 果酸保養／果酸換膚',
        '',
        '• 一般皮膚科診療',
        '',
        '• 青春痘治療',
        '',
        '• 皮膚過敏診斷',
        '',
        '• 皮膚保養諮詢',
        '',
        '如需了解詳細資訊或預約，請致電 02-2778-7178',
      ],
    },
    appointment: {
      title: '📅 預約服務',
      body: [
        '木木日安目前預約方式為電話預約，請直接致電 02-2778-7178',
        '',
        '營業時間：',
        '週一至週五：09:00-18:00',
        '週六：09:00-12:00',
        '',
        '我們的工作人員會為您安排最適合的看診時間。',
      ],
    },
    appointment_policy: {
      title: '📌 小小提醒：木木日安謝謝您給予我們為您服務的機會',
      body: [
        '1. 為了良好時間排程，請準時報到時間。',
        '報到延遲會相繼延誤醫師與工作人員下診，若延遲超過10分鐘以上，',
        '可能會取消當日治療，請謹慎時間並與診所端保持聯繫。',
        '',
        '2. 付款方式：僅限現金（尚無提供刷卡、匯款服務）',
        '',
        '3. 館內為維護隱私與靜謐，接待空間僅限接待治療者本人，',
        '陪同家屬請就近至附近咖啡館或是百貨散步逛街。',
        '',
        '木木日安祝福您',
      ],
    },
    cancel_policy: {
      title: '⚠️ 重要提醒：',
      body: [
        '臨時取消或當日治療未到診兩次，會取消線上預約資格，請謹慎時間排程。',
        '',
        '如需改期或取消，請直接致電 02-2778-7178 與我們聯繫。',
        '',
        '感謝您的配合！',
      ],
    },
    post_treatment: {
      title: '♦ 醫師建議：',
      body: [
        '染料雷射 / 1個月進行一次 / 需多次治療',
        '',
        '♦ 提醒您：',
        '',
        '術後可能會有輕微局部腫脹、瘀青、水泡、或皮膚不整，是暫時性的反應，約2-3週逐漸緩解。',
        '',
        '水泡的照顧方式請參考術後注意事項。',
        '',
        '術後照顧上有任何問題，隨時與我們聯繫，我會盡力協助您！',
        '',
        '診所電話：02-2778-7178',
      ],
    },
    price: {
      title: '💰 費用說明',
      body: [
        '關於治療費用，會因個人狀況和選擇的療程而有所不同。',
        '建議您預約看診，讓醫師評估後提供詳細的費用說明。',
        '',
        '如需預約，請致電 02-2778-7178',
      ],
    },
    coupon: {
      title: '🎫 優惠活動',
      body: [
        '木木日安會不定期推出優惠活動和折價券。',
        '詳細優惠資訊請致電 02-2778-7178 或關注我們的官方帳號。',
        '',
        '治療當日請出示折價券訊息，提供核對查詢。',
        '本券限本人使用，無法轉讓。',
      ],
    },
    companion: {
      title: '👥 陪同人員',
      body: [
        '館內為維護隱私與靜謐，接待空間僅限接待治療者本人，陪同家屬請就近至附近咖啡館或是百貨散步逛街。',
        '',
        '感謝您的配合與理解！',
      ],
    },
    faq: {
      title: '❓ 常見問題',
      body: [
        '我是木木日安的智能客服，可以協助您：',
        '• 了解診所資訊（地址、電話、營業時間）',
        '• 了解服務項目',
        '• 預約相關問題',
        '• 其他皮膚相關問題',
        '',
        '如需更詳細的協助，請致電 02-2778-7178',
      ],
    },
    symptom_consultation: {
      title: '🏥 症狀諮詢',
      body: [
        '關於您的症狀問題，建議您預約看診，讓醫師為您進行專業評估。',
        '',
        '如需預約，請致電 02-2778-7178',
        '營業時間：週一至週五 09:00-18:00，週六 09:00-12:00',
        '',
        '木木日安祝福您！💙',
      ],
    },
    schedule: {
      title: '📅 更多資訊',
      body: [
        '以下是木木日安的詳細資訊，請選擇您想了解的項目：',
      ],
    },
  },
  'en-US': {
    welcome: {
      title: '👋 Welcome to Mumu Ri\'an Medical Beauty!',
      body: [
        'I am your intelligent customer service assistant, and I can help you learn about clinic information, services, and appointment-related questions.',
        'Please select the service you need:',
      ],
    },
    clinic_info: {
      title: '📍 Mumu Ri\'an [Fuxing Branch]',
      body: [
        'Address: No. 81, Section 1, Fuxing South Road, Da\'an District, Taipei City',
        'Phone: 02-2778-7178',
        '',
        'Business Hours:',
        'Monday to Friday: 09:00-18:00',
        'Saturday: 09:00-12:00',
        'Sunday: Closed',
        '',
        '🚇 Transportation:',
        'MRT: Zhongxiao Fuxing Station Exit 5, 3 minutes walk',
        '',
        '🚌 Bus Stops:',
        'MRT Zhongxiao Fuxing Station / Breeze Center / Civic Fuxing Intersection',
        '',
        'For appointments, please call 02-2778-7178',
      ],
    },
    service_info: {
      title: '💆 Mumu Ri\'an Services',
      body: [
        '• Dye Laser',
        '  (Recommended once a month, multiple treatments required)',
        '',
        '• Fiber Brightening Laser',
        '',
        '• AHA Treatment / AHA Peeling',
        '',
        '• General Dermatology',
        '',
        '• Acne Treatment',
        '',
        '• Skin Allergy Diagnosis',
        '',
        '• Skin Care Consultation',
        '',
        'For detailed information or appointments, please call 02-2778-7178',
      ],
    },
    appointment: {
      title: '📅 Appointment Service',
      body: [
        'Mumu Ri\'an currently accepts phone appointments. Please call 02-2778-7178 directly.',
        '',
        'Business Hours:',
        'Monday to Friday: 09:00-18:00',
        'Saturday: 09:00-12:00',
        '',
        'Our staff will arrange the most suitable appointment time for you.',
      ],
    },
    appointment_policy: {
      title: '📌 Reminder: Thank you for giving us the opportunity to serve you',
      body: [
        '1. For better scheduling, please arrive on time.',
        'Late arrival may delay the doctor and staff, and if delayed more than 10 minutes,',
        'the day\'s treatment may be cancelled. Please be mindful of time and keep in touch with the clinic.',
        '',
        '2. Payment Method: Cash only (no credit card or bank transfer services available)',
        '',
        '3. To maintain privacy and tranquility, the reception area is limited to the patient only.',
        'Accompanying family members are welcome to visit nearby cafes or shopping malls.',
        '',
        'Best regards from Mumu Ri\'an',
      ],
    },
    cancel_policy: {
      title: '⚠️ Important Reminder:',
      body: [
        'Two instances of last-minute cancellation or no-show will result in cancellation of online appointment eligibility. Please be mindful of scheduling.',
        '',
        'For rescheduling or cancellation, please call 02-2778-7178 to contact us.',
        '',
        'Thank you for your cooperation!',
      ],
    },
    post_treatment: {
      title: '♦ Doctor\'s Recommendation:',
      body: [
        'Dye Laser / Once a month / Multiple treatments required',
        '',
        '♦ Reminder:',
        '',
        'Post-treatment may include mild local swelling, bruising, blisters, or skin irregularities, which are temporary reactions that gradually improve within 2-3 weeks.',
        '',
        'Please refer to post-treatment care instructions for blister care.',
        '',
        'If you have any questions about post-treatment care, please contact us anytime. I will do my best to assist you!',
        '',
        'Clinic Phone: 02-2778-7178',
      ],
    },
    price: {
      title: '💰 Pricing Information',
      body: [
        'Treatment costs vary depending on individual conditions and selected treatment courses.',
        'We recommend scheduling an appointment for the doctor to assess and provide detailed pricing information.',
        '',
        'For appointments, please call 02-2778-7178',
      ],
    },
    coupon: {
      title: '🎫 Promotions',
      body: [
        'Mumu Ri\'an regularly offers promotions and discount coupons.',
        'For detailed promotion information, please call 02-2778-7178 or follow our official account.',
        '',
        'Please present the discount coupon message on the treatment day for verification.',
        'This coupon is for personal use only and cannot be transferred.',
      ],
    },
    companion: {
      title: '👥 Accompanying Persons',
      body: [
        'To maintain privacy and tranquility, the reception area is limited to the patient only. Accompanying family members are welcome to visit nearby cafes or shopping malls.',
        '',
        'Thank you for your understanding and cooperation!',
      ],
    },
    faq: {
      title: '❓ Frequently Asked Questions',
      body: [
        'I am Mumu Ri\'an\'s intelligent customer service assistant and can help you with:',
        '• Clinic information (address, phone, business hours)',
        '• Service information',
        '• Appointment-related questions',
        '• Other skin-related questions',
        '',
        'For more detailed assistance, please call 02-2778-7178',
      ],
    },
    symptom_consultation: {
      title: '🏥 Symptom Consultation',
      body: [
        'Regarding your symptom questions, we recommend scheduling an appointment for a professional assessment by our doctor.',
        '',
        'For appointments, please call 02-2778-7178',
        'Business Hours: Monday to Friday 09:00-18:00, Saturday 09:00-12:00',
        '',
        'Best regards from Mumu Ri\'an! 💙',
      ],
    },
    schedule: {
      title: '📅 More Information',
      body: [
        'Below is detailed information about Mumu Ri\'an. Please select what you would like to know:',
      ],
    },
  },
};

export function getSectionContent(
  locale: SupportedLocale,
  section: SectionId
): SectionContent {
  return sectionContents[locale][section];
}









