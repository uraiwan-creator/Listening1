import React, { useState } from 'react';
import { SUBJECTS, Homework } from '../types';
import { Plus, Calendar, AlertCircle, Sparkles, Check } from 'lucide-react';

interface TeacherDashboardProps {
  onAddHomework: (homework: Omit<Homework, 'id' | 'createdAt'>) => Promise<void>;
  teacherEmail: string;
  teacherName: string;
}

export default function TeacherDashboard({ onAddHomework, teacherEmail, teacherName }: TeacherDashboardProps) {
  const [subject, setSubject] = useState('คณิตศาสตร์');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณากรอกหัวข้อการบ้าน');
      return;
    }
    if (!description.trim()) {
      setError('กรุณากรอกรายละเอียดการบ้าน');
      return;
    }
    if (!dueDate) {
      setError('กรุณาเลือกวันที่กำหนดส่ง');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onAddHomework({
        subject,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        teacherEmail,
        teacherName,
        priority
      });

      // Clear form on success
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="teacher-dashboard-panel" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">เพิ่มการบ้านใหม่</h2>
            <p className="text-xs text-slate-400 mt-0.5">ระบุการบ้านและกำหนดส่งให้สำหรับนักเรียนทุกคนในชั้นเรียน</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span className="text-xs text-indigo-700 font-medium font-mono">โหมดคุณครู</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm animate-fade-in">
            <Check className="w-4 h-4 flex-shrink-0 bg-emerald-100 rounded-full p-0.5" />
            <span>เพิ่มการบ้านเรียบร้อยแล้ว! รายการจะแสดงในบอร์ดทันที</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-600">วิชาหลัก</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm cursor-pointer"
            >
              {Object.keys(SUBJECTS).map((subKey) => (
                <option key={subKey} value={subKey}>
                  {subKey}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-600">ความสำคัญ / ระดับความเร่งด่วน</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'ปกติ (สีเขียว)', color: 'border-emerald-200 text-emerald-700 active:bg-emerald-50 active-ring:ring-emerald-500/20 bg-slate-50' },
                { value: 'medium', label: 'ปานกลาง (สีน้ำเงิน)', color: 'border-blue-200 text-blue-700 active:bg-blue-50 active-ring:ring-blue-500/20 bg-slate-50' },
                { value: 'high', label: 'ด่วนมาก (สีแดง)', color: 'border-rose-200 text-rose-700 active:bg-rose-50 active-ring:ring-rose-500/20 bg-slate-50' }
              ].map((p) => {
                const isActive = priority === p.value;
                let activeStyle = '';
                if (isActive) {
                  if (p.value === 'low') activeStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-medium shadow-sm';
                  if (p.value === 'medium') activeStyle = 'bg-blue-50 border-blue-500 text-blue-800 font-medium shadow-sm';
                  if (p.value === 'high') activeStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-medium shadow-sm';
                }
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as any)}
                    className={`px-3 py-3 border rounded-xl text-xs text-center transition-all ${isActive ? activeStyle : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
                  >
                    {p.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-600">หัวข้อการบ้าน</label>
          <input
            type="text"
            placeholder="เช่น แบบฝึกหัดทบทวนบทเรียน หรือ ส่งรายงานผลการทดลอง..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-600">รายละเอียดคำสั่ง / ช่องทางส่งงาน</label>
          <textarea
            rows={3}
            placeholder="อธิบายรายละเอียดการบ้าน ข้อที่ต้องทำ รวมถึงวิธีกำหนดส่ง เช่น ทำหน้า 45-48 หรือส่งผ่าน Google Classroom..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
          />
        </div>

        {/* Date Picker */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-600">วันที่กำหนดส่ง (Due Date)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm cursor-pointer"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>กำลังบันทึกข้อมูลการบ้าน...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>เพิ่มการบ้านใหม่เข้าบอร์ด</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
