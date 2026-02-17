"use client";

import { useState, useEffect } from "react";
import { StudentPublication } from "@/types/academic";
import { AcademicService } from "@/services/academicService";
import { Plus, Trash2, FileText, Calendar, ExternalLink, Loader2 } from "lucide-react";

interface StudentPublicationsProps {
  studentId: string;
  userEmail: string;
}

export default function StudentPublications({ studentId, userEmail }: StudentPublicationsProps) {
  const [publications, setPublications] = useState<StudentPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPub, setNewPub] = useState<Partial<StudentPublication>>({
    publication_title: "",
    journal_name: "",
    publication_date: "",
    quartile: "",
    publication_type: "Journal",
    year: new Date().getFullYear(),
    weight: 100
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, [studentId]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const data = await AcademicService.getPublicationsByStudentId(studentId);
      setPublications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPub.publication_title || !newPub.journal_name) return;
    
    try {
      setSubmitting(true);
      await AcademicService.addPublication({
        ...newPub,
        student_id: studentId,
        authors: [] // TODO: Add author management
      } as StudentPublication, userEmail);
      
      setIsAdding(false);
      setNewPub({
        publication_title: "",
        journal_name: "",
        publication_date: "",
        quartile: "",
        publication_type: "Journal",
        year: new Date().getFullYear(),
        weight: 100
      });
      fetchPublications();
    } catch (error) {
      alert("Failed to add publication");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;
    try {
      await AcademicService.deletePublication(id, userEmail);
      setPublications(prev => prev.filter(p => p.id !== id));
    } catch (error) {
       alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" size={20} />
          Publications
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 font-medium"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
               <input 
                 required
                 type="text" 
                 value={newPub.publication_title}
                 onChange={e => setNewPub({...newPub, publication_title: e.target.value})}
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                 placeholder="Paper Title"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Journal/Conference</label>
               <input 
                 required
                 type="text" 
                 value={newPub.journal_name}
                 onChange={e => setNewPub({...newPub, journal_name: e.target.value})}
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                 placeholder="Journal Name"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
               <input 
                 type="date" 
                 value={newPub.publication_date}
                 onChange={e => setNewPub({...newPub, publication_date: e.target.value})}
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm"
               />
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Quartile</label>
                  <select 
                    value={newPub.quartile}
                    onChange={e => setNewPub({...newPub, quartile: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">-</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Weight (%)</label>
                  <input 
                    type="number" 
                    value={newPub.weight}
                    onChange={e => setNewPub({...newPub, weight: Number(e.target.value)})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
             </div>
           </div>
           <div className="flex justify-end gap-2 pt-2">
             <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
             <button type="submit" disabled={submitting} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
               {submitting && <Loader2 className="animate-spin" size={12} />} Save
             </button>
           </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
        ) : publications.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">No publications found</div>
        ) : (
          publications.map(pub => (
            <div key={pub.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800 leading-tight mb-1">{pub.publication_title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{pub.journal_name} {pub.quartile && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold ml-2">{pub.quartile}</span>}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {pub.publication_date || pub.year}</span>
                      <span>Weight: {pub.weight}%</span>
                      <span className="uppercase tracking-wide">{pub.publication_type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => pub.id && handleDelete(pub.id)}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
