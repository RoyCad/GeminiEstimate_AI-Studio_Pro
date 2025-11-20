
import React, { useState } from 'react';
import { PartType } from '../types';
import { calculatePartMaterials } from '../services/calculatorService';
import { Plus, Calculator as CalcIcon } from 'lucide-react';

interface MaterialCalculatorFormProps {
  onSave: (result: { partName: string; dimensions: string; materials: any[]; totalCost: number }) => void;
}

export const MaterialCalculatorForm: React.FC<MaterialCalculatorFormProps> = ({ onSave }) => {
  const [partType, setPartType] = useState<PartType>('column');
  const [count, setCount] = useState<number>(1);
  const [length, setLength] = useState<number>(10); // Feet
  const [width, setWidth] = useState<number>(12); // Inches usually
  const [height, setHeight] = useState<number>(10); // Feet (Height of column or Length of Beam)
  const [thickness, setThickness] = useState<number>(6); // Inches (for Slabs)
  const [name, setName] = useState('');

  const [calculation, setCalculation] = useState<{ materialName: string; quantity: string | number; unit: string; cost: number }[] | null>(null);

  const handleCalculate = () => {
    // Map generic form inputs to specific part data requirements
    let data: any = {};
    if (partType === 'column') {
        data = {
            totalColumns: count, columnWidth: width, columnDepth: 12, columnHeight: height,
            numberOfFloors: 1, mixRatio: '1:1.5:3', mainBarDia: 16, mainBarCount: 4, tieBarDia: 10, tieSpacing: 6
        };
    } else if (partType === 'beam') {
        data = {
            totalBeams: count, beamLength: height, beamWidth: width, beamDepth: 12,
            mixRatio: '1:1.5:3', mainBarDia: 16, mainTopCount: 2, mainBottomCount: 2
        };
    } else if (partType === 'slab') {
        data = {
            length: length, width: width, thickness: thickness,
            mixRatio: '1:1.5:3', mainBarDia: 10, distBarDia: 8
        };
    } else {
        // Basic mapping for other types
         data = {
            length, width, height, count, thickness
         };
    }

    const materials = calculatePartMaterials({ id: 'temp', name: 'Temp', type: partType, data });
    
    // Convert MaterialQuantities object to array format for display
    // Note: Cost calculation here is simplified as `calculatePartMaterials` doesn't return cost directly.
    // We will just display quantities.
    const mappedResults = Object.entries(materials).map(([key, val]) => ({
        materialName: key,
        quantity: val,
        unit: key.includes('(bags)') ? 'bags' : key.includes('(kg)') ? 'kg' : key.includes('(cft)') ? 'cft' : 'unit',
        cost: 0 // Simplified, cost would require price lookup
    }));

    setCalculation(mappedResults);
  };

  const handleSave = () => {
    if (!calculation) return;
    const totalCost = calculation.reduce((sum, item) => sum + item.cost, 0);
    
    let dimensionString = '';
    if (partType === 'slab') {
      dimensionString = `${count} Nos (${length}' x ${width}' x ${thickness}")`;
    } else {
      dimensionString = `${count} Nos (${length}' x ${width}" x ${height}')`; 
    }

    onSave({
      partName: name || `${partType} Calculation`,
      dimensions: dimensionString,
      materials: calculation,
      totalCost
    });
    
    // Reset
    setCalculation(null);
    setName('');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <CalcIcon size={20} className="text-blue-600" />
        New Estimation
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Structure Type</label>
          <select 
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={partType}
            onChange={(e) => setPartType(e.target.value as PartType)}
          >
            <option value="column">Column</option>
            <option value="beam">Beam</option>
            <option value="slab">Slab / Roof</option>
            <option value="brickwork">Brickwork</option>
            <option value="earthwork">Earthwork</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Item Name (Optional)</label>
          <input 
            type="text" 
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Ground Floor Columns"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Quantity (Nos)</label>
          <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full border p-2 rounded" />
        </div>
        
        {partType === 'slab' ? (
          <>
            <div>
               <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Length (ft)</label>
               <input type="number" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Width (ft)</label>
               <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
             <div>
               <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Thickness (in)</label>
               <input type="number" value={thickness} onChange={e => setThickness(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
          </>
        ) : (
           <>
            <div>
               <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Length/Height (ft)</label>
               <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Dim A (in)</label>
               <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
             <div>
               <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Dim B (in)</label>
               <input type="number" value={12} disabled className="w-full border p-2 rounded bg-slate-50" title="Simplified for demo" />
            </div>
          </>
        )}
      </div>

      <button 
        onClick={handleCalculate}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-medium transition-colors mb-4"
      >
        Calculate Materials
      </button>

      {calculation && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-semibold text-slate-700 mb-3 text-sm">Estimated Materials</h4>
          <div className="space-y-2 mb-4">
            {calculation.map((mat, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600">{mat.materialName}</span>
                <span className="font-medium">{mat.quantity}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleSave}
            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add to Project
          </button>
        </div>
      )}
    </div>
  );
};
