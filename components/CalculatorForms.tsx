
import React, { useState, useEffect } from 'react';
import { PartType } from '../types';
import { NeuInput, NeuSelect } from './Neu';

interface FormProps {
  initialData?: any;
  onChange: (data: any) => void;
}

// Common Helpers
const MixRatioSelect = ({ value, onChange }: { value: string, onChange: any }) => (
    <NeuSelect value={value} onChange={onChange}>
        <option value="1:1.5:3">1:1.5:3 (M20)</option>
        <option value="1:2:4">1:2:4 (M15)</option>
        <option value="1:2.5:5">1:2.5:5</option>
        <option value="1:3:6">1:3:6</option>
    </NeuSelect>
);

const BarDiaSelect = ({ name, value, onChange }: { name: string, value: number, onChange: any }) => (
    <NeuSelect value={value} onChange={(e) => onChange({ target: { name, value: Number(e.target.value) } })}>
        {[8, 10, 12, 16, 20, 22, 25, 28, 32].map(dia => <option key={dia} value={dia}>{dia} mm</option>)}
    </NeuSelect>
);

const InputField = ({ label, name, value, onChange, placeholder = "" }: { label: string, name: string, value: any, onChange: any, placeholder?: string }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
        <NeuInput 
            name={name} 
            type="number" 
            value={value || ''} 
            onChange={onChange} 
            placeholder={placeholder}
        />
    </div>
)

// --- Forms ---

export const ColumnForm: React.FC<FormProps> = ({ initialData, onChange }) => {
  const [data, setData] = useState(initialData || {
    totalColumns: 1, columnWidth: 12, columnDepth: 12, columnHeight: 10,
    numberOfFloors: 1, mixRatio: '1:1.5:3', mainBarDia: 16, mainBarCount: 4,
    tieBarDia: 10, tieSpacing: 6, clearCover: 1.5, lappingLength: 3.5
  });
  useEffect(() => onChange(data), [data]);
  const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Count (Nos)" name="totalColumns" value={data.totalColumns} onChange={handleChange} />
      <InputField label="Floors" name="numberOfFloors" value={data.numberOfFloors} onChange={handleChange} />
      <InputField label="Width (in)" name="columnWidth" value={data.columnWidth} onChange={handleChange} />
      <InputField label="Depth (in)" name="columnDepth" value={data.columnDepth} onChange={handleChange} />
      <InputField label="Height (ft)" name="columnHeight" value={data.columnHeight} onChange={handleChange} />
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mix Ratio</label><MixRatioSelect value={data.mixRatio} onChange={handleChange} /></div>
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Main Bar</label><BarDiaSelect name="mainBarDia" value={data.mainBarDia} onChange={handleChange} /></div>
      <InputField label="Main Bar Nos" name="mainBarCount" value={data.mainBarCount} onChange={handleChange} />
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tie Bar</label><BarDiaSelect name="tieBarDia" value={data.tieBarDia} onChange={handleChange} /></div>
      <InputField label="Tie Spacing (in)" name="tieSpacing" value={data.tieSpacing} onChange={handleChange} />
      <InputField label="Cover (in)" name="clearCover" value={data.clearCover} onChange={handleChange} />
      <InputField label="Lap Len (ft)" name="lappingLength" value={data.lappingLength} onChange={handleChange} />
    </div>
  );
};

export const BeamForm: React.FC<FormProps> = ({ initialData, onChange }) => {
  const [data, setData] = useState(initialData || {
    totalBeams: 1, beamLength: 15, beamWidth: 10, beamDepth: 18, slabThickness: 5,
    mixRatio: '1:1.5:3', mainTopDia: 16, mainTopCount: 2, mainBottomDia: 20, mainBottomCount: 3,
    extraTopDia: 16, extraTopCount: 2, stirrupDia: 10, stirrupSpacing: 6, clearCover: 1.5, supportWidth: 1
  });
  useEffect(() => onChange(data), [data]);
  const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Count" name="totalBeams" value={data.totalBeams} onChange={handleChange} />
      <InputField label="Length (ft)" name="beamLength" value={data.beamLength} onChange={handleChange} />
      <InputField label="Width (in)" name="beamWidth" value={data.beamWidth} onChange={handleChange} />
      <InputField label="Depth (in)" name="beamDepth" value={data.beamDepth} onChange={handleChange} />
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mix Ratio</label><MixRatioSelect value={data.mixRatio} onChange={handleChange} /></div>
      <InputField label="Slab Thk (in)" name="slabThickness" value={data.slabThickness} onChange={handleChange} />
      
      <div className="col-span-2 border-t border-white/10 pt-2 mt-2"><p className="text-xs font-bold text-cyan-400 uppercase">Reinforcement</p></div>
      
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Top Bar</label><BarDiaSelect name="mainTopDia" value={data.mainTopDia} onChange={handleChange} /></div>
      <InputField label="Top Nos" name="mainTopCount" value={data.mainTopCount} onChange={handleChange} />
      
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Btm Bar</label><BarDiaSelect name="mainBottomDia" value={data.mainBottomDia} onChange={handleChange} /></div>
      <InputField label="Btm Nos" name="mainBottomCount" value={data.mainBottomCount} onChange={handleChange} />
      
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stirrup</label><BarDiaSelect name="stirrupDia" value={data.stirrupDia} onChange={handleChange} /></div>
      <InputField label="Stirrup Spc (in)" name="stirrupSpacing" value={data.stirrupSpacing} onChange={handleChange} />
    </div>
  );
};

export const SlabForm: React.FC<FormProps> = ({ initialData, onChange }) => {
  const [data, setData] = useState(initialData || {
    length: 15, width: 12, thickness: 5, mixRatio: '1:2:4',
    mainBarDia: 10, mainBarSpacing: 6, distBarDia: 8, distBarSpacing: 8, clearCover: 0.75
  });
  useEffect(() => onChange(data), [data]);
  const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Length (ft)" name="length" value={data.length} onChange={handleChange} />
      <InputField label="Width (ft)" name="width" value={data.width} onChange={handleChange} />
      <InputField label="Thickness (in)" name="thickness" value={data.thickness} onChange={handleChange} />
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mix Ratio</label><MixRatioSelect value={data.mixRatio} onChange={handleChange} /></div>
      
      <div className="col-span-2 border-t border-white/10 pt-2 mt-2"><p className="text-xs font-bold text-cyan-400 uppercase">Steel</p></div>
      
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Main Bar</label><BarDiaSelect name="mainBarDia" value={data.mainBarDia} onChange={handleChange} /></div>
      <InputField label="Main Spc (in)" name="mainBarSpacing" value={data.mainBarSpacing} onChange={handleChange} />
      
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dist. Bar</label><BarDiaSelect name="distBarDia" value={data.distBarDia} onChange={handleChange} /></div>
      <InputField label="Dist Spc (in)" name="distBarSpacing" value={data.distBarSpacing} onChange={handleChange} />
    </div>
  );
};

export const FootingForm: React.FC<FormProps> = ({ initialData, onChange }) => {
    const [data, setData] = useState(initialData || {
        totalFootings: 1, length: 5, width: 5, thickness: 12, mixRatio: '1:2:4',
        barDia: 12, barSpacing: 6, clearCover: 3
    });
    useEffect(() => onChange(data), [data]);
    const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

    return (
        <div className="grid grid-cols-2 gap-4">
             <InputField label="Count" name="totalFootings" value={data.totalFootings} onChange={handleChange} />
             <InputField label="Length (ft)" name="length" value={data.length} onChange={handleChange} />
             <InputField label="Width (ft)" name="width" value={data.width} onChange={handleChange} />
             <InputField label="Thickness (in)" name="thickness" value={data.thickness} onChange={handleChange} />
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mix Ratio</label><MixRatioSelect value={data.mixRatio} onChange={handleChange} /></div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mesh Bar</label><BarDiaSelect name="barDia" value={data.barDia} onChange={handleChange} /></div>
             <InputField label="Spacing (in)" name="barSpacing" value={data.barSpacing} onChange={handleChange} />
             <InputField label="Cover (in)" name="clearCover" value={data.clearCover} onChange={handleChange} />
        </div>
    )
}

export const PileForm: React.FC<FormProps> = ({ initialData, onChange }) => {
    const [data, setData] = useState(initialData || {
        totalPiles: 1, pileDiameter: 20, pileLength: 60, mixRatio: '1:1.5:3',
        mainBarDia: 20, mainBarCount: 6, tieBarDia: 10, tieSpacing: 5, clearCover: 3, lappingLength: 3
    });
    useEffect(() => onChange(data), [data]);
    const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

    return (
        <div className="grid grid-cols-2 gap-4">
            <InputField label="Count" name="totalPiles" value={data.totalPiles} onChange={handleChange} />
            <InputField label="Dia (in)" name="pileDiameter" value={data.pileDiameter} onChange={handleChange} />
            <InputField label="Length (ft)" name="pileLength" value={data.pileLength} onChange={handleChange} />
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mix Ratio</label><MixRatioSelect value={data.mixRatio} onChange={handleChange} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Main Bar</label><BarDiaSelect name="mainBarDia" value={data.mainBarDia} onChange={handleChange} /></div>
            <InputField label="Main Nos" name="mainBarCount" value={data.mainBarCount} onChange={handleChange} />
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Spiral Tie</label><BarDiaSelect name="tieBarDia" value={data.tieBarDia} onChange={handleChange} /></div>
            <InputField label="Spiral Spc (in)" name="tieSpacing" value={data.tieSpacing} onChange={handleChange} />
        </div>
    )
}

export const BrickworkForm: React.FC<FormProps> = ({ initialData, onChange }) => {
  const [data, setData] = useState(initialData || {
    totalWallLength: 100, wallHeight: 10, wallThickness: 5,
    mortarRatio: '1:6', bricksPerCft: 11.5, numberOfDoors: 0, doorWidth: 3, doorHeight: 7,
    numberOfWindows: 0, windowWidth: 4, windowHeight: 4
  });
  useEffect(() => onChange(data), [data]);
  const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Total Length (ft)" name="totalWallLength" value={data.totalWallLength} onChange={handleChange} />
      <InputField label="Height (ft)" name="wallHeight" value={data.wallHeight} onChange={handleChange} />
      <InputField label="Thickness (in)" name="wallThickness" value={data.wallThickness} onChange={handleChange} />
      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mortar</label>
        <NeuSelect value={data.mortarRatio} onChange={handleChange}>
            <option value="1:4">1:4</option>
            <option value="1:5">1:5</option>
            <option value="1:6">1:6</option>
        </NeuSelect>
      </div>
      <InputField label="Doors (Nos)" name="numberOfDoors" value={data.numberOfDoors} onChange={handleChange} />
      <InputField label="Windows (Nos)" name="numberOfWindows" value={data.numberOfWindows} onChange={handleChange} />
    </div>
  );
};

export const StaircaseForm: React.FC<FormProps> = ({ initialData, onChange }) => {
    const [data, setData] = useState(initialData || {
        numberOfFlights: 2, flightLength: 10, flightWidth: 4, flightHeight: 5,
        waistSlabThickness: 6, riserHeight: 6, treadWidth: 10,
        landingLength: 4, landingWidth: 8, landingSlabThickness: 6,
        mixRatio: '1:2:4', mainBarDia: 12, mainBarSpacing: 5, distBarDia: 10, distBarSpacing: 7
    });
    useEffect(() => onChange(data), [data]);
    const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

    return (
        <div className="grid grid-cols-2 gap-4">
            <InputField label="Flights" name="numberOfFlights" value={data.numberOfFlights} onChange={handleChange} />
            <InputField label="Flight Len (ft)" name="flightLength" value={data.flightLength} onChange={handleChange} />
            <InputField label="Flight Width (ft)" name="flightWidth" value={data.flightWidth} onChange={handleChange} />
            <InputField label="Waist Thk (in)" name="waistSlabThickness" value={data.waistSlabThickness} onChange={handleChange} />
            <InputField label="Riser (in)" name="riserHeight" value={data.riserHeight} onChange={handleChange} />
            <InputField label="Tread (in)" name="treadWidth" value={data.treadWidth} onChange={handleChange} />
            <InputField label="Landing Len (ft)" name="landingLength" value={data.landingLength} onChange={handleChange} />
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mix</label><MixRatioSelect value={data.mixRatio} onChange={handleChange} /></div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Main Bar</label><BarDiaSelect name="mainBarDia" value={data.mainBarDia} onChange={handleChange} /></div>
             <InputField label="Main Spc (in)" name="mainBarSpacing" value={data.mainBarSpacing} onChange={handleChange} />
        </div>
    )
}


export const EarthworkForm: React.FC<FormProps> = ({ initialData, onChange }) => {
  const [data, setData] = useState(initialData || { length: 10, width: 10, depth: 5 });
  useEffect(() => onChange(data), [data]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, [e.target.name]: Number(e.target.value) });

  return (
    <div className="grid grid-cols-3 gap-4">
      <InputField label="Length (ft)" name="length" value={data.length} onChange={handleChange} />
      <InputField label="Width (ft)" name="width" value={data.width} onChange={handleChange} />
      <InputField label="Depth (ft)" name="depth" value={data.depth} onChange={handleChange} />
    </div>
  );
};

// Main Exporter
export const GenericCalculatorForm: React.FC<{ type: PartType } & FormProps> = ({ type, initialData, onChange }) => {
  switch (type) {
    case 'column': 
    case 'short-column':
        return <ColumnForm initialData={initialData} onChange={onChange} />;
    case 'beam': 
    case 'grade-beam':
        return <BeamForm initialData={initialData} onChange={onChange} />;
    case 'slab': 
        return <SlabForm initialData={initialData} onChange={onChange} />;
    case 'brickwork': 
        return <BrickworkForm initialData={initialData} onChange={onChange} />;
    case 'earthwork': 
        return <EarthworkForm initialData={initialData} onChange={onChange} />;
    case 'pile':
        return <PileForm initialData={initialData} onChange={onChange} />;
    case 'standalone-footing':
    case 'combined-footing':
    case 'mat-foundation':
    case 'pile-cap':
        return <FootingForm initialData={initialData} onChange={onChange} />;
    case 'staircase':
        return <StaircaseForm initialData={initialData} onChange={onChange} />;
    case 'retaining-wall': // Simplified to generic wall/slab for now or reuse footing
         return <SlabForm initialData={initialData} onChange={onChange} />;
    case 'cc-casting':
        return <SlabForm initialData={initialData} onChange={onChange} />;
    default: return <div className="p-4 text-sm text-gray-500">Advanced form not yet ported for {type}. Use the main Estimator tool for details.</div>;
  }
};
