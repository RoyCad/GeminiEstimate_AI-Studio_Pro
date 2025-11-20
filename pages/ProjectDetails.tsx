
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '../router';
import { ArrowLeft, MapPin, Plus, Save, Printer, Trash2, Edit, FileText, Calendar, DollarSign, User, Briefcase, Receipt, Users, Wallet, TrendingUp, TrendingDown, Building, BarChart, PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { StructuralPart, PartType, UserRole, PaymentTransaction, DailyAttendance } from '../types';
import { calculatePartMaterials, aggregateMaterials } from '../services/calculatorService';
import { GenericCalculatorForm } from '../components/CalculatorForms';
import { InvoiceReport, FullEstimationReport } from '../components/ProjectReports';
import { useProject } from '../hooks/useFirestore';
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { NeuCard, NeuButton, NeuInput, NeuSelect } from '../components/Neu';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, loading: projectLoading } = useProject(id);
  const { role } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'structural' | 'labor' | 'finance' | 'reports'>('structural');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartType, setSelectedPartType] = useState<PartType>('column');
  const [newPartData, setNewPartData] = useState<any>({});
  const [partName, setPartName] = useState('');
  
  // Sub-collections state
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [attendances, setAttendances] = useState<DailyAttendance[]>([]);

  // Form states
  const [transForm, setTransForm] = useState({ type: 'Payment', amount: '', description: '', category: 'Installment' });
  const [laborForm, setLaborForm] = useState({ laborers: '', wage: '' });

  // Listen to sub-collections
  useEffect(() => {
      if(!id) return;
      
      const unsubTrans = onSnapshot(query(collection(firestore, `projects/${id}/transactions`), orderBy('date', 'desc')), (snap) => {
          setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentTransaction)));
      });

      const unsubAtt = onSnapshot(query(collection(firestore, `projects/${id}/dailyAttendances`), orderBy('date', 'desc')), (snap) => {
          setAttendances(snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyAttendance)));
      });

      return () => { unsubTrans(); unsubAtt(); }
  }, [id]);


  if (projectLoading) return <div className="h-full w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>;
  if (!project) return <div className="p-10 text-center text-slate-400">Project not found</div>;

  const totalMaterials = project.parts ? aggregateMaterials(project.parts) : {};
  
  // --- Labor Calculations ---
  const totalLaborCost = attendances.reduce((acc, curr) => acc + (curr.numberOfLaborers * curr.wagePerLaborer), 0);
  // Filter expenses specifically categorized as 'Labor'
  const totalLaborPaid = transactions
    .filter(t => t.type === 'Expense' && t.category === 'Labor')
    .reduce((acc, t) => acc + t.amount, 0);
  const laborDue = totalLaborCost - totalLaborPaid;

  const handleAddPart = async () => {
    if (!partName) return;
    const newPart: StructuralPart = {
        id: Date.now().toString(),
        name: partName,
        type: selectedPartType,
        data: newPartData
    };
    
    await updateDoc(doc(firestore, 'projects', id), {
        parts: arrayUnion(newPart)
    });
    
    setIsAddModalOpen(false);
    setPartName('');
  };

  const handleDeletePart = async (part: StructuralPart) => {
     await updateDoc(doc(firestore, 'projects', id), {
        parts: arrayRemove(part)
     });
  };
  
  const handleAddTransaction = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!transForm.amount || !transForm.description) return;

      await addDoc(collection(firestore, `projects/${id}/transactions`), {
          projectId: id,
          amount: Number(transForm.amount),
          description: transForm.description,
          type: transForm.type,
          category: transForm.category,
          date: Timestamp.now()
      });
      setTransForm({ type: 'Payment', amount: '', description: '', category: 'Installment' });
  };

  const handleAddAttendance = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!laborForm.laborers || !laborForm.wage) return;

      await addDoc(collection(firestore, `projects/${id}/dailyAttendances`), {
          projectId: id,
          numberOfLaborers: Number(laborForm.laborers),
          wagePerLaborer: Number(laborForm.wage),
          date: Timestamp.now()
      });
      setLaborForm({ laborers: '', wage: '' });
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-200">{project.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium pl-14">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-cyan-500" /> {project.location}</span>
                <span className="flex items-center gap-2"><User size={16} className="text-purple-500" /> {project.clientName}</span>
                <span className="flex items-center gap-2"><Briefcase size={16} className="text-emerald-500" /> {project.projectNumber}</span>
            </div>
          </div>
          <div className="flex gap-3 pl-14 md:pl-0 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              {['structural', 'labor', 'finance', 'reports'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)} 
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-400 ring-1 ring-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:bg-white/5'}`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
          </div>
      </div>

       {activeTab === 'structural' && (
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="xl:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-slate-200 text-xl flex items-center gap-2"><Building className="text-cyan-400" size={20} /> Components</h3>
                     {role === UserRole.ADMIN && (
                        <NeuButton primary onClick={() => setIsAddModalOpen(true)} className="!py-2 !px-4 text-sm gap-2">
                            <Plus size={16} /> Add Part
                        </NeuButton>
                     )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {!project.parts || project.parts.length === 0 ? (
                        <NeuCard className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><Building size={32} className="opacity-20"/></div>
                            No structural parts added yet.
                        </NeuCard>
                    ) : (
                        project.parts.map((part) => {
                            const mats = calculatePartMaterials(part);
                            return (
                            <NeuCard key={part.id} className="p-6 group hover:border-white/20 transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                                            <h4 className="font-bold text-xl text-slate-200">{part.name}</h4>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-6 mt-1 block">{part.type}</span>
                                    </div>
                                    {role === UserRole.ADMIN && (
                                        <button onClick={() => handleDeletePart(part)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {Object.entries(mats).slice(0, 4).map(([k, v]) => (
                                        <div key={k} className="bg-black/20 rounded-xl p-3 border border-white/5">
                                            <span className="text-slate-500 text-[10px] uppercase font-bold block truncate mb-1" title={k}>{k.split('(')[0]}</span>
                                            <span className="font-mono font-bold text-slate-300 text-sm">{v as React.ReactNode}</span>
                                        </div>
                                    ))}
                                </div>
                            </NeuCard>
                        )})
                    )}
                </div>
            </div>
            
             <div className="space-y-6">
                 <NeuCard className="p-6 sticky top-8 border-cyan-500/20">
                    <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-2 text-lg border-b border-white/5 pb-4">
                        <FileText size={20} className="text-cyan-400" /> Material Summary
                    </h3>
                    <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-2">
                        {Object.entries(totalMaterials).length > 0 ? Object.entries(totalMaterials).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-sm items-center p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                <span className="text-slate-400 font-medium truncate max-w-[180px] group-hover:text-slate-200 transition-colors" title={key}>{key}</span>
                                <span className="font-mono font-bold text-emerald-400 text-base bg-emerald-400/10 px-2 py-1 rounded-lg">{val as React.ReactNode}</span>
                            </div>
                        )) : <p className="text-sm text-slate-500 italic text-center py-4">No materials calculated yet.</p>}
                    </div>
                 </NeuCard>
            </div>
           </div>
       )}

       {activeTab === 'finance' && (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-8">
                    <NeuCard className="p-8 bg-gradient-to-br from-[#1e2126] to-[#131518]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl text-slate-200 flex items-center gap-2">
                                <Wallet className="text-emerald-400" /> Financials
                            </h3>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Received</p>
                                <p className="text-3xl font-black text-emerald-400 drop-shadow-lg">
                                    ৳ {transactions.filter(t => t.type === 'Payment').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        
                        {role === UserRole.ADMIN && (
                            <form onSubmit={handleAddTransaction} className="mb-8 bg-black/20 p-6 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end shadow-inner">
                                <div className="sm:col-span-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2 ml-1">Type</label>
                                    <NeuSelect value={transForm.type} onChange={(e) => setTransForm({...transForm, type: e.target.value})}>
                                        <option value="Payment">Income (In)</option>
                                        <option value="Expense">Expense (Out)</option>
                                    </NeuSelect>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2 ml-1">Category</label>
                                    <NeuSelect value={transForm.category} onChange={(e) => setTransForm({...transForm, category: e.target.value})}>
                                        {transForm.type === 'Payment' ? (
                                            <>
                                                <option value="Installment">Installment</option>
                                                <option value="Advance">Advance</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Material">Material</option>
                                                <option value="Labor">Labor Payment</option>
                                                <option value="Miscellaneous">Miscellaneous</option>
                                            </>
                                        )}
                                    </NeuSelect>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2 ml-1">Amount</label>
                                    <NeuInput 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={transForm.amount} 
                                        onChange={(e) => setTransForm({...transForm, amount: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2 ml-1">Note</label>
                                    <NeuInput 
                                        type="text" 
                                        placeholder="Description" 
                                        value={transForm.description}
                                        onChange={(e) => setTransForm({...transForm, description: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="sm:col-span-12">
                                    <NeuButton primary type="submit" className="w-full h-[46px] !rounded-xl flex items-center justify-center gap-2">
                                        <Plus size={18} /> Record Transaction
                                    </NeuButton>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {transactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl border border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${t.type === 'Payment' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {t.type === 'Payment' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-300 group-hover:text-white transition-colors">{t.description}</p>
                                            <div className="flex gap-2 items-center mt-0.5">
                                                <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-slate-400 uppercase">{t.category}</span>
                                                <span className="text-xs text-slate-500 font-mono">{t.date && new Date((t.date as any).seconds * 1000).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-bold text-lg ${t.type === 'Payment' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {t.type === 'Payment' ? '+' : '-'} {t.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            {transactions.length === 0 && <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-2"><Wallet size={32} className="opacity-20"/><p>No transactions recorded.</p></div>}
                        </div>
                    </NeuCard>
                </div>

                {/* Invoice Preview */}
                <InvoiceReport project={project} transactions={transactions} />
           </div>
       )}

       {activeTab === 'labor' && (
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="xl:col-span-2 space-y-8">
                    <NeuCard className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl text-slate-200 flex items-center gap-2">
                                <Users className="text-cyan-400" /> Daily Attendance
                            </h3>
                        </div>
                        
                        {role === UserRole.ADMIN && (
                            <form onSubmit={handleAddAttendance} className="mb-8 bg-black/20 p-6 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end shadow-inner">
                                <div className="sm:col-span-4">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2 ml-1">Laborers Count</label>
                                    <NeuInput 
                                        name="laborers" 
                                        type="number" 
                                        placeholder="Count"
                                        value={laborForm.laborers}
                                        onChange={(e) => setLaborForm({...laborForm, laborers: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="sm:col-span-5">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2 ml-1">Wage per Person</label>
                                    <NeuInput 
                                        name="wage" 
                                        type="number" 
                                        placeholder="800" 
                                        value={laborForm.wage}
                                        onChange={(e) => setLaborForm({...laborForm, wage: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <NeuButton primary type="submit" className="w-full h-[46px] !rounded-xl flex items-center justify-center text-sm">
                                        Log Day
                                    </NeuButton>
                                </div>
                            </form>
                        )}
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {attendances.map(att => (
                                <div key={att.id} className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl border border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex flex-col items-center justify-center text-slate-400 shadow-inner">
                                            <span className="text-[10px] uppercase font-bold">{att.date && new Date((att.date as any).seconds * 1000).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-white leading-none">{att.date && new Date((att.date as any).seconds * 1000).getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 text-lg">{att.numberOfLaborers} <span className="text-sm font-medium text-slate-500">Workers</span></p>
                                            <p className="text-xs text-cyan-400 font-bold">@{att.wagePerLaborer} BDT/day</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono font-black text-xl text-slate-200 block">
                                            ৳ {(att.numberOfLaborers * att.wagePerLaborer).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Daily Total</span>
                                    </div>
                                </div>
                            ))}
                            {attendances.length === 0 && <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-2"><Calendar size={32} className="opacity-20"/><p>No attendance records found.</p></div>}
                        </div>
                    </NeuCard>
                </div>
                
                <div className="space-y-6">
                    <NeuCard className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/20 sticky top-8">
                        <h3 className="font-bold text-xl text-slate-200 mb-6 flex items-center gap-2">
                            <BarChart className="text-cyan-400" /> Labor Financials
                        </h3>
                        <div className="space-y-4">
                            <div className="p-5 bg-black/20 rounded-2xl border border-white/5">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Bill Generated</p>
                                <p className="text-2xl font-black text-white">
                                    ৳ {totalLaborCost.toLocaleString()}
                                </p>
                                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                    <CheckCircle size={12}/> Based on daily logs
                                </div>
                            </div>
                            
                            <div className="p-5 bg-black/20 rounded-2xl border border-white/5">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Paid to Labor</p>
                                <p className="text-2xl font-black text-emerald-400">
                                    ৳ {totalLaborPaid.toLocaleString()}
                                </p>
                                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                    <Wallet size={12}/> From Expenses
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl border ${laborDue > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Current Due</p>
                                <p className={`text-3xl font-black ${laborDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    ৳ {laborDue.toLocaleString()}
                                </p>
                                {laborDue > 0 && role === 'Admin' && (
                                    <p className="mt-2 text-xs text-red-300 flex items-center gap-1">
                                        <AlertCircle size={12}/> Payment Required
                                    </p>
                                )}
                            </div>
                        </div>
                    </NeuCard>
                </div>
           </div>
       )}
       
       {activeTab === 'reports' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <FullEstimationReport project={project} />
           </div>
       )}

       {/* Add Part Modal */}
       {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
            <NeuCard className="w-full max-w-2xl max-h-[90vh] flex flex-col !p-0 overflow-hidden border border-white/10 shadow-2xl bg-[#1e2126]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2"><PlusCircle className="text-cyan-400"/> Add Structural Part</h2>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">✕</button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Part Type</label>
                            <NeuSelect 
                                value={selectedPartType} 
                                onChange={(e) => setSelectedPartType(e.target.value as PartType)}
                            >
                                <option value="column">Column</option>
                                <option value="beam">Floor Beam</option>
                                <option value="slab">Slab / Roof</option>
                                <option value="pile">Pile</option>
                                <option value="pile-cap">Pile Cap</option>
                                <option value="brickwork">Brickwork</option>
                                <option value="earthwork">Earthwork</option>
                                <option value="grade-beam">Grade Beam</option>
                                <option value="short-column">Short Column</option>
                                <option value="mat-foundation">Mat Foundation</option>
                                <option value="combined-footing">Combined Footing</option>
                                <option value="standalone-footing">Standalone Footing</option>
                                <option value="staircase">Staircase</option>
                                <option value="retaining-wall">Retaining Wall</option>
                                <option value="cc-casting">CC Casting</option>
                            </NeuSelect>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Name / Location</label>
                             <NeuInput placeholder="e.g. Ground Floor Columns" value={partName} onChange={e => setPartName(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 shadow-inner">
                        <h4 className="font-bold text-sm text-cyan-400 mb-6 uppercase tracking-wider flex items-center gap-2"><Edit size={14} /> Parameters</h4>
                        <GenericCalculatorForm type={selectedPartType} onChange={setNewPartData} />
                    </div>
                </div>
                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                    <NeuButton onClick={() => setIsAddModalOpen(false)}>Cancel</NeuButton>
                    <NeuButton primary onClick={handleAddPart}>Save Part</NeuButton>
                </div>
            </NeuCard>
        </div>
      )}
    </div>
  );
};
