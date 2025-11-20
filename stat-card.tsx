
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { NeuCard, NeuButton } from './components/Neu';

export const StatCard = ({ title, value, icon: Icon, trend, color, loading, className }: { title: string, value: string | number, icon: any, trend: string, color: 'blue' | 'emerald' | 'purple' | 'rose' | 'amber', loading?: boolean, className?: string }) => {
    // Defining text colors
    const colors = {
        blue: 'text-blue-400',
        emerald: 'text-emerald-400',
        purple: 'text-purple-400',
        rose: 'text-rose-400',
        amber: 'text-amber-400'
    };

    if (loading) {
        return (
            <NeuCard className="p-6 h-[180px] flex flex-col justify-between animate-pulse bg-[#1c1f26]">
                <div>
                    <div className="h-4 w-24 bg-white/5 rounded mb-4"></div>
                    <div className="h-10 w-32 bg-white/5 rounded"></div>
                </div>
                <div className="h-8 w-20 bg-white/5 rounded"></div>
            </NeuCard>
        );
    }

    return (
        <NeuCard className={`p-6 h-full flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-500 ${className || ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-full bg-[#232730] flex items-center justify-center shadow-neu-flat ${colors[color]}`}>
                    <Icon size={20} />
                </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2">
                <div className={`flex items-center gap-1 text-[10px] font-bold ${colors[color]} bg-[#131519] px-3 py-1.5 rounded-lg shadow-neu-pressed`}>
                    <ArrowUpRight size={12} />
                    {trend}
                </div>
            </div>
        </NeuCard>
    );
};
