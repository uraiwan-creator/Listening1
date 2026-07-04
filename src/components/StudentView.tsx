import React, { useState } from 'react';
import { Homework, SUBJECTS } from '../types';
import * as Icons from 'lucide-react';

interface StudentViewProps {
  homeworkList: Homework[];
  completions: Record<string, boolean>;
  onToggleComplete: (homeworkId: string, isCompleted: boolean) => Promise<void>;
  onDeleteHomework?: (homeworkId: string) => Promise<void>;
  isAdmin: boolean;
  currentUserEmail?: string;
}

// Function to map string to Lucide icon dynamically
const SubjectIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const IconComponent = (Icons as any)[iconName] || Icons.ClipboardList;
  return <IconComponent className={className || "w-5 h-5"} />;
};

export default function StudentView({
  homeworkList,
  completions,
  onToggleComplete,
  onDeleteHomework,
  isAdmin,
  currentUserEmail
}: StudentViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');

  // Helper to calculate days remaining
  const getDaysRemainingInfo = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        text: `เลยกำหนดส่งแล้ว ${Math.abs(diffDays)} วัน 🔴`,
        bgColor: 'bg-red-50 text-red-700 border-red-200',
        isOverdue: true,
        days: diffDays
      };
    } else if (diffDays === 0) {
      return {
        text: 'กำหนดส่งวันนี้! ⚠️',
        bgColor: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-medium',
        isOverdue: false,
        days: diffDays
      };
    } else if (diffDays === 1) {
      return {
        text: 'ส่งพรุ่งนี้! ⏰',
        bgColor: 'bg-orange-50 text-orange-700 border-orange-200 font-medium',
        isOverdue: false,
        days: diffDays
      };
    } else if (diffDays <= 3) {
      return {
        text: `เหลือเวลาอีก ${diffDays} วัน`,
        bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
        isOverdue: false,
        days: diffDays
      };
    } else {
      return {
        text: `เหลือเวลาอีก ${diffDays} วัน`,
        bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        isOverdue: false,
        days: diffDays
      };
    }
  };

  // Filter and Sort homework list
  const filteredList = homeworkList
    .filter((hw) => {
      const matchesSearch = 
        hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = selectedSubject === 'ทั้งหมด' || hw.subject === selectedSubject;
      
      const isDone = !!completions[hw.id];
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'todo' && !isDone) ||
        (statusFilter === 'done' && isDone);

      return matchesSearch && matchesSubject && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div id="student-view-panel" className="space-y-6">
      {/* Search and Filters Controller Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icons.Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อการบ้าน รายละเอียด หรือวิชา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Subject Filter Dropdown */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:inline">วิชา:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="ทั้งหมด">วิชาทั้งหมด ({homeworkList.length})</option>
              {Object.keys(SUBJECTS).map((subName) => (
                <option key={subName} value={subName}>
                  {subName} ({homeworkList.filter(h => h.subject === subName).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="lg:col-span-3 flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'todo', label: 'ยังไม่ทำ' },
              { id: 'done', label: 'เสร็จแล้ว' }
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-indigo-700 shadow-sm font-semibold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sort Controller */}
          <div className="lg:col-span-2 flex items-center justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">เรียงตาม:</span>
            <button
              onClick={() => setSortBy(sortBy === 'dueDate' ? 'createdAt' : 'dueDate')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Icons.ArrowUpDown className="w-3 h-3" />
              {sortBy === 'dueDate' ? 'วันส่งงานใกล้สุด' : 'งานที่เพิ่มล่าสุด'}
            </button>
          </div>

        </div>
      </div>

      {/* Grid of Homework Cards */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
            <Icons.ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">ไม่พบรายการการบ้าน</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือฟิลเตอร์วิชาเพื่อค้นหาใหม่อีกครั้ง
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((hw) => {
            const isDone = !!completions[hw.id];
            const subInfo = SUBJECTS[hw.subject] || SUBJECTS['อื่นๆ'];
            const dueInfo = getDaysRemainingInfo(hw.dueDate);
            const gradientClass = `card-gradient-${subInfo.color}`;

            // Set priority borders
            let priorityBadge = null;
            if (hw.priority === 'high') {
              priorityBadge = (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 rounded-md">
                  ด่วนที่สุด
                </span>
              );
            }

            return (
              <div
                key={hw.id}
                id={`homework-card-${hw.id}`}
                className={`flex flex-col relative border rounded-2xl p-5 custom-shadow transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                  isDone 
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-inner' 
                    : dueInfo.isOverdue 
                    ? 'border-red-300 bg-red-50/30' 
                    : `${gradientClass} ${subInfo.borderCol}`
                }`}
              >
                {/* Complete Watermark overlay if checked */}
                {isDone && (
                  <div className="absolute top-4 right-4 text-emerald-500 animate-scale-up">
                    <Icons.CheckCircle2 className="w-6 h-6 fill-emerald-50" />
                  </div>
                )}

                {/* Top: Badge of Subject and urgency */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${subInfo.borderCol} ${subInfo.bgLight}`}>
                    <SubjectIcon iconName={subInfo.icon} className={`w-4 h-4 ${subInfo.textCol}`} />
                    <span className={`text-xs font-semibold ${subInfo.textCol}`}>{hw.subject}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {priorityBadge}
                  </div>
                </div>

                {/* Body: Title & description */}
                <div className="flex-1 space-y-2 mb-4">
                  <h3 className={`text-base font-semibold text-slate-800 leading-snug transition-all ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {hw.title}
                  </h3>
                  <p className={`text-sm text-slate-500 leading-relaxed whitespace-pre-wrap ${isDone ? 'text-slate-400/80' : ''}`}>
                    {hw.description}
                  </p>
                </div>

                {/* Bottom section: Metadata, Deadline, and Checkbox toggle */}
                <div className="pt-4 border-t border-slate-100/80 space-y-3.5">
                  
                  {/* Due Date Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Icons.Calendar className="w-3.5 h-3.5" />
                      <span>กำหนดส่ง: <span className="font-mono">{hw.dueDate}</span></span>
                    </div>
                    
                    <span className={`px-2.5 py-1 text-xs border rounded-lg font-medium ${dueInfo.bgColor}`}>
                      {dueInfo.text}
                    </span>
                  </div>

                  {/* Teacher signature */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Icons.User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">
                      ผู้สั่ง: <span className="text-slate-600 font-medium">{hw.teacherName}</span>
                    </span>
                  </div>

                  {/* Action Section */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    
                    {/* Checkbox: Completed */}
                    <button
                      onClick={() => onToggleComplete(hw.id, !isDone)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100 hover:bg-emerald-600'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-100'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Icons.CheckSquare className="w-4 h-4" />
                          <span>ทำเสร็จเรียบร้อยแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Icons.Square className="w-4 h-4" />
                          <span>ทำเสร็จแล้ว</span>
                        </>
                      )}
                    </button>

                    {/* Delete button (If Teacher Admin or Simulated Admin) */}
                    {(isAdmin || currentUserEmail === hw.teacherEmail) && onDeleteHomework && (
                      <button
                        onClick={() => {
                          if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการบ้านรายการนี้ออกจากบอร์ด?')) {
                            onDeleteHomework(hw.id);
                          }
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all border border-red-100 cursor-pointer"
                        title="ลบการบ้าน"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
