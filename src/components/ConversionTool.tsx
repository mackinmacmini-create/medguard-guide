import React, { useState } from 'react';
import { Calculator, ArrowRightLeft } from 'lucide-react';

export const ConversionTool: React.FC = () => {
  const [value, setValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('mg');
  const [toUnit, setToUnit] = useState<string>('g');
  const [result, setResult] = useState<number | null>(null);

  const units = {
    weight: ['mcg', 'mg', 'g', 'kg', 'lb', 'oz'],
    volume: ['ml', 'l', 'tsp', 'tbsp', 'oz'],
  };

  const conversionRates: Record<string, number> = {
    // Base unit: grams
    mcg: 0.000001,
    mg: 0.001,
    g: 1,
    kg: 1000,
    lb: 453.592,
    oz_w: 28.3495,
    // Base unit: milliliters
    ml: 1,
    l: 1000,
    tsp: 4.92892,
    tbsp: 14.7868,
    oz_v: 29.5735,
  };

  const handleConvert = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    // Simplified conversion logic for common medical units
    let converted = 0;

    // Weight conversions
    if (units.weight.includes(fromUnit) && units.weight.includes(toUnit)) {
      const fromRate = conversionRates[fromUnit === 'oz' ? 'oz_w' : fromUnit];
      const toRate = conversionRates[toUnit === 'oz' ? 'oz_w' : toUnit];
      converted = (numValue * fromRate) / toRate;
    } 
    // Volume conversions
    else if (units.volume.includes(fromUnit) && units.volume.includes(toUnit)) {
      const fromRate = conversionRates[fromUnit === 'oz' ? 'oz_v' : fromUnit];
      const toRate = conversionRates[toUnit === 'oz' ? 'oz_v' : toUnit];
      converted = (numValue * fromRate) / toRate;
    }

    setResult(converted);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-50 rounded-lg">
          <Calculator className="w-5 h-5 text-brand-600" />
        </div>
        <h2 className="text-xl font-semibold">Metric Conversion Tool</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="input-field w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="input-field w-full appearance-none"
            >
              {[...units.weight, ...units.volume].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="pt-8">
            <ArrowRightLeft className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="input-field w-full appearance-none"
            >
              {[...units.weight, ...units.volume].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleConvert} className="btn-primary">
          Convert
        </button>
      </div>

      {result !== null && (
        <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
          <p className="text-sm text-slate-500">Result</p>
          <p className="text-2xl font-bold text-brand-700">
            {result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toUnit}
          </p>
        </div>
      )}
    </div>
  );
};
