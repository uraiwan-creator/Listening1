export interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  teacherEmail: string;
  teacherName: string;
  priority: 'high' | 'medium' | 'low';
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
}

export type SubjectInfo = {
  name: string;
  color: string; // Tailwind class for border/text/background
  bgLight: string;
  borderCol: string;
  textCol: string;
  icon: string; // Lucide icon name
};

export const SUBJECTS: Record<string, SubjectInfo> = {
  'คณิตศาสตร์': {
    name: 'คณิตศาสตร์',
    color: 'amber',
    bgLight: 'bg-amber-50',
    borderCol: 'border-amber-200',
    textCol: 'text-amber-700',
    icon: 'Calculator'
  },
  'วิทยาศาสตร์': {
    name: 'วิทยาศาสตร์',
    color: 'teal',
    bgLight: 'bg-teal-50',
    borderCol: 'border-teal-200',
    textCol: 'text-teal-700',
    icon: 'FlaskConical'
  },
  'ภาษาอังกฤษ': {
    name: 'ภาษาอังกฤษ',
    color: 'indigo',
    bgLight: 'bg-indigo-50',
    borderCol: 'border-indigo-200',
    textCol: 'text-indigo-700',
    icon: 'Globe'
  },
  'ภาษาไทย': {
    name: 'ภาษาไทย',
    color: 'rose',
    bgLight: 'bg-rose-50',
    borderCol: 'border-rose-200',
    textCol: 'text-rose-700',
    icon: 'BookOpen'
  },
  'สังคมศึกษา': {
    name: 'สังคมศึกษา',
    color: 'sky',
    bgLight: 'bg-sky-50',
    borderCol: 'border-sky-200',
    textCol: 'text-sky-700',
    icon: 'Compass'
  },
  'ศิลปะ': {
    name: 'ศิลปะ',
    color: 'purple',
    bgLight: 'bg-purple-50',
    borderCol: 'border-purple-200',
    textCol: 'text-purple-700',
    icon: 'Palette'
  },
  'คอมพิวเตอร์': {
    name: 'คอมพิวเตอร์',
    color: 'emerald',
    bgLight: 'bg-emerald-50',
    borderCol: 'border-emerald-200',
    textCol: 'text-emerald-700',
    icon: 'Cpu'
  },
  'การงานอาชีพ': {
    name: 'การงานอาชีพ',
    color: 'orange',
    bgLight: 'bg-orange-50',
    borderCol: 'border-orange-200',
    textCol: 'text-orange-700',
    icon: 'Briefcase'
  },
  'อื่นๆ': {
    name: 'อื่นๆ',
    color: 'slate',
    bgLight: 'bg-slate-50',
    borderCol: 'border-slate-200',
    textCol: 'text-slate-700',
    icon: 'ClipboardList'
  }
};
