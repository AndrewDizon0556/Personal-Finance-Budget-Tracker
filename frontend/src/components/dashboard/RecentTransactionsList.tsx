import type { Expense } from '../../types/expense';

interface RecentTransactionsListProps {
  transactions: Expense[];
}

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

export default function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</p>
        <p className="text-xs text-gray-400 text-center py-4">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-sm font-semibold text-gray-700 mb-4">Recent Transactions</p>
      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">{t.notes || t.categoryName}</p>
              <p className="text-xs text-gray-400">
                {t.categoryName} · {formatDate(t.expenseDate)}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${
                t.transactionType === 'INCOME' ? 'text-green-500' : 'text-gray-800'
              }`}
            >
              {t.transactionType === 'INCOME' ? '+' : '-'}
              {formatPeso(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
