import { AppState } from './types';
import { getLocalDateStr, getPastLocalDateStr, getTodayWeekday } from './utils';

const now = Date.now();
const today = getLocalDateStr();
const todayDay = getTodayWeekday();

export const INITIAL_STATE: AppState = {
  version: 4.2,
  lastUpdatedMs: now,
  members: [
    {
      id: 'mehrsan',
      name: 'Mehrsan',
      tagline: 'Computer Eng • Deep Learning & Web',
      avatar: 'M',
      theme: 'warm-sage',
      statusNote: 'Building steady habits, one focused hour at a time ☕',
      presence: null
    },
    {
      id: 'ronak',
      name: 'Ronak',
      tagline: 'French B2 Journey • English & Uni',
      avatar: 'R',
      theme: 'lavender-blush',
      statusNote: 'Dreaming in French & leveling up every single day 💜✨',
      presence: null
    }
  ],
  schedules: [
    { id: 'm-s1', userId: 'mehrsan', day: 'Saturday', title: 'Principles of Compiler Design', startTime: '08:30', endTime: '10:30', details: 'Prof. Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s2', userId: 'mehrsan', day: 'Saturday', title: 'Special Topics (Deep Learning)', startTime: '10:30', endTime: '12:30', details: 'Prof. Yousefi • Room 1205', category: 'Core', attendedDates: [] },
    { id: 'm-s3', userId: 'mehrsan', day: 'Saturday', title: 'Analytical History of Early Islam', startTime: '14:00', endTime: '16:00', details: 'Prof. Karimi • Room 102', category: 'General', attendedDates: [] },
    { id: 'm-s4', userId: 'mehrsan', day: 'Sunday', title: 'Special Topics (Deep Learning)', startTime: '08:30', endTime: '10:30', details: 'Prof. Yousefi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s5', userId: 'mehrsan', day: 'Sunday', title: 'Principles of Compiler Design', startTime: '14:00', endTime: '16:00', details: 'Prof. Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s6', userId: 'mehrsan', day: 'Monday', title: 'Fundamentals of Info Security', startTime: '12:30', endTime: '14:00', details: 'Prof. Tajbakhsh • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s7', userId: 'mehrsan', day: 'Tuesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Azimi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s8', userId: 'mehrsan', day: 'Tuesday', title: 'Electrical & Electronic Circuits Lab', startTime: '12:30', endTime: '14:00', details: 'Room 210', category: 'Lab', attendedDates: [] },
    { id: 'm-s9', userId: 'mehrsan', day: 'Wednesday', title: 'Fundamentals of Info Security', startTime: '08:30', endTime: '10:30', details: 'Prof. Tajbakhsh • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s10', userId: 'mehrsan', day: 'Wednesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Azimi • Room 102', category: 'Core', attendedDates: [] },

    { id: 'r-s1', userId: 'ronak', day: 'Saturday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
    { id: 'r-s2', userId: 'ronak', day: 'Sunday', title: 'University Classes Block', startTime: '08:30', endTime: '12:30', details: 'Morning Campus Sessions', category: 'University', attendedDates: [] },
    { id: 'r-s3', userId: 'ronak', day: 'Monday', title: 'University Classes Block', startTime: '08:30', endTime: '14:30', details: 'Full Campus Day', category: 'University', attendedDates: [] },
    { id: 'r-s4', userId: 'ronak', day: 'Monday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
    { id: 'r-s5', userId: 'ronak', day: 'Tuesday', title: 'University Classes Block', startTime: '08:30', endTime: '14:30', details: 'Full Campus Day', category: 'University', attendedDates: [] },
    { id: 'r-s6', userId: 'ronak', day: 'Wednesday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
  ],
  goals: [
    {
      id: 'm-g1',
      userId: 'mehrsan',
      title: 'B.Sc. Final Project (3 Credits)',
      category: 'Long-Term',
      targetHours: 120,
      loggedMinutes: 1440,
      deadline: 'End of Semester',
      milestones: [
        { id: 'ms-1', title: 'Finalize architecture & supervisor approval', completed: true },
        { id: 'ms-2', title: 'Complete core prototype & database schema', completed: true },
        { id: 'ms-3', title: 'Run evaluation tests & write final thesis', completed: false }
      ]
    },
    {
      id: 'm-g2',
      userId: 'mehrsan',
      title: 'Master Deep Learning & Neural Nets',
      category: 'Long-Term',
      targetHours: 80,
      loggedMinutes: 960,
      deadline: '1405/11/14',
      milestones: [
        { id: 'ms-4', title: 'Master CNNs & Optimization techniques', completed: true },
        { id: 'ms-5', title: 'Implement Transformer / Attention mini-project', completed: false }
      ]
    },
    {
      id: 'm-g3',
      userId: 'mehrsan',
      title: 'Full-Stack Web Dev Projects',
      category: 'Short-Term',
      targetHours: 50,
      loggedMinutes: 720,
      deadline: 'Ongoing',
      milestones: [
        { id: 'ms-6', title: 'Ship SyncPulse Co-Op Sanctuary v4', completed: true },
        { id: 'ms-7', title: 'Complete course project deliverables', completed: false }
      ]
    },

    {
      id: 'r-g1',
      userId: 'ronak',
      title: 'Master French up to B2 Level',
      category: 'Long-Term',
      targetHours: 400,
      loggedMinutes: 3600,
      deadline: 'Until B.Sc. Graduation (~3 Years)',
      milestones: [
        { id: 'ms-8', title: 'Complete A1 Foundations & pronunciation', completed: true },
        { id: 'ms-9', title: 'Finish A2 Elementary grammar & daily speaking', completed: false },
        { id: 'ms-10', title: 'Reach B1 Intermediate fluency', completed: false },
        { id: 'ms-11', title: 'Achieve B2 Upper-Intermediate certification', completed: false }
      ]
    },
    {
      id: 'r-g2',
      userId: 'ronak',
      title: 'English Immersion (Movies, YouTube & Media)',
      category: 'Habit',
      targetHours: 150,
      loggedMinutes: 2100,
      deadline: 'Daily Routine',
      milestones: [
        { id: 'ms-12', title: 'Watch 20 hours of native English YouTube/vlogs', completed: true },
        { id: 'ms-13', title: 'Finish 5 full movies without Persian subtitles', completed: false }
      ]
    },
    {
      id: 'r-g3',
      userId: 'ronak',
      title: 'Launch English Teaching Career',
      category: 'Career',
      targetHours: 60,
      loggedMinutes: 600,
      deadline: 'This Year',
      milestones: [
        { id: 'ms-14', title: 'Prepare teaching methodology & sample lesson plan', completed: true },
        { id: 'ms-15', title: 'Start tutoring first students / language institute', completed: false }
      ]
    },
  ],
  tasks: [
    { id: 'm-t1', userId: 'mehrsan', day: todayDay, title: 'Review Compiler Design Lexical Analysis notes', reminderTime: '18:00', completed: false, estimatedMinutes: 45, createdAt: today },
    { id: 'r-t1', userId: 'ronak', day: todayDay, title: 'Watch 1hr English YouTube / Movie', reminderTime: '20:00', completed: false, estimatedMinutes: 60, createdAt: today },
  ],
  exams: [
    { id: 'ex-1', userId: 'mehrsan', title: 'Principles of Compiler Design', date: '1405/10/26', time: '11:00', professor: 'Damanafshan', type: 'Core' },
    { id: 'ex-2', userId: 'mehrsan', title: 'Fundamentals of Info Security', date: '1405/10/30', time: '11:00', professor: 'Tajbakhsh', type: 'Core' },
    { id: 'ex-3', userId: 'mehrsan', title: 'Analytical History of Early Islam', date: '1405/11/05', time: '14:00', professor: 'Karimi', type: 'General' },
    { id: 'ex-4', userId: 'mehrsan', title: 'Web Programming', date: '1405/11/10', time: '09:00', professor: 'Azimi', type: 'Core' },
    { id: 'ex-5', userId: 'mehrsan', title: 'Special Topics (Deep Learning)', date: '1405/11/14', time: '09:00', professor: 'Yousefi', type: 'Core' },
    { id: 'ex-6', userId: 'ronak', title: 'French Level Assessment Exam', date: '1405/10/28', time: '21:00', professor: 'French Institute', type: 'Language' },
  ],
  logs: [
    { id: 'l-1', userId: 'mehrsan', targetTitle: 'Special Topics (Deep Learning)', minutes: 90, date: getPastLocalDateStr(2), createdAtMs: now - 172800000, cheeredBy: ['ronak'] },
    { id: 'l-2', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 120, date: getPastLocalDateStr(2), createdAtMs: now - 170000000, cheeredBy: ['mehrsan'] },
    { id: 'l-3', userId: 'mehrsan', targetTitle: 'Full-Stack Web Dev Projects', minutes: 110, date: getPastLocalDateStr(1), createdAtMs: now - 86400000, cheeredBy: ['ronak'] },
    { id: 'l-4', userId: 'ronak', targetTitle: 'English Immersion (Movies, YouTube & Media)', minutes: 95, date: getPastLocalDateStr(1), createdAtMs: now - 82000000, cheeredBy: ['mehrsan'] },
    { id: 'l-5', userId: 'mehrsan', targetTitle: 'B.Sc. Final Project (3 Credits)', minutes: 60, date: today, createdAtMs: now - 7200000, cheeredBy: ['ronak'] },
    { id: 'l-6', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 75, date: today, createdAtMs: now - 3600000, cheeredBy: ['mehrsan'] },
  ]
};
