
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { NeuCard, NeuButton, NeuInput } from './Neu';
import { Package, Edit, Trash2, Plus, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface MaterialItem {
    id: string;
    name: string;
    unit: string;
    marketPrice: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export const MaterialsPage: React.FC = () => {
    const { role } = useAuth();
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<MaterialItem>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState<Partial<MaterialItem>>({ status: 'In Stock' });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        const q = query(collection(firestore, 'materials'), orderBy('name'));
        const snapshot = await getDocs(q);
        setMaterials(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MaterialItem)));
        setLoading(false);
    };

    const handleUpdate = async (id: string) => {
        await updateDoc(doc(firestore, 'materials', id), editForm);
        setIsEditing(null);
        fetchMaterials();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure?')) {
            await deleteDoc(doc(firestore, 'materials', id));
            fetchMaterials();
        }
    };

    const handleAdd = async () => {
        await addDoc(collection(firestore, 'materials'), addForm);
        setIsAdding(false);
        setAddForm({ status: 'In Stock' });
        fetchMaterials();
    }

    const isAdmin = role === UserRole.ADMIN;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-200">Materials & Market Rates</h1>
                    <p className="text-slate-500">Live market prices used for estimation logic.</p>
                </div>
                {isAdmin && <NeuButton primary onClick={() => setIsAdding(true)} className="gap-2"><Plus size={18}/> Add Material</NeuButton>}
            </div>

            {/* Add Form */}
            {isAdding && (
                <NeuCard className="p-6 mb-6 border-cyan-500/30">
                    <h3 className="font-bold mb-4 text-cyan-400">Add New Material</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <NeuInput placeholder="Name" value={addForm.name || ''} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                        <NeuInput placeholder="Unit (e.g. bag)" value={addForm.unit || ''} onChange={e => setAddForm({...addForm, unit: e.target.value})} />
                        <NeuInput type="number" placeholder="Price" value={addForm.marketPrice || ''} onChange={e => setAddForm({...addForm, marketPrice: Number(e.target.value)})} />
                        <div className="flex gap-2">
                            <NeuButton primary onClick={handleAdd} className="flex-1">Save</NeuButton>
                            <NeuButton onClick={() => setIsAdding(false)}>Cancel</NeuButton>
                        </div>
                    </div>
                </NeuCard>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mx-auto"></div></div>
                ) : (
                    materials.map((mat) => (
                        <NeuCard key={mat.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                            {isEditing === mat.id ? (
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                                    <NeuInput value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                    <NeuInput value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} />
                                    <NeuInput type="number" value={editForm.marketPrice} onChange={e => setEditForm({...editForm, marketPrice: Number(e.target.value)})} />
                                    <div className="flex gap-2">
                                        <NeuButton primary onClick={() => handleUpdate(mat.id)} className="flex-1">Save</NeuButton>
                                        <NeuButton onClick={() => setIsEditing(null)}>Cancel</NeuButton>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-10 w-10 rounded-xl bg-[#22262b] flex items-center justify-center text-cyan-500 shadow-inner">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200">{mat.name}</h4>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{mat.status}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 font-bold uppercase">Market Rate</p>
                                            <p className="font-mono font-bold text-emerald-400">৳ {mat.marketPrice} <span className="text-slate-600 text-xs">/ {mat.unit}</span></p>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setIsEditing(mat.id); setEditForm(mat); }} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"><Edit size={18}/></button>
                                                <button onClick={() => handleDelete(mat.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={18}/></button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </NeuCard>
                    ))
                )}
            </div>
        </div>
    );
};
