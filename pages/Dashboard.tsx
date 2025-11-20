
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useFirestore';
import { Link, useNavigate } from '../router';
import { 
    LayoutGrid, 
    Plus, 
    Calculator, 
    Clock, 
    ArrowRight, 
    TrendingUp,
    Search,
    MoreHorizontal,
    Zap,
    History,
    FileText,
    Wallet,
    Briefcase,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { NeuButton, NeuCard, NeuInput } from '../components/Neu';
import { StatCard } from '../components/stat-card';

export const Dashboard: React.FC = () => {
  const { user, role } = useAuth();
  const { projects, loading } = useProjects(user, role);
  const navigate = useNavigate();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="w-16 h-16 rounded-full border-4 border-[#181b21] border-t-cyan-400 animate-spin shadow-[0_0_20px_rgba(45,212,191,0.3)]"></div>
        </div>
    );
  }

  // Client Dashboard Logic
  if (role === 'Client') {
      const myProject = projects[0]; // Clients typically have 1 active project
      const totalCost = myProject?.estimatedCost || 0;
      const totalPaid = myProject?.transactions?.filter(t => t.type === 'Payment').reduce((acc, t) => acc + t.amount, 0) || 0;
      const due = totalCost - totalPaid;

      return (
        <div className="animate-fade-in pb-10 max-w-[1200px] mx-auto">
            {/* Client Header */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-display font-black text-white">Welcome, {user?.displayName}</h1>
                    <p className="text-slate-500 font-medium mt-1">Here is the latest update on your project.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#181b21] p-[2px] shadow-neu-flat">
                     <img src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client'} alt="User" className="rounded-full w-full h-full object-cover" />
                </div>
            </div>

            {myProject ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Project Hero Card */}
                    <div className="lg:col-span-2">
                         <NeuCard className="h-full p-8 flex flex-col justify-between relative overflow-hidden !rounded-[2.5rem] border-t border-white/5 bg-gradient-to-br from-[#1e2126] to-[#131519]">
                            <div className="z-10 relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                        {myProject.status}
                                    </span>
                                    <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                                        <ShieldCheck size={12} /> Verified Project
                                    </span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2">{myProject.name}</h2>
                                <p className="text-slate-400 font-medium text-lg max-w-md">{myProject.location}</p>
                            </div>
                            
                            <div className="z-10 relative mt-12">
                                <div className="flex gap-4">
                                    <NeuButton primary onClick={() => navigate(`/projects/${myProject.id}`)}>
                                        View Full Details <ArrowRight size={18} />
                                    </NeuButton>
                                    <NeuButton onClick={() => window.print()}>Download Report</NeuButton>
                                </div>
                            </div>

                             {/* Abstract BG shapes */}
                            <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
                         </NeuCard>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="flex flex-col gap-6">
                        <NeuCard className="flex-1 p-6 flex flex-col justify-center items-center text-center border-l-4 border-emerald-400">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Paid</p>
                            <h3 className="text-3xl font-black text-emerald-400">৳ {totalPaid.toLocaleString()}</h3>
                        </NeuCard>
                         <NeuCard className="flex-1 p-6 flex flex-col justify-center items-center text-center border-l-4 border-rose-400">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Due</p>
                            <h3 className="text-3xl font-black text-rose-400">৳ {due.toLocaleString()}</h3>
                        </NeuCard>
                    </div>
                </div>
            ) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                    <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold text-slate-400">No Active Projects</h3>
                    <p>Contact your administrator to link a project to your account.</p>
                </div>
            )}
        </div>
      );
  }

  // Admin Dashboard Logic (Siri Layout)
  const pendingProjects = projects.filter(p => p.status !== 'Completed').length;

  return (
    <div className="animate-fade-in pb-10 max-w-[1600px] mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-5 self-start">
            <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-[#1e2126] to-[#131519] shadow-neu-flat flex items-center justify-center border border-white/[0.02]">
                 <LayoutGrid className="text-cyan-400 w-7 h-7 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
            </div>
            <div>
                <h1 className="text-2xl font-display font-black text-white tracking-tight">
                    PREDICT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">PRO</span>
                </h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Admin Console</p>
            </div>
        </div>
        
        <div className="flex items-center gap-6 w-full md:w-auto">
             <div className="relative group flex-1 md:w-96">
                <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <NeuInput 
                    placeholder="Search projects..." 
                    className="!pl-12"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors">
                    <Search size={20} />
                </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#181b21] p-[3px] shadow-neu-flat cursor-pointer hover:scale-105 transition-transform">
                 <img src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} alt="User" className="rounded-full w-full h-full object-cover bg-[#131519]" />
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Recent Projects */}
          <div className="xl:col-span-3 flex flex-col gap-6">
              <div className="flex justify-between items-end px-2">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Projects</h2>
                <Link to="/projects" className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">VIEW ALL</Link>
              </div>
              
              {projects.slice(0, 3).map((project, idx) => (
                  <Link to={`/projects/${project.id}`} key={project.id} className="group">
                      <NeuCard className="p-5 flex flex-col relative overflow-hidden group-hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[3rem] transition-opacity opacity-50 group-hover:opacity-100"></div>
                            
                            <div className="flex justify-between items-start mb-4 z-10">
                                <div className="w-10 h-10 rounded-xl bg-[#131519] shadow-neu-pressed flex items-center justify-center text-slate-400">
                                    {idx === 0 ? <TrendingUp size={18} className="text-cyan-400" /> : <History size={18} />}
                                </div>
                                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${project.status === 'In Progress' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {project.status}
                                </div>
                            </div>
                            
                            <div className="z-10">
                                <h3 className="font-bold text-slate-200 text-base line-clamp-1 group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                                <p className="text-xs text-slate-500 mt-1 font-medium truncate">{project.location}</p>
                            </div>
                      </NeuCard>
                  </Link>
              ))}
          </div>

          {/* Center Column: Quick Estimation Suite */}
          <div className="xl:col-span-6">
             <NeuCard className="min-h-[600px] p-8 flex flex-col !rounded-[3rem] border-t border-l border-white/5 shadow-[20px_20px_60px_#0b0d10,-20px_-20px_60px_#1f232b]">
                 <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-display font-black text-white mb-1">Quick Estimator</h2>
                        <p className="text-slate-400 text-sm font-medium">Instant calculations for structural components.</p>
                    </div>
                    <NeuButton circle className="!w-10 !h-10" onClick={() => navigate('/estimator')}>
                        <ArrowRight size={18} />
                    </NeuButton>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Column', icon: 'SquareStack' },
                        { label: 'Beam', icon: 'AlignHorizontalSpaceBetween' },
                        { label: 'Slab', icon: 'LayoutGrid' },
                        { label: 'Footing', icon: 'Archive' },
                        { label: 'Brickwork', icon: 'BrickWall' },
                        { label: 'Cost Calc', icon: 'Calculator' },
                    ].map((item) => (
                        <Link to="/estimator" key={item.label}>
                            <NeuCard inset className="aspect-square flex flex-col items-center justify-center gap-3 hover:bg-[#1a1d23] transition-colors cursor-pointer group">
                                <div className="text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                                    <Calculator size={28} strokeWidth={1.5} /> 
                                </div>
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">{item.label}</span>
                            </NeuCard>
                        </Link>
                    ))}
                 </div>

                 <div className="mt-auto pt-8">
                    <NeuButton primary className="w-full !py-4 text-base shadow-[0_10px_30px_-5px_rgba(45,212,191,0.4)]" onClick={() => navigate('/projects/create')}>
                        <Plus size={20} /> Start New Project
                    </NeuButton>
                 </div>
             </NeuCard>
          </div>

          {/* Right Column: Tools & Stats */}
          <div className="xl:col-span-3 flex flex-col gap-8">
              <NeuCard className="p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Quick Tools</h3>
                      <MoreHorizontal size={16} className="text-slate-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => navigate('/image-estimation')} className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#131519] shadow-neu-pressed transition-all hover:scale-[1.02]">
                          <Zap className="text-amber-400 drop-shadow-md" size={20} />
                          <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">AI Scan</span>
                      </button>
                       <button onClick={() => navigate('/materials')} className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#131519] shadow-neu-pressed transition-all hover:scale-[1.02]">
                          <Wallet className="text-purple-400 drop-shadow-md" size={20} />
                          <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">Rates</span>
                      </button>
                  </div>
              </NeuCard>

              <div className="flex-1 flex flex-col gap-6">
                   <StatCard 
                        title="Active" 
                        value={pendingProjects.toString()} 
                        icon={Clock} 
                        trend="Running" 
                        color="blue"
                        className="flex-1"
                    />
              </div>
          </div>

      </div>
    </div>
  );
};
