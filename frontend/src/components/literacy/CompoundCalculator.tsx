import { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { formatPeso } from '../../lib/utils';

export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(5);

  const futureValue = principal * Math.pow(1 + rate / 100, years);
  const totalInterest = futureValue - principal;
  const multiplier = futureValue / principal;

  return (
    <div className="rounded-2xl border border-nu-blue-200 bg-nu-blue-50 p-4 dark:border-nu-blue-700/30 dark:bg-nu-blue-500/5">
      <div className="mb-3 flex items-center gap-2">
        <Calculator size={16} className="text-nu-blue-600" />
        <p className="text-sm font-semibold text-nu-blue-800 dark:text-nu-blue-300">
          Compound Interest Calculator
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-faint">Initial Amount (₱)</span>
          <input
            type="number"
            min={0}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="input-field w-full"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-faint">Annual Interest Rate (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="input-field w-full"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-faint">Years</span>
          <input
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="input-field w-full"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/60 p-3 dark:bg-surface-soft/40">
        <div className="text-center">
          <p className="text-[10px] text-ink-faint">Principal</p>
          <p className="text-sm font-bold text-ink">{formatPeso(principal)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-ink-faint">Interest Earned</p>
          <p className="text-sm font-bold text-emerald-600">{formatPeso(totalInterest)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-ink-faint">Future Value</p>
          <p className="text-sm font-bold text-nu-blue-700">{formatPeso(futureValue)}</p>
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs text-ink-soft">
        <TrendingUp size={12} className="text-emerald-500" />
        Your money grows to <strong>{multiplier.toFixed(2)}×</strong> the original amount in {years} year{years !== 1 ? 's' : ''}.
      </p>
    </div>
  );
}
