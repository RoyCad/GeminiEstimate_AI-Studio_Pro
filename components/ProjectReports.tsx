
import React, { useRef } from 'react';
import { Project, PaymentTransaction } from '../types';
import { NeuCard, NeuButton } from './Neu';
import { Printer, BarChart, Layers, Droplets, ToyBrick, Shovel, Building2 } from 'lucide-react';
import { calculateAllPartsMaterials, aggregateMaterials } from '../services/calculatorService';

// Helper to print content
const handlePrint = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
  if (contentRef.current) {
    const originalContents = document.body.innerHTML;
    const printSection = contentRef.current.innerHTML;
    document.body.innerHTML = `
      <html>
        <head>
          <title>${title}</title>
           <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; background: white; color: black; }
            .no-print { display: none; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 700; }
            .print-container { padding: 2rem; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 2rem; }
            .total-row { font-weight: bold; background-color: #f1f5f9; }
            .paid-stamp { position: absolute; top: 20%; right: 10%; font-size: 4rem; color: #22c55e; border: 4px solid #22c55e; padding: 10px; transform: rotate(-15deg); opacity: 0.3; font-weight: 900; }
          </style>
        </head>
        <body>
            <div class="print-container">${printSection}</div>
        </body>
      </html>
    `;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  }
};

export const InvoiceReport = ({ project, transactions }: { project: Project, transactions: PaymentTransaction[] }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Safely handle services being undefined
  const services = project.services || [];
  const totalCharges = services.reduce((acc, s) => acc + (s.charge || 0), 0);
  const totalPaid = transactions
    .filter(t => t.type === 'Payment')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalDue = totalCharges - totalPaid;

  return (
    <NeuCard className="p-6">
       <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-slate-200">Invoice & Billing</h3>
           <NeuButton onClick={() => handlePrint(invoiceRef, `Invoice-${project.projectNumber}`)} className="gap-2 text-sm h-10">
               <Printer size={16} /> Print Invoice
           </NeuButton>
       </div>
       
       <div className="bg-white text-slate-900 p-8 rounded-xl overflow-hidden relative" ref={invoiceRef}>
            {totalDue <= 0 && <div className="paid-stamp absolute top-1/4 right-10 border-4 border-green-500 text-green-500 font-black text-6xl p-4 rounded-xl rotate-[-15deg] opacity-20 pointer-events-none">PAID</div>}
            
            {/* Header */}
            <div className="flex justify-between border-b border-slate-200 pb-6 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">GeminiEstimate</h1>
                    <p className="text-xs text-slate-500 mt-1">Construction Intelligence</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-blue-600 uppercase">Invoice</h2>
                    <p className="text-sm text-slate-600 font-mono mt-1">#{project.projectNumber}</p>
                    <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Client Info */}
            <div className="mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bill To</p>
                <h3 className="text-lg font-bold text-slate-800">{project.clientName}</h3>
                <p className="text-sm text-slate-600">{project.location}</p>
                <p className="text-sm text-slate-600">{project.clientEmail}</p>
            </div>

            {/* Services Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-slate-50 text-slate-600">
                        <th className="py-3 px-4 text-left text-xs font-bold uppercase">Service / Description</th>
                        <th className="py-3 px-4 text-right text-xs font-bold uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {services.length > 0 ? services.filter(s => s.selected).map(s => (
                        <tr key={s.id}>
                            <td className="py-3 px-4 text-sm">
                                <span className="font-bold block">{s.label}</span>
                                <span className="text-xs text-slate-500">{s.remarks}</span>
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-bold">{s.charge?.toLocaleString()} BDT</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={2} className="py-4 text-center text-slate-400 italic">No services selected</td></tr>
                    )}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-600">Subtotal</span>
                        <span className="font-bold">{totalCharges.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-emerald-600">Amount Paid</span>
                        <span className="font-bold text-emerald-600">(-) {totalPaid.toLocaleString()} BDT</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
                        <span className="font-black text-slate-800">Total Due</span>
                        <span className="font-black text-blue-600">{totalDue.toLocaleString()} BDT</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                <p>Thank you for your business.</p>
                <p className="mt-1">Computer generated invoice, no signature required.</p>
            </div>
       </div>
    </NeuCard>
  )
}

export const FullEstimationReport = ({ project }: { project: Project }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Ensure parts is an array
  const parts = project.parts || [];
  const allMaterialsWithParts = calculateAllPartsMaterials(parts);
  const materials = aggregateMaterials(allMaterialsWithParts);
  
  const totalCost = Object.entries(materials).reduce((acc, [key, qty]) => {
      // Simplified cost calc (assuming unit prices are fetched or static)
      const prices: any = project.materialPrices || { 'Cement (bags)': 550, 'Sand (cft)': 45, 'Aggregate (cft)': 160, 'Steel (kg)': 98, 'Total Bricks (Nos.)': 14 }; 
      // Match fuzzy keys
      let price = 0;
      if(key.includes('Cement')) price = prices['Cement (bags)'];
      else if(key.includes('Sand')) price = prices['Sand (cft)'];
      else if(key.includes('Aggregate')) price = prices['Aggregate (cft)'];
      else if(key.includes('Bricks')) price = prices['Total Bricks (Nos.)'];
      else if(key.includes('Steel')) price = prices['Steel (kg)'];
      
      return acc + (typeof qty === 'number' ? qty * price : 0);
  }, 0);

  return (
    <NeuCard className="p-6">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-slate-200">Estimation Report</h3>
           <NeuButton onClick={() => handlePrint(reportRef, `Estimate-${project.projectNumber}`)} className="gap-2 text-sm h-10">
               <Printer size={16} /> Print Report
           </NeuButton>
       </div>

       <div className="bg-white text-slate-900 p-8 rounded-xl overflow-hidden" ref={reportRef}>
            <div className="text-center mb-8 border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-black uppercase text-slate-800">Project Estimation</h1>
                <p className="text-slate-500 mt-2">{project.name}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{project.projectNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-400 uppercase">Project Details</p>
                    <p className="font-bold">{project.location}</p>
                    <p className="text-sm text-slate-600">{parts.length} Structural Parts</p>
                </div>
                 <div className="p-4 bg-slate-50 rounded-lg text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Estimated Cost</p>
                    <p className="text-2xl font-black text-blue-600">{totalCost.toLocaleString()} BDT</p>
                    <p className="text-xs text-slate-500 italic">*Approximate based on current rates</p>
                </div>
            </div>

            <div className="space-y-6">
                 {/* Material Breakdown */}
                <div>
                    <h4 className="font-bold flex items-center gap-2 border-b border-slate-200 pb-2 mb-3 text-slate-700">
                        <Layers size={16} /> Material Summary
                    </h4>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                                <th className="py-2 px-2 text-left">Item</th>
                                <th className="py-2 px-2 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(materials).map(([key, val]) => (
                                <tr key={key} className="border-b border-slate-50">
                                    <td className="py-2 px-2 text-sm font-medium">{key}</td>
                                    <td className="py-2 px-2 text-right font-bold">{typeof val === 'number' ? val.toFixed(2) : String(val)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Parts Breakdown */}
                <div>
                    <h4 className="font-bold flex items-center gap-2 border-b border-slate-200 pb-2 mb-3 text-slate-700">
                        <Building2 size={16} /> Structural Components
                    </h4>
                    <div className="space-y-4">
                        {allMaterialsWithParts.map(({ part, materials: partMats }) => {
                             return (
                                 <div key={part.id} className="border border-slate-100 rounded-lg p-3 break-inside-avoid">
                                     <div className="flex justify-between items-center mb-2">
                                         <span className="font-bold text-sm">{part.name}</span>
                                         <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{part.type}</span>
                                     </div>
                                     <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                         {Object.entries(partMats).slice(0, 4).map(([k, v]) => (
                                             <div key={k} className="flex justify-between">
                                                 <span>{k.split(' ')[0]}:</span>
                                                 <span className="font-mono font-bold">{typeof v === 'number' ? Math.round(v) : v}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )
                        })}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                Generated by GeminiEstimate AI
            </div>
       </div>
    </NeuCard>
  )
}
