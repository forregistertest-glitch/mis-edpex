"use client";

import { useState, useEffect } from "react";
import { StudentProgress } from "@/types/academic";
import { AcademicService } from "@/services/academicService";
import { Plus, Trash2, CheckCircle, Clock, Loader2, Calendar } from "lucide-react";

interface StudentProgressProps {
  studentId: string;
  userEmail: string;
}

export default function StudentProgressTracker({ studentId, userEmail }: StudentProgressProps) {
  const [items, setItems] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<StudentProgress>>({
    milestone_type: "QE",
    status: "Passed",
    exam_date: "",
    semester: "1",
    academic_year: new Date().getFullYear() + 543,
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [studentId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await AcademicService.getProgressByStudentId(studentId);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.milestone_type || !newItem.exam_date) return;
    
    try {
      setSubmitting(true);
      await AcademicService.addProgress({
        ...newItem,
        student_id: studentId,
      } as StudentProgress, userEmail);
      
      setIsAdding(false);
      setNewItem({
        milestone_type: "QE",
        status: "Passed",
        exam_date: "",
        semester: "1",
        academic_year: new Date().getFullYear() + 543,
        description: ""
      });
      fetchItems();
    } catch (error) {
      alert("Failed to add progress");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this milestone?")) return;
    try {
      await AcademicService.deleteProgress(id, userEmail);
      setItems(prev => prev.filter(p => p.id !== id));
    } catch (error) {
       alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="text-orange-600" size={20} />
          Academic Progress (Milestones)
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1 font-medium"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Milestone</label>
               <select 
                 value={newItem.milestone_type}
                 onChange={e => setNewItem({...newItem, milestone_type: e.target.value as any})}
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
               >
                 <option value="QE">Qualifying Exam</option>
                 <option value="Proposal">Proposal Defense</option>
                 <option value="Defense">Thesis Defense</option>
                 <option value="English">English Test</option>
                 <option value="Ethics">Ethics Exam</option>
                 <option value="Other">Other</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
               <select 
                 value={newItem.status}
                 onChange={e => setNewItem({...newItem, status: e.target.value as any})}
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
               >
                 <option value="Passed">Passed</option>
                 <option value="Failed">Failed</option>
                 <option value="Pending">Pending</option>
                 <option value="In Progress">In Progress</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
               <input 
                 required
                 type="date" 
                 value={newItem.exam_date}
                 onChange={e => setNewItem({...newItem, exam_date: e.target.value})}
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Semester/Year</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newItem.semester}
                   onChange={e => setNewItem({...newItem, semester: e.target.value})}
                   className="w-1/3 p-2 border border-slate-200 rounded-lg text-sm"
                   placeholder="Sem"
                 />
                 <input 
                   type="number" 
                   value={newItem.academic_year}
                   onChange={e => setNewItem({...newItem, academic_year: Number(e.target.value)})}
                   className="w-2/3 p-2 border border-slate-200 rounded-lg text-sm"
                   placeholder="Year (BE)"
                 />
               </div>
             </div>
             <div className="md:col-span-2">
               <label className="block text-xs font-medium text-slate-500 mb-1">Note</label>
               <input 
                 type="text" 
                 value={newItem.description}
                 onChange={e => setNewItem({...newItem, description: e.target.value})}
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                 placeholder="Additional details..."
               />
             </div>
           </div>
           <div className="flex justify-end gap-2 pt-2">
             <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
             <button type="submit" disabled={submitting} className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1">
               {submitting && <Loader2 className="animate-spin" size={12} />} Save
             </button>
           </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">No milestones recorded</div>
        ) : (
           <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 py-2">
             {items.map(item => (
                <div key={item.id} className="relative pl-6 group">
                   <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                     item.status === 'Passed' ? 'bg-green-100 border-green-500' :
                     item.status === 'Failed' ? 'bg-red-100 border-red-500' :
                     'bg-gray-100 border-gray-400'
                   }`}></div>
                   <div className="bg-white p-3 border border-slate-100 rounded-lg shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">{item.milestone_type}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            item.status === 'Passed' ? 'bg-green-100 text-green-700' :
                            item.status === 'Failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{item.status}</span>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                           <Calendar size={14} /> 
                           {item.exam_date} 
                           <span className="text-slate-300">|</span> 
                           Sem {item.semester}/{item.academic_year}
                        </div>
                        {item.description && <div className="text-xs text-slate-400 mt-1 italic">{item.description}</div>}
                      </div>
                      
                      <button 
                        onClick={() => item.id && handleDelete(item.id)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
