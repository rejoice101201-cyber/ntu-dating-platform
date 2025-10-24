export interface Course {
  // Core identifiers
  ser_no: string; // serial number (primary key)
  cou_code: string; // course code
  cou_cname: string; // Chinese course name
  cou_ename: string; // English course name
  
  // Academic info
  dpt_code: string; // department code
  dpt_abbr: string; // department abbreviation
  credit: number; // credits
  tlec: number; // lecture hours
  tlab: number; // lab hours
  
  // Instructor
  tea_cname: string; // Chinese teacher name
  tea_ename: string; // English teacher name
  
  // Schedule (multiple time slots)
  st1?: number; day1?: number; // time slot 1
  st2?: number; day2?: number; // time slot 2
  st3?: number; day3?: number; // time slot 3
  st4?: number; day4?: number; // time slot 4
  st5?: number; day5?: number; // time slot 5
  st6?: number; day6?: number; // time slot 6
  
  // Classrooms (multiple locations)
  clsrom_1?: string;
  clsrom_2?: string;
  clsrom_3?: string;
  clsrom_4?: string;
  clsrom_5?: string;
  clsrom_6?: string;
  
  // Additional info
  limit?: number; // enrollment limit
  pre_course?: string; // prerequisites
  co_rep?: string; // course remarks/description
  co_select?: string; // selection info
  outside?: string; // outside course indicator
  co_tp?: string; // course type (1=required, 0=elective)
  mark?: string; // course mark (1=required, 0=elective)
  
  // Computed fields for UI
  displayName?: string; // formatted name for display
  timeSlots?: Array<{day: number, start: number, classroom?: string}>; // parsed time slots
  totalHours?: number; // tlec + tlab
  selectionProbability?: number; // 0-100% chance of being selected in lottery
}

export interface CourseFilters {
  keyword?: string;
  department?: string;
  minCredits?: number;
  maxCredits?: number;
}

export interface LotteryEntry {
  course: Course;
  priority: number; // 1 = highest priority
  isSelected?: boolean; // result of lottery
}

export interface SelectionPhase {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}

