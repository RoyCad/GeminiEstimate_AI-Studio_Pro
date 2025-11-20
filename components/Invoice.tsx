
import React, { useRef } from 'react';
import { Project, PaymentTransaction } from '../types';
import { NeuCard, NeuButton } from './Neu';
import { Printer, FileSignature } from 'lucide-react';

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
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; background: white; color: black; }
            .no-print { display: none; }
            .print-container { padding: 40px; max-width: 800px; margin: 0 auto; }
            .signature-font { font-family: 'Great Vibes', cursive; font-size: 1.5rem; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 700; }
            .paid-stamp { position: absolute; top: 20%; right: 10%; font-size: 4rem; color: #22c55e; border: 4px solid #22c55e; padding: 10px; transform: rotate(-15deg); opacity: 0.3; font-weight: 900; }
            .page-break { page-break-before: always; }
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

const AgreementPaper = ({ project }: { project: Project }) => {
    return (
        <div className="text-slate-900 leading-relaxed text-sm">
            <div className="text-center mb-12">
                 <div className="inline-block border-b-2 border-slate-900 pb-1 mb-2">
                     <h1 className="text-3xl font-bold uppercase tracking-widest">Service Agreement</h1>
                 </div>
                 <p className="text-xs text-slate-500 uppercase tracking-wide">PredictPro Construction Consultancy</p>
            </div>

            <div className="flex justify-between mb-8 text-xs">
                <div>
                    <p className="font-bold uppercase text-slate-500">Client:</p>
                    <p className="font-bold text-lg">{project.clientName}</p>
                    <p>{project.location}</p>
                    {project.clientEmail && <p>{project.clientEmail}</p>}
                </div>
                <div className="text-right">
                    <p className="font-bold uppercase text-slate-500">Date:</p>
                    <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    <p className="mt-2 font-bold uppercase text-slate-500">Project Ref:</p>
                    <p>{project.projectNumber}</p>
                </div>
            </div>

            <p className="mb-6">
                This agreement is made and entered into by and between <strong>PredictPro</strong> (hereinafter referred to as "Consultant") and <strong>{project.clientName}</strong> (hereinafter referred to as "Client").
            </p>

            <div className="mb-6">
                <h3 className="font-bold text-base mb-2 uppercase border-b border-slate-200 pb-1">1. Scope of Services</h3>
                <p className="mb-3">The Consultant agrees to provide the following architectural and structural design services for the project located at {project.location}:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    {project.services?.filter(s => s.selected).map(s => (
                        <li key={s.id}><span className="font-semibold">{s.label}</span> {s.remarks && <span className="text-slate-500 italic">- {s.remarks}</span>}</li>
                    ))}
                </ul>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-base mb-2 uppercase border-b border-slate-200 pb-1">2. Financial Terms</h3>
                <p>The total estimated fee for the services described above is based on the agreed rates/packages.</p>
                {project.billing && (
                     <div className="mt-2 bg-slate-50 p-4 rounded border border-slate-100">
                        {project.billing.type === 'sqft' ? (
                            <p><strong>Rate:</strong> {project.billing.ratePerSqft} BDT per Sq.Ft for approx {project.billing.totalSqft} Sq.Ft area.</p>
                        ) : (
                            <p><strong>Fixed Package:</strong> {project.billing.packageAmount?.toLocaleString()} BDT</p>
                        )}
                        {project.billing.soilTestFee && <p><strong>Soil Test Fee:</strong> {project.billing.soilTestFee.toLocaleString()} BDT (Additional)</p>}
                     </div>
                )}
            </div>
            
            <div className="mb-12">
                <h3 className="font-bold text-base mb-2 uppercase border-b border-slate-200 pb-1">3. Terms & Conditions</h3>
                 <div className="whitespace-pre-wrap text-slate-600 text-xs">
                    {/* Default terms if none provided */}
                    {project.id ? "1. 30% advance payment required before work commencement.\n2. Revisions allowed up to 3 times during schematic design.\n3. Final deliverables provided upon full payment clearance." : ""}
                 </div>
            </div>

            <div className="flex justify-between items-end mt-20 pt-10">
                <div className="text-center w-64">
                    <div className="border-t border-slate-900 pt-2">
                        <p className="font-bold">Client Signature</p>
                        <p className="text-xs text-slate-500">Agreed & Accepted</p>
                    </div>
                </div>
                <div className="text-center w-64">
                     <div className="mb-2 text-2xl signature-font text-blue-900">PredictPro Auth.</div>
                    <div className="border-t border-slate-900 pt-2">
                        <p className="font-bold">PredictPro Authority</p>
                        <p className="text-xs text-slate-500">Authorized Signature</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center text-[10px] text-slate-400 mt-12 border-t border-slate-100 pt-4">
                Generated by PredictPro Construction Intelligence System
            </div>
        </div>
    )
}

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
           <h3 className="text-xl font-bold text-slate-200">Invoice & Agreement</h3>
           <NeuButton onClick={() => handlePrint(invoiceRef, `Doc-${project.projectNumber}`)} className="gap-2 text-sm h-10">
               <Printer size={16} /> Print / Save PDF
           </NeuButton>
       </div>
       
       <div className="bg-white text-slate-900 p-8 rounded-xl overflow-hidden relative" ref={invoiceRef}>
            
            {/* --- INVOICE PAGE --- */}
            <div className="invoice-page relative min-h-[800px] flex flex-col">
                {totalDue <= 0 && <div className="paid-stamp absolute top-1/4 right-10 border-4 border-green-500 text-green-500 font-black text-6xl p-4 rounded-xl rotate-[-15deg] opacity-20 pointer-events-none">PAID</div>}
                
                {/* Header */}
                <div className="flex justify-between border-b border-slate-200 pb-6 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">PredictPro</h1>
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
                <div className="flex justify-end mt-auto mb-12">
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
                <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                    <p>Thank you for your business.</p>
                    <p className="mt-1">Computer generated invoice, no signature required.</p>
                </div>
            </div>

            {/* --- PAGE BREAK FOR AGREEMENT --- */}
            <div className="page-break"></div>
            
            {/* --- AGREEMENT PAGE --- */}
            <div className="agreement-page pt-10">
                 <AgreementPaper project={project} />
            </div>
       </div>
    </NeuCard>
  )
}
