import { AppState, ThemePalette } from './types';
import { getLocalDateStr, getTodayWeekday, uid } from './utils';

// Optional: Paste your default Firebase Realtime Database URL here so you never have to type it manually!
export const DEFAULT_CLOUD_DB_URL = 'https://syncpulse-8b026-default-rtdb.firebaseio.com/';

// 1. Clean Demo Template (Starts at 0 stats)
export const CREATE_DEMO_STATE = (): AppState => {
  const now = Date.now();
  const todayDay = getTodayWeekday();
  return {
    version: 6,
    isConfigured: true,
    workspaceName: 'Calm Study Sanctuary',
    roomCode: 'public-demo',
    lastUpdatedMs: now,
    members: [
      {
        id: 'alex',
        name: 'Alex',
        tagline: 'Software Engineering',
        avatar: 'A',
        theme: 'warm-sage',
        statusNote: 'Focusing one calm step at a time',
        presence: null
      },
      {
        id: 'claire',
        name: 'Claire',
        tagline: 'Language & Design',
        avatar: 'C',
        theme: 'lavender-blush',
        statusNote: 'Steady daily practice',
        presence: null
      }
    ],
    schedules: [
      { id: 'd-s1', userId: 'alex', day: todayDay, title: 'Algorithms Lecture', startTime: '09:00', endTime: '11:00', details: 'Room 101', category: 'Core', attendedDates: [] },
      { id: 'd-s2', userId: 'claire', day: todayDay, title: 'French Conversation', startTime: '18:00', endTime: '19:30', details: 'Live Session', category: 'Language', attendedDates: [] }
    ],
    goals: [
      {
        id: 'd-g1',
        userId: 'alex',
        title: 'Build Full-Stack Portfolio',
        category: 'Long-Term',
        targetHours: 80,
        loggedMinutes: 0,
        deadline: 'This Semester',
        milestones: [
          { id: 'dms-1', title: 'Design system architecture', completed: false },
          { id: 'dms-2', title: 'Deploy production app', completed: false }
        ]
      },
      {
        id: 'd-g2',
        userId: 'claire',
        title: 'Reach B2 Fluency',
        category: 'Long-Term',
        targetHours: 120,
        loggedMinutes: 0,
        deadline: 'This Year',
        milestones: [
          { id: 'dms-3', title: 'Complete grammar foundations', completed: false },
          { id: 'dms-4', title: 'Practice 20 speaking sessions', completed: false }
        ]
      }
    ],
    tasks: [],
    exams: [],
    logs: []
  };
};

// 2. Custom Blank Sanctuary Generator for any new user
export const CREATE_CUSTOM_SANCTUARY = (
  workspaceName: string,
  roomCode: string,
  p1Name: string,
  p1Tagline: string,
  p1Theme: ThemePalette,
  p2Name?: string,
  p2Tagline?: string,
  p2Theme?: ThemePalette
): AppState => {
  const now = Date.now();
  const id1 = uid('member');
  const members = [
    {
      id: id1,
      name: p1Name.trim() || 'Me',
      tagline: p1Tagline.trim() || 'Focused Learner',
      avatar: (p1Name.trim()[0] || 'M').toUpperCase(),
      theme: p1Theme,
      statusNote: 'Ready for a calm, productive day',
      presence: null
    }
  ];

  const goals = [
    {
      id: uid('goal'),
      userId: id1,
      title: 'Primary Focus Goal',
      category: 'Long-Term' as const,
      targetHours: 50,
      loggedMinutes: 0,
      deadline: 'Ongoing',
      milestones: []
    }
  ];

  if (p2Name && p2Name.trim()) {
    const id2 = uid('member');
    members.push({
      id: id2,
      name: p2Name.trim(),
      tagline: (p2Tagline || '').trim() || 'Study Companion',
      avatar: p2Name.trim()[0].toUpperCase(),
      theme: p2Theme || 'lavender-blush',
      statusNote: 'Growing together day by day',
      presence: null
    });
    goals.push({
      id: uid('goal'),
      userId: id2,
      title: 'Primary Focus Goal',
      category: 'Long-Term' as const,
      targetHours: 50,
      loggedMinutes: 0,
      deadline: 'Ongoing',
      milestones: []
    });
  }

  return {
    version: 6,
    isConfigured: true,
    workspaceName: workspaceName.trim() || 'Our Sanctuary',
    roomCode: roomCode.trim() || uid('room'),
    lastUpdatedMs: now,
    members,
    schedules: [],
    goals,
    tasks: [],
    exams: [],
    logs: []
  };
};

// 3. Mehrsan & Ronak's Private Preset أ¢â‚¬â€‌ ALL STATS & HOURS START AT ZERO (0h, Lv.1, 0 XP, 0 Logs)
export const CREATE_MEHRSAN_RONAK_PRESET = (customRoomCode = 'mr-1405'): AppState => {
  const now = Date.now();

  return {
    version: 6,
    isConfigured: true,
    workspaceName: 'Mehrsan & Ronak',
    roomCode: customRoomCode,
    lastUpdatedMs: now,
    members: [
      {
        id: 'mehrsan',
        name: 'Mehrsan',
        tagline: 'Computer Eng أ¢â‚¬آ¢ Deep Learning & Web',
        avatar: 'M',
        theme: 'warm-sage',
        statusNote: 'Steady focus, one step at a time',
        presence: null
      },
      {
        id: 'ronak',
        name: 'Ronak',
        tagline: 'French B2 أ¢â‚¬آ¢ English & University',
        avatar: 'R',
        theme: 'lavender-blush',
        statusNote: 'Step by step toward B2 fluency',
        presence: null
      }
    ],
    schedules: [
      // Mehrsan's Weekly University Schedule
      { id: 'm-s1', userId: 'mehrsan', day: 'Saturday', title: 'Principles of Compiler Design', startTime: '08:30', endTime: '10:30', details: 'Prof. Damanafshan أ¢â‚¬آ¢ Room 101', category: 'Core', attendedDates: [] },
      { id: 'm-s2', userId: 'mehrsan', day: 'Saturday', title: 'Special Topics (Deep Learning)', startTime: '10:30', endTime: '12:30', details: 'Prof. Yousefi أ¢â‚¬آ¢ Room 1205', category: 'Core', attendedDates: [] },
      { id: 'm-s3', userId: 'mehrsan', day: 'Saturday', title: 'Analytical History of Early Islam', startTime: '14:00', endTime: '16:00', details: 'Prof. Karimi أ¢â‚¬آ¢ Room 102', category: 'General', attendedDates: [] },
      { id: 'm-s4', userId: 'mehrsan', day: 'Sunday', title: 'Special Topics (Deep Learning)', startTime: '08:30', endTime: '10:30', details: 'Prof. Yousefi أ¢â‚¬آ¢ Room 102', category: 'Core', attendedDates: [] },
      { id: 'm-s5', userId: 'mehrsan', day: 'Sunday', title: 'Principles of Compiler Design', startTime: '14:00', endTime: '16:00', details: 'Prof. Damanafshan أ¢â‚¬آ¢ Room 101', category: 'Core', attendedDates: [] },
      { id: 'm-s6', userId: 'mehrsan', day: 'Monday', title: 'Fundamentals of Info Security', startTime: '12:30', endTime: '14:00', details: 'Prof. Tajbakhsh أ¢â‚¬آ¢ Room 101', category: 'Core', attendedDates: [] },
      { id: 'm-s7', userId: 'mehrsan', day: 'Tuesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Azimi أ¢â‚¬آ¢ Room 102', category: 'Core', attendedDates: [] },
      { id: 'm-s8', userId: 'mehrsan', day: 'Tuesday', title: 'Electrical & Electronic Circuits Lab', startTime: '12:30', endTime: '14:00', details: 'Room 210', category: 'Lab', attendedDates: [] },
      { id: 'm-s9', userId: 'mehrsan', day: 'Wednesday', title: 'Fundamentals of Info Security', startTime: '08:30', endTime: '10:30', details: 'Prof. Tajbakhsh أ¢â‚¬آ¢ Room 102', category: 'Core', attendedDates: [] },
      { id: 'm-s10', userId: 'mehrsan', day: 'Wednesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Azimi أ¢â‚¬آ¢ Room 102', category: 'Core', attendedDates: [] },

      // Ronak's Weekly Schedule
      { id: 'r-s1', userId: 'ronak', day: 'Saturday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Session', category: 'Language', attendedDates: [] },
      { id: 'r-s2', userId: 'ronak', day: 'Sunday', title: 'University Classes', startTime: '08:30', endTime: '12:30', details: 'Campus Block', category: 'University', attendedDates: [] },
      { id: 'r-s3', userId: 'ronak', day: 'Monday', title: 'University Classes', startTime: '08:30', endTime: '14:30', details: 'Campus Block', category: 'University', attendedDates: [] },
      { id: 'r-s4', userId: 'ronak', day: 'Monday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Session', category: 'Language', attendedDates: [] },
      { id: 'r-s5', userId: 'ronak', day: 'Tuesday', title: 'University Classes', startTime: '08:30', endTime: '14:30', details: 'Campus Block', category: 'University', attendedDates: [] },
      { id: 'r-s6', userId: 'ronak', day: 'Wednesday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Session', category: 'Language', attendedDates: [] },
    ],
    goals: [
      {
        id: 'm-g1',
        userId: 'mehrsan',
        title: 'B.Sc. Final Project (3 Credits)',
        category: 'Long-Term',
        targetHours: 120,
        loggedMinutes: 0,
        deadline: 'End of Semester',
        milestones: [
          { id: 'ms-1', title: 'Architecture & supervisor coordination', completed: false },
          { id: 'ms-2', title: 'Core implementation & testing', completed: false },
          { id: 'ms-3', title: 'Final documentation & defense', completed: false }
        ]
      },
      {
        id: 'm-g2',
        userId: 'mehrsan',
        title: 'Deep Learning & Neural Networks',
        category: 'Long-Term',
        targetHours: 80,
        loggedMinutes: 0,
        deadline: '1405/11/14',
        milestones: [
          { id: 'ms-4', title: 'Review lecture notes & assignments', completed: false },
          { id: 'ms-5', title: 'Complete course project', completed: false }
        ]
      },
      {
        id: 'r-g1',
        userId: 'ronak',
        title: 'Master French up to B2 Level',
        category: 'Long-Term',
        targetHours: 400,
        loggedMinutes: 0,
        deadline: 'Until Graduation (~3 Years)',
        milestones: [
          { id: 'ms-6', title: 'Complete A1 foundations', completed: false },
          { id: 'ms-7', title: 'Complete A2 elementary level', completed: false },
          { id: 'ms-8', title: 'Reach B1 intermediate fluency', completed: false },
          { id: 'ms-9', title: 'Achieve B2 upper-intermediate mastery', completed: false }
        ]
      },
      {
        id: 'r-g2',
        userId: 'ronak',
        title: 'English Immersion (Movies & YouTube)',
        category: 'Habit',
        targetHours: 150,
        loggedMinutes: 0,
        deadline: 'Daily Habit',
        milestones: [
          { id: 'ms-10', title: 'Daily English media immersion', completed: false }
        ]
      },
      {
        id: 'r-g3',
        userId: 'ronak',
        title: 'Start English Teaching Career',
        category: 'Career',
        targetHours: 60,
        loggedMinutes: 0,
        deadline: 'This Year',
        milestones: [
          { id: 'ms-11', title: 'Prepare lesson plans & teaching portfolio', completed: false },
          { id: 'ms-12', title: 'Begin first teaching sessions', completed: false }
        ]
      }
    ],
    tasks: [],
    exams: [
      { id: 'ex-1', userId: 'mehrsan', title: 'Principles of Compiler Design', date: '1405/10/26', time: '11:00', professor: 'Damanafshan', type: 'Core' },
      { id: 'ex-2', userId: 'mehrsan', title: 'Fundamentals of Info Security', date: '1405/10/30', time: '11:00', professor: 'Tajbakhsh', type: 'Core' },
      { id: 'ex-3', userId: 'mehrsan', title: 'Analytical History of Early Islam', date: '1405/11/05', time: '14:00', professor: 'Karimi', type: 'General' },
      { id: 'ex-4', userId: 'mehrsan', title: 'Web Programming', date: '1405/11/10', time: '09:00', professor: 'Azimi', type: 'Core' },
      { id: 'ex-5', userId: 'mehrsan', title: 'Special Topics (Deep Learning)', date: '1405/11/14', time: '09:00', professor: 'Yousefi', type: 'Core' }
    ],
    logs: []
  };
};

export const INITIAL_STATE: AppState = {
  ...CREATE_DEMO_STATE(),
  isConfigured: false
};

