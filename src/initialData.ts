export type ThemePalette = 'warm-sage' | 'lavender-blush' | 'peach-terracotta' | 'matcha-cream';

export interface Member {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  theme: ThemePalette;
  statusNote?: string;
}

export interface ScheduleItem {
  id: string;
  userId: string;
  day: string;
  title: string;
  startTime: string;
  endTime: string;
  details: string;
  category: 'Core' | 'Lab' | 'General' | 'Language' | 'University';
  attendedDates: string[];
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  category: 'Short-Term' | 'Long-Term' | 'Habit' | 'Career';
  targetHours: number;
  loggedMinutes: number;
  deadline: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  reminderTime: string;
  completed: boolean;
  estimatedMinutes: number;
  createdAt: string;
}

export interface ExamItem {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  professor: string;
  type: 'Core' | 'General';
}

export interface TimeLog {
  id: string;
  userId: string;
  targetTitle: string;
  minutes: number;
  date: string;
  timestamp: string;
  cheers?: number;
}

export interface AppState {
  members: Member[];
  schedules: ScheduleItem[];
  goals: GoalItem[];
  tasks: TaskItem[];
  exams: ExamItem[];
  logs: TimeLog[];
}

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_STATE: AppState = {
  members: [
    {
      id: 'mehrsan',
      name: 'Mehrsan',
      tagline: 'Computer Eng • Deep Learning & Web',
      avatar: 'M',
      theme: 'warm-sage',
      statusNote: 'Building steady habits, one focused hour at a time ☕'
    },
    {
      id: 'ronak',
      name: 'Ronak',
      tagline: 'French B2 Journey • English & Uni',
      avatar: 'R',
      theme: 'lavender-blush',
      statusNote: 'Dreaming in French & leveling up every single day 💜✨'
    }
  ],
  schedules: [
    // Mehrsan's Schedule
    { id: 'm-s1', userId: 'mehrsan', day: 'Saturday', title: 'Principles of Compiler Design', startTime: '08:30', endTime: '10:30', details: 'Prof. Morteza Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s2', userId: 'mehrsan', day: 'Saturday', title: 'Special Topics (Deep Learning)', startTime: '10:30', endTime: '12:30', details: 'Prof. Saleh Yousefi • Room 1205', category: 'Core', attendedDates: [] },
    { id: 'm-s3', userId: 'mehrsan', day: 'Saturday', title: 'Analytical History of Early Islam', startTime: '14:00', endTime: '16:00', details: 'Prof. Mohammad Karimi • Room 102 (Zaryab Khoyi)', category: 'General', attendedDates: [] },
    { id: 'm-s4', userId: 'mehrsan', day: 'Sunday', title: 'Special Topics (Deep Learning)', startTime: '08:30', endTime: '10:30', details: 'Prof. Saleh Yousefi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s5', userId: 'mehrsan', day: 'Sunday', title: 'Principles of Compiler Design', startTime: '14:00', endTime: '16:00', details: 'Prof. Morteza Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s6', userId: 'mehrsan', day: 'Monday', title: 'Fundamentals of Info Security', startTime: '12:30', endTime: '14:00', details: 'Prof. Mir Saman Tajbakhsh • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s7', userId: 'mehrsan', day: 'Tuesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Yaser Azimi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s8', userId: 'mehrsan', day: 'Tuesday', title: 'Electrical & Electronic Circuits Lab', startTime: '12:30', endTime: '14:00', details: 'Room 210', category: 'Lab', attendedDates: [] },
    { id: 'm-s9', userId: 'mehrsan', day: 'Wednesday', title: 'Fundamentals of Info Security', startTime: '08:30', endTime: '10:30', details: 'Prof. Mir Saman Tajbakhsh • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s10', userId: 'mehrsan', day: 'Wednesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Yaser Azimi • Room 102', category: 'Core', attendedDates: [] },

    // Ronak's Schedule
    { id: 'r-s1', userId: 'ronak', day: 'Saturday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
    { id: 'r-s2', userId: 'ronak', day: 'Sunday', title: 'University Classes Block', startTime: '08:30', endTime: '12:30', details: 'Morning Campus Sessions', category: 'University', attendedDates: [] },
    { id: 'r-s3', userId: 'ronak', day: 'Monday', title: 'University Classes Block', startTime: '08:30', endTime: '14:30', details: 'Full Campus Day', category: 'University', attendedDates: [] },
    { id: 'r-s4', userId: 'ronak', day: 'Monday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
    { id: 'r-s5', userId: 'ronak', day: 'Tuesday', title: 'University Classes Block', startTime: '08:30', endTime: '14:30', details: 'Full Campus Day', category: 'University', attendedDates: [] },
    { id: 'r-s6', userId: 'ronak', day: 'Wednesday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
  ],
  goals: [
    { id: 'm-g1', userId: 'mehrsan', title: 'B.Sc. Final Project (3 Credits)', category: 'Long-Term', targetHours: 120, loggedMinutes: 1440, deadline: 'End of Semester' },
    { id: 'm-g2', userId: 'mehrsan', title: 'Master Deep Learning & Neural Nets', category: 'Long-Term', targetHours: 80, loggedMinutes: 960, deadline: '1405/11/14' },
    { id: 'm-g3', userId: 'mehrsan', title: 'Full-Stack Web Dev Projects', category: 'Short-Term', targetHours: 50, loggedMinutes: 720, deadline: 'Ongoing' },

    { id: 'r-g1', userId: 'ronak', title: 'Master French up to B2 Level', category: 'Long-Term', targetHours: 400, loggedMinutes: 3600, deadline: 'Until B.Sc. Graduation (~3 Years)' },
    { id: 'r-g2', userId: 'ronak', title: 'English Immersion (Movies, YouTube & Media)', category: 'Habit', targetHours: 150, loggedMinutes: 2100, deadline: 'Daily Routine' },
    { id: 'r-g3', userId: 'ronak', title: 'Launch English Teaching Career', category: 'Career', targetHours: 60, loggedMinutes: 600, deadline: 'This Year' },
  ],
  tasks: [
    { id: 'm-t1', userId: 'mehrsan', title: 'Review Compiler Design Lexical Analysis notes', reminderTime: '18:00', completed: false, estimatedMinutes: 45, createdAt: getTodayStr() },
    { id: 'm-t2', userId: 'mehrsan', title: 'Coordinate Final Project milestone with supervisor', reminderTime: '11:00', completed: true, estimatedMinutes: 30, createdAt: getTodayStr() },
    { id: 'r-t1', userId: 'ronak', title: 'Watch 1hr English YouTube / Movie', reminderTime: '20:00', completed: false, estimatedMinutes: 60, createdAt: getTodayStr() },
    { id: 'r-t2', userId: 'ronak', title: 'Review French grammar & vocab before 9 PM class', reminderTime: '19:30', completed: true, estimatedMinutes: 45, createdAt: getTodayStr() },
  ],
  exams: [
    { id: 'ex-1', userId: 'mehrsan', title: 'Principles of Compiler Design', date: '1405/10/26', time: '11:00', professor: 'Morteza Damanafshan', type: 'Core' },
    { id: 'ex-2', userId: 'mehrsan', title: 'Fundamentals of Info Security', date: '1405/10/30', time: '11:00', professor: 'Mir Saman Tajbakhsh', type: 'Core' },
    { id: 'ex-3', userId: 'mehrsan', title: 'Analytical History of Early Islam', date: '1405/11/05', time: '14:00', professor: 'Mohammad Karimi', type: 'General' },
    { id: 'ex-4', userId: 'mehrsan', title: 'Web Programming', date: '1405/11/10', time: '09:00', professor: 'Yaser Azimi', type: 'Core' },
    { id: 'ex-5', userId: 'mehrsan', title: 'Special Topics (Deep Learning)', date: '1405/11/14', time: '09:00', professor: 'Saleh Yousefi', type: 'Core' },
  ],
  logs: [
    { id: 'l-1', userId: 'mehrsan', targetTitle: 'Special Topics (Deep Learning)', minutes: 90, date: getPastDateStr(2), timestamp: '2 days ago', cheers: 2 },
    { id: 'l-2', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 120, date: getPastDateStr(2), timestamp: '2 days ago', cheers: 4 },
    { id: 'l-3', userId: 'mehrsan', targetTitle: 'Full-Stack Web Dev Projects', minutes: 110, date: getPastDateStr(1), timestamp: 'Yesterday', cheers: 3 },
    { id: 'l-4', userId: 'ronak', targetTitle: 'English Immersion (Movies, YouTube & Media)', minutes: 95, date: getPastDateStr(1), timestamp: 'Yesterday', cheers: 5 },
    { id: 'l-5', userId: 'mehrsan', targetTitle: 'B.Sc. Final Project (3 Credits)', minutes: 60, date: getTodayStr(), timestamp: 'Today, 10:15', cheers: 2 },
    { id: 'l-6', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 75, date: getTodayStr(), timestamp: 'Today, 11:30', cheers: 6 },
  ]
};
