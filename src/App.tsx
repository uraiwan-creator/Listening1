import { useState, useEffect } from 'react';
import { Homework, User } from './types';
import { firebaseService } from './lib/firebaseService';
import { auth, isConfigValid } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthBar from './components/AuthBar';
import TeacherDashboard from './components/TeacherDashboard';
import StudentView from './components/StudentView';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  GraduationCap, 
  Users, 
  Calendar, 
  BookOpen,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isFirebaseActive = firebaseService.isUsingRealFirebase();

  // Listen to Auth State Changes (Real Firebase)
  useEffect(() => {
    if (isConfigValid && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const isAdmin = firebaseUser.email === 'uraiwan@srn.ac.th';
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'ผู้ใช้งาน Google',
            photoURL: firebaseUser.photoURL || undefined,
            isAdmin
          });
        } else {
          // Only clear if we were not already on a simulated login
          setCurrentUser(prev => prev?.uid.startsWith('simulated-') ? prev : null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Fetch Homework list and Completions when user or refreshTrigger changes
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const list = await firebaseService.getHomeworkList();
        if (active) {
          setHomeworkList(list);
        }

        if (currentUser) {
          const comps = await firebaseService.getCompletedStatus(currentUser.uid);
          if (active) {
            setCompletions(comps);
          }
        } else {
          if (active) {
            setCompletions({});
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [currentUser, refreshTrigger]);

  // Handle adding new homework
  const handleAddHomework = async (newHwData: Omit<Homework, 'id' | 'createdAt'>) => {
    await firebaseService.addHomework(newHwData);
    setRefreshTrigger(prev => prev + 1); // Trigger data re-fetch
  };

  // Handle deleting homework
  const handleDeleteHomework = async (id: string) => {
    await firebaseService.deleteHomework(id);
    setRefreshTrigger(prev => prev + 1); // Trigger data re-fetch
  };

  // Handle toggling complete status
  const handleToggleComplete = async (homeworkId: string, isCompleted: boolean) => {
    if (!currentUser) {
      alert('กรุณาลงชื่อเข้าใช้งานก่อนทำกิจกรรม เพื่อบันทึกความคืบหน้าการทำการบ้านของคุณ');
      return;
    }
    const updatedCompletions = await firebaseService.toggleCompleteHomework(
      homeworkId,
      currentUser.uid,
      isCompleted
    );
    setCompletions(updatedCompletions);
  };

  // Calculate high-fidelity stats
  const totalHW = homeworkList.length;
  const doneHW = Object.keys(completions).filter(id => homeworkList.some(h => h.id === id)).length;
  const pendingHW = totalHW - doneHW;
  const successRate = totalHW > 0 ? Math.round((doneHW / totalHW) * 100) : 0;
  const urgentHW = homeworkList.filter(h => h.priority === 'high' && !completions[h.id]).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16 antialiased">
      
      {/* Top Decoration Bar */}
      <div className="w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Auth Navigation Header */}
        <AuthBar 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          isFirebaseActive={isFirebaseActive} 
        />

        {/* Hero Section if Not Signed In */}
        {!currentUser && (
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
            {/* Ambient background blur circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/10 rounded-full text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>ยินดีต้อนรับสู่ระบบสมุดจดการบ้านดิจิทัล</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                ตัวช่วยจัดการการบ้าน ค้นหาง่าย ติดตามงานเสร็จทันเวลา 🚀
              </h2>
              <p className="text-sm sm:text-base text-indigo-100 leading-relaxed max-w-2xl">
                ระบบจัดการแบบรวมศูนย์ (Centralized Board) ที่คุณครูสามารถระบุงาน กำหนดส่ง และนักเรียนสามารถติดตาม ตรวจสอบงานค้าง และติ๊กทำเครื่องหมาย <strong>'ทำเสร็จแล้ว'</strong> เพื่ออัปเดตความก้าวหน้าของตนเองได้แบบเรียลไทม์
              </p>
              
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-indigo-100 font-medium bg-white/10 px-3.5 py-2 rounded-xl border border-white/5">
                  <GraduationCap className="w-4 h-4 text-indigo-300" />
                  <span>จัดหมวดหมู่แยกวิชาและสีสันชัดเจน</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-100 font-medium bg-white/10 px-3.5 py-2 rounded-xl border border-white/5">
                  <Clock className="w-4 h-4 text-indigo-300" />
                  <span>แสดงวันกำหนดส่ง พร้อมเคาท์ดาวน์อัจฉริยะ</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-100 font-medium bg-white/10 px-3.5 py-2 rounded-xl border border-white/5">
                  <Users className="w-4 h-4 text-indigo-300" />
                  <span>รองรับการล็อกอิน Gmail และสิทธิ์แอดมินสำหรับคุณครู</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Statistics Summary (Available to all logged-in users) */}
        {currentUser && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Stat 1: Total Homework */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">การบ้านทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-800">{totalHW}</p>
                <p className="text-[10px] text-slate-400">รายการมอบหมาย</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hidden sm:block">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 2: Pending Tasks */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">ยังไม่ได้ทำ (งานค้าง)</p>
                <p className="text-2xl font-bold text-slate-800">{pendingHW}</p>
                <div className="flex items-center gap-1">
                  {urgentHW > 0 ? (
                    <span className="text-[10px] text-rose-500 font-medium">ด่วนมาก {urgentHW} งาน ⚠️</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">ไม่มีงานเร่งด่วน</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl hidden sm:block">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 3: Completed Tasks */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">เสร็จเรียบร้อย</p>
                <p className="text-2xl font-bold text-emerald-600">{doneHW}</p>
                <p className="text-[10px] text-emerald-600">สู้ๆ ส่งงานให้ครบนะ</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hidden sm:block">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 4: Progress Rate */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-slate-400">อัตราความสำเร็จ</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">{successRate}%</p>
                </div>
                <div className="p-2 bg-slate-50 text-indigo-500 rounded-lg hidden sm:block">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Informative notice on user setup */}
        {currentUser && currentUser.email === 'uraiwan@srn.ac.th' && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">ตรวจพบสิทธิ์: คุณครูอุไรวรรณ (uraiwan@srn.ac.th)</p>
              <p className="leading-relaxed">
                เนื่องจากอีเมลของคุณตรงกับสิทธิ์แอดมินตามเงื่อนไขของระบบ คุณสามารถสร้างและเพิ่มแบบฝึกหัด/การบ้านใหม่ผ่านฟอร์มควบคุมด้านล่างได้ทันที รวมถึงมีสิทธิ์ลบรายการการบ้านที่เคยสร้างไว้ทั้งหมดออกจากบอร์ด
              </p>
            </div>
          </div>
        )}

        {/* Content Section: Dashboard Form (for Admin/Teacher) and Student Boards */}
        <div className="space-y-8">
          
          {/* 1. Teacher Dashboard Form */}
          {currentUser?.isAdmin && (
            <div className="animate-fade-in duration-300">
              <TeacherDashboard 
                onAddHomework={handleAddHomework} 
                teacherEmail={currentUser.email}
                teacherName={currentUser.displayName}
              />
            </div>
          )}

          {/* 2. Main Homework Grid List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-800">กระดานการบ้านของคุณ</h2>
                <p className="text-xs text-slate-400 mt-0.5">รวมภาระงาน แบบฝึกหัด และโปรเจกต์ที่ต้องนำส่งทั้งหมด</p>
              </div>
              {currentUser && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                  กำลังแสดง {homeworkList.length} รายการ
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลการบ้านดิจิทัล...</p>
              </div>
            ) : (
              <StudentView 
                homeworkList={homeworkList}
                completions={completions}
                onToggleComplete={handleToggleComplete}
                onDeleteHomework={handleDeleteHomework}
                isAdmin={!!currentUser?.isAdmin}
                currentUserEmail={currentUser?.email}
              />
            )}
          </div>

        </div>

      </main>

      {/* Footer credits and details */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 text-center space-y-2">
        <p className="text-xs text-slate-400 font-mono">
          © 2026 สมุดจดการบ้านดิจิทัล (Digital Homework Board) - listening1 project
        </p>
        <p className="text-[11px] text-slate-400">
          พัฒนาหน้าเว็บแบบ Single Page App ด้วยเทคโนโลยี React, Tailwind CSS และ Google Firebase Firestore Client SDK
        </p>
      </footer>
    </div>
  );
}
