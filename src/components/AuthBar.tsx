import { useState } from 'react';
import { User } from '../types';
import { auth, googleProvider, isConfigValid, activeConfig } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Database, 
  Settings, 
  Check, 
  Sparkles, 
  HelpCircle,
  Mail,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface AuthBarProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isFirebaseActive: boolean;
}

export default function AuthBar({ currentUser, setCurrentUser, isFirebaseActive }: AuthBarProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(activeConfig.apiKey || '');
  const [tempAppId, setTempAppId] = useState(activeConfig.appId || '');
  const [configSaved, setConfigSaved] = useState(false);

  // Authenticate with Google (Real Firebase)
  const handleGoogleSignIn = async () => {
    if (!isConfigValid || !auth) {
      alert('Firebase ยังไม่ได้ระบุ API Key กรุณาใช้ปุ่มจำลองการเข้าสู่ระบบด้านล่าง หรือกรอกการตั้งค่า Firebase');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isAdmin = user.email === 'uraiwan@srn.ac.th';
      
      setCurrentUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'ผู้ใช้งาน',
        photoURL: user.photoURL || undefined,
        isAdmin
      });
    } catch (e: any) {
      console.error('Google Sign In Error:', e);
      alert(`ไม่สามารถเข้าสู่ระบบด้วย Google ได้: ${e.message}`);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    if (isFirebaseActive && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error('Firebase sign out error:', e);
      }
    }
    setCurrentUser(null);
  };

  // Simulate Sign In (For testing & offline preview)
  const simulateSignIn = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setCurrentUser({
        uid: 'simulated-teacher-123',
        email: 'uraiwan@srn.ac.th',
        displayName: 'คุณครูอุไรวรรณ (Admin)',
        isAdmin: true
      });
    } else {
      setCurrentUser({
        uid: 'simulated-student-555',
        email: 'student.somchai@school.ac.th',
        displayName: 'สมชาย รักเรียน',
        isAdmin: false
      });
    }
  };

  // Save customized config
  const saveCustomConfig = () => {
    if (!tempApiKey.trim()) {
      alert('กรุณากรอก API Key ของ Firebase');
      return;
    }
    const newConfig = {
      apiKey: tempApiKey.trim(),
      authDomain: "listening1.firebaseapp.com",
      projectId: "listening1",
      storageBucket: "listening1.appspot.com",
      messagingSenderId: "messaging-sender-id",
      appId: tempAppId.trim() || "app-id"
    };
    
    localStorage.setItem('CUSTOM_FIREBASE_CONFIG', JSON.stringify(newConfig));
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      window.location.reload();
    }, 1500);
  };

  const clearCustomConfig = () => {
    localStorage.removeItem('CUSTOM_FIREBASE_CONFIG');
    window.location.reload();
  };

  return (
    <div id="auth-bar-header" className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                สมุดจดการบ้านดิจิทัล
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Digital Homework Board for School</p>
            </div>
          </div>
        </div>

        {/* Right: Authentication Control / User Profile */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Firebase Connection Status Badge */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
              isFirebaseActive
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/60 hover:bg-amber-900/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {isFirebaseActive ? "Firebase 'Listening1' เชื่อมต่อแล้ว" : "โหมดทดสอบ (LocalStorage)"}
            </span>
            <Settings className="w-3 h-3 opacity-60 ml-1" />
          </button>

          {/* User Section */}
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/50 p-1.5 pr-3.5 rounded-xl">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  currentUser.isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {currentUser.displayName.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-100 truncate max-w-[140px]">
                  {currentUser.displayName}
                </p>
                <div className="flex items-center gap-1">
                  {currentUser.isAdmin ? (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium border border-amber-500/20 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      คุณครู (Admin)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-medium border border-indigo-500/20">
                      นักเรียน
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-3 p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition-all cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Google login Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={!isConfigValid}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Dropdown: Simulation & Custom Configuration Panel */}
      {!currentUser && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>เนื่องจากรันใน iFrame Sandbox หรือไม่มีคีย์: สามารถใช้<strong>ปุ่มเข้าสู่ระบบจำลอง</strong>ด้านล่างเพื่อทดสอบได้ทันที:</span>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => simulateSignIn('admin')}
              className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 hover:text-amber-300 border border-amber-500/20 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              👑 ล็อกอินจำลอง: คุณครูอุไรวรรณ (Admin)
            </button>
            <button
              onClick={() => simulateSignIn('student')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              🎓 ล็อกอินจำลอง: นักเรียนทั่วไป
            </button>
          </div>
        </div>
      )}

      {/* Firebase Config Panel Slider */}
      {showConfig && (
        <div className="mt-4 pt-4 border-t border-slate-800 text-slate-300 space-y-4 animate-slide-down">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-indigo-400">
                <Database className="w-4 h-4" />
                เชื่อมต่อระบบของคุณเข้ากับ Firebase Firestore ('Listening1')
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              คุณสามารถระบุ Firebase Config จากโปรเจกต์ <strong>Listening1</strong> ของคุณเพื่อใช้งานระบบฐานข้อมูลและ Authentication จริงบนคลาวด์ได้ทันที ค่าเหล่านี้จะถูกจัดเก็บอย่างปลอดภัยเฉพาะในบราวเซอร์ของคุณ (LocalStorage):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-400 font-medium font-mono">VITE_FIREBASE_API_KEY</label>
                <input
                  type="password"
                  placeholder="เช่น AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-medium font-mono">VITE_FIREBASE_APP_ID</label>
                <input
                  type="text"
                  placeholder="เช่น 1:412622050092:web:..."
                  value={tempAppId}
                  onChange={(e) => setTempAppId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>ตัวแปรอื่นๆ (Project ID) ถูกกำหนดเป็น 'listening1' โดยอัตโนมัติ</span>
              </div>
              <div className="flex gap-2">
                {localStorage.getItem('CUSTOM_FIREBASE_CONFIG') && (
                  <button
                    onClick={clearCustomConfig}
                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 text-red-400 text-xs font-medium rounded-lg cursor-pointer transition-all"
                  >
                    ล้างการตั้งค่าเดิม
                  </button>
                )}
                <button
                  onClick={saveCustomConfig}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-1"
                >
                  {configSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      บันทึกสำเร็จ (กำลังรีโหลด)...
                    </>
                  ) : (
                    "บันทึกและรีเฟรชหน้าเว็บ"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
