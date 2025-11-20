
import React from 'react';
import { Link, useLocation, useNavigate } from '../router';
import { 
    LayoutDashboard, 
    FolderOpen, 
    Calculator, 
    Settings, 
    LogOut, 
    FileImage, 
    Construction,
    HardHat
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { NeuCard } from './Neu';

interface SidebarProps {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) => {
  const location = useLocation();
  const { signOut, user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
      await signOut();
      navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className="block mb-3 group"
        title={collapsed ? label : ''}
        onClick={() => setMobileOpen(false)}
      >
        <div className={`
            relative flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300
            ${isActive ? 'text-primary bg-[#1d2026] shadow-neu-pressed border-l-4 border-primary' : 'text-slate-500 hover:text-slate-200 hover:bg-[#232730]'}
        `}>
            <Icon 
                size={22} 
                className={`z-20 transition-all duration-300 ${isActive ? 'text-primary drop-shadow-md' : 'text-slate-500 group-hover:text-slate-200'} ${collapsed ? 'mx-auto' : 'mr-4'}`} 
            />
            
            {!collapsed && (
                <span className="font-semibold text-sm tracking-wide">
                    {label}
                </span>
            )}
        </div>
      </Link>
    );
  };

  return (
    <>
        {/* Mobile Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar Container */}
        <aside className={`
            fixed md:relative left-0 top-0 z-50 h-screen 
            flex flex-col py-6 px-4
            transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1)
            ${mobileOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0'}
            ${collapsed ? 'md:w-28' : 'md:w-80'}
        `}>
            {/* The main floating card for sidebar content */}
            <NeuCard className="h-full flex flex-col p-6 !rounded-[2.5rem] bg-[#181b21]">
                {/* Logo Area */}
                <div className="h-24 flex items-center justify-center mb-4 relative">
                    <div className={`flex items-center gap-4 transition-all duration-300 ${collapsed ? 'scale-0 opacity-0 w-0' : 'scale-100 opacity-100'}`}>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-reflection text-white">
                            <Construction size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="font-display font-extrabold text-xl text-white tracking-tight leading-none">Predict<span className="text-primary">Pro</span></h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Construction AI</p>
                        </div>
                    </div>
                    
                    {/* Icon only for collapsed state */}
                    {collapsed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-reflection text-white">
                                <Construction size={20} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/projects" icon={FolderOpen} label="Projects" />
                    <NavItem to="/estimator" icon={Calculator} label="Estimator" />
                    <NavItem to="/image-estimation" icon={FileImage} label="AI Analysis" />
                    
                    {/* Admin Section */}
                    {role === UserRole.ADMIN && (
                        <div className="mt-8 pt-6 border-t border-white/[0.03]">
                             {!collapsed && <h4 className="px-4 text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-4">Admin Tools</h4>}
                            <NavItem to="/materials" icon={HardHat} label="Materials" />
                            <NavItem to="/settings" icon={Settings} label="Settings" />
                        </div>
                    )}
                </nav>

                {/* User Profile Footer */}
                <div className="mt-6 pt-6 border-t border-white/[0.03]">
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'} transition-all`}>
                        <div className="w-12 h-12 rounded-full bg-[#131519] p-[3px] shadow-neu-pressed">
                             <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-800">
                                 {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="text-sm font-bold text-slate-400">
                                        {user?.displayName?.charAt(0) || 'U'}
                                    </div>
                                 )}
                             </div>
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate text-slate-200">{user?.displayName || 'User'}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{role}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button onClick={handleLogout} className="p-3 text-slate-500 hover:text-red-400 hover:bg-[#232730] rounded-xl transition-all shadow-sm" title="Logout">
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </NeuCard>
        </aside>
    </>
  );
};
