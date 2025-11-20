
import React, { useState } from 'react';
import { getMarketPrices } from '../services/aiService';
import { Search, TrendingUp, Loader2 } from 'lucide-react';

export default function MarketPriceAnalysis() {
    const [material, setMaterial] = useState('Cement');
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        const res = await getMarketPrices(material);
        setPrices(res.prices || []);
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" /> Market Rates
            </h3>
            <div className="flex gap-2 mb-4">
                <select 
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                >
                    <option value="Cement">Cement</option>
                    <option value="Steel">Steel/Rod</option>
                    <option value="Bricks">Bricks</option>
                    <option value="Sand">Sand</option>
                </select>
                <button onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    {loading ? <Loader2 className="animate-spin"/> : <Search size={18}/>}
                </button>
            </div>
            
            <div className="space-y-2">
                {prices.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                        <span className="font-medium text-slate-700">{p.brand}</span>
                        <span className="font-bold text-slate-900">{p.price} / {p.unit}</span>
                    </div>
                ))}
                {!loading && prices.length === 0 && <p className="text-center text-xs text-slate-400">Select a material to check prices.</p>}
            </div>
        </div>
    )
}
