
import React, { useState, useRef } from 'react';
import { analyzeStructuralFile } from '../services/aiService';
import { Loader2, Upload, FileText, Coins, Building } from 'lucide-react';

export default function PdfEstimationTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleEstimation = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const res = await analyzeStructuralFile(base64String, file.type);
        setResult(res);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FileText size={20} className="text-blue-600" />
        AI Drawing Estimator
      </h3>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors mb-4"
           onClick={() => fileInputRef.current?.click()}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
          <div className="flex flex-col items-center gap-2 text-slate-500">
             <Upload size={32} />
             <p>{file ? file.name : "Upload Plan (PDF/Image)"}</p>
          </div>
      </div>

      <button onClick={handleEstimation} disabled={!file || loading} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium disabled:bg-slate-300 flex justify-center items-center">
        {loading ? <Loader2 className="animate-spin mr-2" /> : "Analyze Plan"}
      </button>

      {result && (
        <div className="mt-6 space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600 flex items-center gap-2"><Coins size={16}/> Total Est. Cost</span>
                <span className="font-bold text-xl text-slate-900">{result.totalEstimatedCost?.toLocaleString()} BDT</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600 flex items-center gap-2"><Building size={16}/> Cost Per Floor</span>
                <span className="font-medium">{result.costPerFloor}</span>
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Analysis</p>
                <p className="text-sm text-slate-700 leading-relaxed">{result.analysisSummary}</p>
            </div>
        </div>
      )}
    </div>
  );
}
