
import React, { useState } from 'react';
import { GenericCalculatorForm } from '../components/CalculatorForms';
import { PartType } from '../types';
import { calculatePartMaterials } from '../services/calculatorService';
import { 
    Calculator, 
    Box, 
    Pickaxe, 
    Cylinder, 
    BoxSelect, 
    Archive, 
    GitMerge, 
    LayoutGrid, 
    Sparkles, 
    Building2, 
    AlignHorizontalSpaceBetween, 
    BrickWall, 
    Anchor,
    SquareStack,
    CircleDashed,
    ArrowLeft,
    Hammer,
    Search
} from 'lucide-react';
import { NeuCard, NeuButton, NeuInput } from '../components/Neu';

// Map part types to icons
const ToolIcons: Record<string, any> = {
    'earthwork': Pickaxe,
    'pile': Cylinder,
    'pile-cap': BoxSelect,
    'standalone-footing': Archive,
    'combined-footing': GitMerge,
    'mat-foundation': LayoutGrid,
    'cc-casting': Sparkles,
    'short-column': Building2,
    'grade-beam': AlignHorizontalSpaceBetween,
    'column': SquareStack,
    'beam': AlignHorizontalSpaceBetween,
    'slab': LayoutGrid,
    'staircase': CircleDashed, 
    'retaining-wall': Anchor,
    'brickwork': BrickWall,
};

const toolGroups = [
    {
        title: "Foundation & Earth",
        tools: [
            { id: 'earthwork', label: 'Earthwork' },
            { id: 'pile', label: 'Pile Foundation' },
            { id: 'pile-cap', label: 'Pile Cap' },
            { id: 'standalone-footing', label: 'Footing' },
            { id: 'combined-footing', label: 'Combined' },
            { id: 'mat-foundation', label: 'Mat Fdn.' },
            { id: 'cc-casting', label: 'CC Casting' },
        ]
    },
    {
        title: "Superstructure",
        tools: [
             { id: 'column', label: 'Column' },
             { id: 'beam', label: 'Floor Beam' },
             { id: 'slab', label: 'Slab / Roof' },
             { id: 'grade-beam', label: 'Grade Beam' },
             { id: 'short-column', label: 'Short Column' },
             { id: 'staircase', label: 'Staircase' },
             { id: 'retaining-wall', label: 'Retaining Wall' },
        ]
    },
    {
        title: "Finishing & Walls",
        tools: [
             { id: 'brickwork', label: 'Brickwork' },
        ]
    }
];

export const Estimator: React.FC = () => {
    const [selectedTool, setSelectedTool] = useState<PartType | null>(null);
    const [data, setData] = useState<any>({});
    const [result, setResult] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCalculate = () => {
        if (selectedTool) {
            const res = calculatePartMaterials({ id: 'temp', name: 'Temp', type: selectedTool, data });
            setResult(res);
        }
    };

    const handleBack = () => {
        setSelectedTool(null);
        setResult(null);
        setData({});
    };

    // Filter tools based on search
    const filteredGroups = toolGroups.map(group => ({
        ...group,
        tools: group.tools.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(group => group.tools.length > 0);

    // Calculator View
    if (selectedTool) {
        const ToolIcon = ToolIcons[selectedTool] || Calculator;
        const toolLabel = toolGroups.flatMap(g => g.tools).find(t => t.id === selectedTool)?.label;

        return (
            <div className="animate-in slide-in-from-bottom-8 duration-500 fade-in max-w-6xl mx-auto">
                <div className="flex items-center gap-6 mb-8">
                    <NeuButton circle onClick={handleBack} className="bg-[#1e2124] text-slate-400 hover:text-white hover:-translate-x-1">
                        <ArrowLeft size={22} />
                    </NeuButton>
                    <div>
                        <h1 className="text-3xl font-display font-black text-white flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#1e2124] shadow-[5px_5px_10px_#151719,-5px_-5px_10px_#272b31] flex items-center justify-center text-cyan-