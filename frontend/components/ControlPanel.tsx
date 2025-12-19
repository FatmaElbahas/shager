import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { getNameMeaning } from '../services/geminiService';
import { Loader2, Sparkles, UserPlus, Info, Trash2, X } from 'lucide-react';

interface ControlPanelProps {
  onAddMember: (name: string, age: string) => void;
  onDeleteMember: () => void;
  selectedMember: FamilyMember | null;
  onClose?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onAddMember, onDeleteMember, selectedMember, onClose }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [geminiMeaning, setGeminiMeaning] = useState<string | null>(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;
    onAddMember(name, age);
    setName('');
    setAge('');
  };

  const handleAskGemini = async () => {
    if (!selectedMember) return;
    setLoadingGemini(true);
    setGeminiMeaning(null);
    const meaning = await getNameMeaning(selectedMember.name);
    setGeminiMeaning(meaning);
    setLoadingGemini(false);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    await onDeleteMember();
    setDeleting(false);
  };

  return (
    <div className="w-full md:w-80 bg-white/90 backdrop-blur-md shadow-2xl border-l border-stone-200 p-6 flex flex-col h-full overflow-y-auto relative z-20">
      {/* Close button for mobile panel */}
      {onClose && (
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          <X size={20} className="text-stone-600" />
        </button>
      )}
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-emerald-800 drop-shadow-sm mb-2">شجرة العائلة</h2>
        <p className="text-stone-500 text-sm">أضف أفراد عائلتك وشاهد شجرتك تنمو</p>
      </div>

      {/* Add Member Form */}
      <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-emerald-600" />
          إدارة الأفراد
        </h3>
        
        {!selectedMember ? (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100 flex items-start gap-2">
            <Info size={16} className="mt-1 flex-shrink-0" />
            <p>يرجى اختيار (النقر على) الأب أو الأم من الشجرة لإضافة ابن لهما أو لحذفه.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="text-sm text-stone-500 mb-2">
                إضافة ابن لـ: <span className="font-bold text-emerald-700">{selectedMember.name}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  dir="auto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">السن</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="مثال: 25"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!name || !age}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                <UserPlus size={18} />
                إضافة للشجرة
              </button>
            </form>

            <div className="pt-4 border-t border-stone-200">
               <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleting}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-lg border border-red-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    حذف {selectedMember.name}
                  </>
                )}
              </button>
              <p className="text-xs text-stone-400 mt-2 text-center">سيتم حذف الفرد وجميع أبنائه</p>
            </div>
          </>
        )}
      </div>

      {/* Gemini AI Feature */}
      {selectedMember && (
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 shadow-sm mt-auto">
          <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" />
            معنى الاسم (AI)
          </h3>
          <p className="text-xs text-indigo-700 mb-4">
            استخدم الذكاء الاصطناعي لمعرفة معنى اسم <span className="font-bold">"{selectedMember.name}"</span>
          </p>
          
          <button
            onClick={handleAskGemini}
            disabled={loadingGemini}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mb-3"
          >
            {loadingGemini ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loadingGemini ? 'جاري التحليل...' : 'تحليل الاسم'}
          </button>

          {geminiMeaning && (
            <div className="bg-white p-3 rounded-lg border border-indigo-100 text-indigo-800 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
              {geminiMeaning}
            </div>
          )}
        </div>
      )}
    </div>
  );
};