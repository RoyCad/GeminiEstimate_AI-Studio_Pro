
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { NeuCard, NeuButton } from './Neu';

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
            <NeuCard className="p-6 h-[180px] flex flex-col justify-between animate-pulse">
                <div>
                    <div className="h-4 w-24 bg-white/5 rounded mb-4"></div>
                    <div className="h-10 w-32 bg-white/5 rounded"></div>
                </div>
                <div className="h-8 w-20 bg-white/5 rounded"></div>
            </NeuCard>
        );
    }

    return (
        <NeuCard className={`p-6 h-full flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 ${className || ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
                    <h3 className="text-3xl font-black text-slate-200 tracking-tight">{value}</h3>
                </div>
                <NeuButton circle className={`!w-12 !h-12 !bg-[#262a30] cursor-default ${colors[color]}`}>
                    <Icon size={22} />
                </NeuButton>
            </div>
            
            <div className="mt-6 flex items-center gap-2">
                <div className={`flex items-center gap-1 text-[11px] font-bold ${colors[color]} bg-[#262a30] px-3 py-1.5 rounded-lg shadow-[inset_2px_2px_4px_#1b1e23,inset_-2px_-2px_4px_#31363e]`}>
                    <ArrowUpRight size={14} />
                    {trend}
                </div>
            </div>
        </NeuCard>
    );
};
