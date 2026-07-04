import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db, isConfigValid } from './firebase';
import { Homework } from '../types';

// Helper to calculate relative date for mock data
const getFutureDate = (daysAhead: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

// Beautiful high-fidelity seed homework data for fallback / preview
const SEED_HOMEWORK: Homework[] = [
  {
    id: 'seed-1',
    subject: 'คณิตศาสตร์',
    title: 'แบบฝึกหัดแคลคูลัสเบื้องต้น หน้า 42-45',
    description: 'ทำโจทย์ปัญหาเรื่องลิมิตและความต่อเนื่องของฟังก์ชัน ข้อ 1-10 พร้อมแสดงวิธีทำลงในสมุดอย่างละเอียด เพื่อเตรียมสอบเก็บคะแนนกลางภาค',
    dueDate: getFutureDate(2),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    teacherEmail: 'uraiwan@srn.ac.th',
    teacherName: 'คุณครูอุไรวรรณ',
    priority: 'high'
  },
  {
    id: 'seed-2',
    subject: 'วิทยาศาสตร์',
    title: 'สรุปผลการทดลองเรื่องการหักเหของแสง',
    description: 'เขียนรายงานผลการทดลองการหักเหของแสงผ่านปริซึมสามเหลี่ยม วาดไดอะแกรมทิศทางของแสง และอธิบายความสัมพันธ์ของดรรชนีหักเห ความยาวไม่เกิน 1 หน้า A4',
    dueDate: getFutureDate(4),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    teacherEmail: 'uraiwan@srn.ac.th',
    teacherName: 'คุณครูอุไรวรรณ',
    priority: 'medium'
  },
  {
    id: 'seed-3',
    subject: 'ภาษาอังกฤษ',
    title: 'Writing: Describing Your Dream Career',
    description: 'Write a short descriptive essay (150-200 words) about your dream job. Use at least 5 conditional sentences (If-clause) and underline them.',
    dueDate: getFutureDate(3),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    teacherEmail: 'teacher.eng@school.ac.th',
    teacherName: 'Teacher Sarah',
    priority: 'medium'
  },
  {
    id: 'seed-4',
    subject: 'ภาษาไทย',
    title: 'ถอดบทประพันธ์ รามเกียรติ์ ตอน นารายณ์ปราบนนทก',
    description: 'ให้นักเรียนถอดคำประพันธ์จำนวน 4 บทหลักในหนังสือเรียน หน้า 88 พร้อมวิเคราะห์คุณค่าด้านวรรณศิลป์และข้อคิดที่นำไปปรับใช้ในชีวิตประจำวัน',
    dueDate: getFutureDate(1),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    teacherEmail: 'uraiwan@srn.ac.th',
    teacherName: 'คุณครูอุไรวรรณ',
    priority: 'high'
  },
  {
    id: 'seed-5',
    subject: 'คอมพิวเตอร์',
    title: 'เขียนโปรแกรมคำนวณเกรดเฉลี่ย (GPA Calculator)',
    description: 'พัฒนาโปรแกรมด้วยภาษา Python หรือ HTML/JS สำหรับคำนวณเกรดเฉลี่ยสะสม โดยสามารถเพิ่มวิชา หน่วยกิต และเกรดที่ได้ แล้วประมวลผลออกมาหน้าจออย่างถูกต้อง',
    dueDate: getFutureDate(6),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    teacherEmail: 'uraiwan@srn.ac.th',
    teacherName: 'คุณครูอุไรวรรณ',
    priority: 'low'
  }
];

// Initialize LocalStorage with seed data if empty
const initLocalStorage = () => {
  if (!localStorage.getItem('HW_ITEMS')) {
    localStorage.setItem('HW_ITEMS', JSON.stringify(SEED_HOMEWORK));
  }
  if (!localStorage.getItem('HW_COMPLETIONS')) {
    localStorage.setItem('HW_COMPLETIONS', JSON.stringify({}));
  }
};

initLocalStorage();

// Standard service wrappers supporting Dual Firestore & LocalStorage fallbacks
export const firebaseService = {
  // Check if real firebase is in use
  isUsingRealFirebase(): boolean {
    return isConfigValid && db !== null;
  },

  // Get homework list
  async getHomeworkList(): Promise<Homework[]> {
    if (this.isUsingRealFirebase()) {
      try {
        const q = query(collection(db, 'homework'), orderBy('dueDate', 'asc'));
        const querySnapshot = await getDocs(q);
        const list: Homework[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Homework);
        });
        return list;
      } catch (e) {
        console.error('Firestore getHomeworkList error, falling back to LocalStorage:', e);
        return this.getLocalHomeworkList();
      }
    } else {
      return this.getLocalHomeworkList();
    }
  },

  // Get locally stored homework
  getLocalHomeworkList(): Homework[] {
    try {
      const items = localStorage.getItem('HW_ITEMS');
      return items ? JSON.parse(items) : SEED_HOMEWORK;
    } catch (e) {
      return SEED_HOMEWORK;
    }
  },

  // Add homework
  async addHomework(hw: Omit<Homework, 'id' | 'createdAt'>): Promise<Homework> {
    const newHw: Homework = {
      ...hw,
      id: '',
      createdAt: new Date().toISOString()
    };

    if (this.isUsingRealFirebase()) {
      try {
        const docRef = await addDoc(collection(db, 'homework'), {
          subject: hw.subject,
          title: hw.title,
          description: hw.description,
          dueDate: hw.dueDate,
          createdAt: newHw.createdAt,
          teacherEmail: hw.teacherEmail,
          teacherName: hw.teacherName,
          priority: hw.priority
        });
        newHw.id = docRef.id;
        return newHw;
      } catch (e) {
        console.error('Firestore addHomework error, falling back to LocalStorage:', e);
        return this.addLocalHomework(hw);
      }
    } else {
      return this.addLocalHomework(hw);
    }
  },

  addLocalHomework(hw: Omit<Homework, 'id' | 'createdAt'>): Homework {
    const list = this.getLocalHomeworkList();
    const newHw: Homework = {
      ...hw,
      id: 'hw-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    list.push(newHw);
    localStorage.setItem('HW_ITEMS', JSON.stringify(list));
    return newHw;
  },

  // Delete homework
  async deleteHomework(id: string): Promise<void> {
    if (this.isUsingRealFirebase()) {
      try {
        await deleteDoc(doc(db, 'homework', id));
      } catch (e) {
        console.error('Firestore deleteHomework error, falling back to LocalStorage:', e);
        this.deleteLocalHomework(id);
      }
    } else {
      this.deleteLocalHomework(id);
    }
  },

  deleteLocalHomework(id: string): void {
    let list = this.getLocalHomeworkList();
    list = list.filter(item => item.id !== id);
    localStorage.setItem('HW_ITEMS', JSON.stringify(list));

    // Also clean up completions
    try {
      const completionsStr = localStorage.getItem('HW_COMPLETIONS') || '{}';
      const completions = JSON.parse(completionsStr);
      delete completions[id];
      localStorage.setItem('HW_COMPLETIONS', JSON.stringify(completions));
    } catch (e) {}
  },

  // Get completed status for a user
  async getCompletedStatus(userUid: string): Promise<Record<string, boolean>> {
    if (this.isUsingRealFirebase() && userUid) {
      try {
        const userDocRef = doc(db, 'users', userUid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          return userData.completedHomework || {};
        }
        return {};
      } catch (e) {
        console.error('Firestore getCompletedStatus error, using LocalStorage:', e);
        return this.getLocalCompletedStatus(userUid);
      }
    } else {
      return this.getLocalCompletedStatus(userUid);
    }
  },

  getLocalCompletedStatus(userUid: string): Record<string, boolean> {
    try {
      const completionsStr = localStorage.getItem('HW_COMPLETIONS') || '{}';
      const completions = JSON.parse(completionsStr);
      return completions[userUid] || {};
    } catch (e) {
      return {};
    }
  },

  // Toggle completed status for a user
  async toggleCompleteHomework(homeworkId: string, userUid: string, isCompleted: boolean): Promise<Record<string, boolean>> {
    if (this.isUsingRealFirebase() && userUid) {
      try {
        const userDocRef = doc(db, 'users', userUid);
        const userSnap = await getDoc(userDocRef);
        let completedHomework: Record<string, boolean> = {};
        
        if (userSnap.exists()) {
          completedHomework = userSnap.data().completedHomework || {};
        }

        if (isCompleted) {
          completedHomework[homeworkId] = true;
        } else {
          delete completedHomework[homeworkId];
        }

        await setDoc(userDocRef, { completedHomework }, { merge: true });
        return completedHomework;
      } catch (e) {
        console.error('Firestore toggleCompleteHomework error, using LocalStorage:', e);
        return this.toggleLocalCompleteHomework(homeworkId, userUid, isCompleted);
      }
    } else {
      return this.toggleLocalCompleteHomework(homeworkId, userUid, isCompleted);
    }
  },

  toggleLocalCompleteHomework(homeworkId: string, userUid: string, isCompleted: boolean): Record<string, boolean> {
    try {
      const completionsStr = localStorage.getItem('HW_COMPLETIONS') || '{}';
      const completions = JSON.parse(completionsStr);
      
      if (!completions[userUid]) {
        completions[userUid] = {};
      }

      if (isCompleted) {
        completions[userUid][homeworkId] = true;
      } else {
        delete completions[userUid][homeworkId];
      }

      localStorage.setItem('HW_COMPLETIONS', JSON.stringify(completions));
      return completions[userUid];
    } catch (e) {
      return {};
    }
  }
};
