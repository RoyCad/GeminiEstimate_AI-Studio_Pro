
import React from 'react';
import { Link } from '../router';
import { MapPin, Clock, DollarSign, AlertCircle, Plus } from 'lucide-react';
import { ProjectStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useFirestore';
import { NeuCard, NeuButton } from './Neu';

export const ProjectList: React.FC = () => {
  const { user, role } = useAuth();
  const { projects, loading } = useProjects(user, role);

  if (loading) {
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
                <NeuCard key={i} className="h-72 opacity-50"></NeuCard>
            ))}
        </div>
     )
  }

  if (projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <NeuButton circle className="!w-20 !h-20 cursor-default">
                <AlertCircle className="w-8 h-8 text-slate-500" />
            </NeuButton>
            <div>
                <h3 className="text-2xl font-black text-slate-200">No Projects Found</h3>
                <p className="text-slate-500 mt-2 font-medium">Get started by creating your first estimation project.</p>
            </div>
            <Link to="/projects/create">
                <NeuButton primary className="gap-2">
                    <Plus size={20} /> New Project
                </NeuButton>
            </Link>
        </div>
      )
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-black text-slate-200 tracking-tight">Projects</h1>
            <p className="text-slate-500 mt-2 font-bold uppercase tracking-wider text-sm">Manage and track activity</p>
        </div>
        {role === 'Admin' && (
            <Link to="/projects/create">
                <NeuButton primary className="gap-2 !px-6 !py-3">
                    <Plus size={18} strokeWidth={3} /> New
                </NeuButton>
            </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <React.Fragment key={project.id}>
            <Link to={`/projects/${project.id}`} className="group">
              <NeuCard className="h-full flex flex-col p-8 hover:-translate-y-2 transition-transform duration-300">
                <div className="flex justify-between items-start mb-8">
                   <NeuButton circle active className="!w-16 !h-16 text-2xl font-black text-slate-200 cursor-pointer group-hover:text-cyan-400 transition-colors">
                      {project.name ? project.name.charAt(0) : 'P'}
                   </NeuButton>
                   {/* Status Dot */}
                   <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${project.status === ProjectStatus.IN_PROGRESS ? 'text-emerald-400 bg-emerald-400' : 'text-amber-400 bg-amber-400'}`}></div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-200 mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wide mb-8">{project.clientName}</p>
                
                <div className="mt-auto space-y-4">
                  <NeuCard inset className="!p-4 flex flex-col gap-3 !rounded-2xl">
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                              <MapPin size={12} /> Location
                          </div>
                          <span className="text-xs text-slate-300 font-bold truncate max-w-[120px]">{project.location}</span>
                      </div>
                      <div className="w-full h-[1px] bg-[#262a30] shadow-[0_1px_0_#3b404a]"></div>
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                              <Clock size={12} /> Start
                          </div>
                          <span className="text-xs text-slate-300 font-bold">{project.startDate || 'N/A'}</span>
                      </div>
                  </NeuCard>
                  
                  <div className="flex justify-between items-center px-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <DollarSign size={14} /> Est. Cost
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-lg tracking-tight shadow-emerald-500/20 drop-shadow-md">
                        {project.estimatedCost ? project.estimatedCost.toLocaleString() : 0}
                      </span>
                  </div>
                </div>
              </NeuCard>
            </Link>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
