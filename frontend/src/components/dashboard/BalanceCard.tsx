interface BalanceCardProps {
  monthlyAllowance: number | null;
  totalSpent: number;
  remainingBalance: number;
  dailySafeSpend: number;
  daysLeft: number;
}

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BalanceCard({
  monthlyAllowance,
  totalSpent,
  remainingBalance,
  dailySafeSpend,
  daysLeft,
}: BalanceCardProps) {
  const isLow = monthlyAllowance && remainingBalance / monthlyAllowance < 0.2;
  const isWarning = monthlyAllowance && remainingBalance / monthlyAllowance < 0.5;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-xs text-gray-400 mb-1">Remaining Balance</p>
      <p
        className={`text-4xl font-bold mb-4 ${
          isLow ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-gray-800'
        }`}
      >
        {formatPeso(remainingBalance)}
      </p>

      <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-50 pt-4">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Allowance</p>
          <p className="text-sm font-semibold text-gray-700">
            {monthlyAllowance !== null ? formatPeso(monthlyAllowance) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Spent</p>
          <p className="text-sm font-semibold text-gray-700">{formatPeso(totalSpent)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Safe / day</p>
          <p className="text-sm font-semibold text-gray-700">
            {formatPeso(dailySafeSpend)}
            <span className="text-xs text-gray-400 font-normal ml-1">({daysLeft}d left)</span>
          </p>
        </div>
      </div>

      {monthlyAllowance === null && (
        <p className="text-xs text-blue-500 mt-3 text-center">
          Set your monthly allowance in Profile to see your balance.
        </p>
      )}
    </div>
  );
}
