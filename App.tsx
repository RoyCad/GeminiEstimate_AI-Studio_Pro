
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from './router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProjectList } from './components/ProjectList';
import { ProjectDetails } from './pages/ProjectDetails';
import { MaterialsPage } from './components/MaterialsPage';
import { Estimator } from './pages/Estimator';
import { Login } from './pages/Login';
import PdfEstimationTool from './components/PdfEstimationTool';
import { Menu, Construction } from 'lucide-react';
import { NeuButton } from './components/Neu';

const ProtectedLayout = ({ children }: { children?: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Construction size={20} className="text-cyan-400 opacity-50" />
                </div>
            </div>
        </div>
    );
    
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar 
                mobileOpen={mobileMenuOpen} 
                setMobileOpen={setMobileMenuOpen} 
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header - Glassmorphism */}
                <header className="md:hidden h-16 flex items-center justify-between px-6 sticky top-0 z-30 bg-black/20 backdrop-blur-md border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Construction className="text-white w-5 h-5" />
                        </div>
                        <span className="font-display font-bold text-lg text-white">Gemini<span className="text-cyan-400">Est</span></span>
                    </div>
                    <NeuButton 
                        className="!p-2 !rounded-lg !bg-white/5 !border-white/10"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={20} className="text-slate-200" />
                    </NeuButton>
                </header>

                <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 md:p-8 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} protected />
                <Route path="/projects" element={<ProtectedLayout><ProjectList /></ProtectedLayout>} protected />
                <Route path="/projects/:id" element={<ProtectedLayout><ProjectDetails /></ProtectedLayout>} protected />
                <Route path="/materials" element={<ProtectedLayout><MaterialsPage /></ProtectedLayout>} protected />
                <Route path="/estimator" element={<ProtectedLayout><Estimator /></ProtectedLayout>} protected />
                <Route path="/image-estimation" element={
                     <ProtectedLayout>
                         <div className="space-y-6 animate-fade-in">
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                                    AI Plan <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Analysis</span>
                                </h1>
                                <p className="text-slate-400 mt-2 font-medium">Upload structural drawings for automated estimation.</p>
                            </div>
                            <PdfEstimationTool />
                         </div>
                     </ProtectedLayout>
                } protected />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    </AuthProvider>
  );
};

export default App;
