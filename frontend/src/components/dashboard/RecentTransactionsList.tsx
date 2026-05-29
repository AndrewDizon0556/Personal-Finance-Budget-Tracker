import { motion } from 'framer-motion';
import type { Expense } from '../../types/expense';
import TransactionRow from '../transactions/TransactionRow';
import { staggerContainer } from '../../lib/motion';

interface RecentTransactionsListProps {
  transactions: Expense[];
}

export default function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <div className="card p-5">
      <p className="mb-2 text-sm font-semibold text-ink">Recent Activity</p>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-1">
        {transactions.map((t) => (
          <TransactionRow key={t.id} expense={t} />
        ))}
      </motion.div>
    </div>
  );
}
