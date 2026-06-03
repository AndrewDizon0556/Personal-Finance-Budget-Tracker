import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SemesterBudget, SemesterBudgetPayload } from '../../types/semesterBudget';
import TextField from '../ui/TextField';

const schema = z
  .object({
    semesterName: z.string().min(1, 'Semester name is required').max(100),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    totalBudget: z
      .number({ invalid_type_error: 'Total budget is required' })
      .min(1, 'Budget must be at least ₱1'),
    targetSavings: z.number().min(0).optional().nullable(),
    allowanceSchedule: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional().nullable(),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: SemesterBudgetPayload) => Promise<void>;
  onCancel: () => void;
  editing?: SemesterBudget | null;
}

export default function SemesterBudgetForm({ onSubmit, onCancel, editing }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) {
      reset({
        semesterName: editing.semesterName,
        startDate: editing.startDate,
        endDate: editing.endDate,
        totalBudget: editing.totalBudget,
        targetSavings: editing.targetSavings ?? undefined,
        allowanceSchedule: editing.allowanceSchedule ?? undefined,
      });
    } else {
      reset({});
    }
  }, [editing, reset]);

  const submit = async (data: FormData) => {
    await onSubmit({
      semesterName: data.semesterName,
      startDate: data.startDate,
      endDate: data.endDate,
      totalBudget: data.totalBudget,
      targetSavings: data.targetSavings ?? null,
      allowanceSchedule: data.allowanceSchedule ?? null,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <TextField
        label="Semester Name"
        placeholder="e.g. 1st Semester 2026"
        error={errors.semesterName?.message}
        {...register('semesterName')}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <TextField
          label="End Date"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />
      </div>

      <TextField
        label="Total Semester Budget (₱)"
        type="number"
        placeholder="15000"
        error={errors.totalBudget?.message}
        {...register('totalBudget', { valueAsNumber: true })}
      />

      <TextField
        label="Target Savings (₱)"
        hint="(optional)"
        type="number"
        placeholder="2000"
        error={errors.targetSavings?.message}
        {...register('targetSavings', { valueAsNumber: true })}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-soft">
          Allowance Schedule <span className="text-ink-faint">(optional)</span>
        </label>
        <select
          className="input-field w-full"
          {...register('allowanceSchedule')}
        >
          <option value="">Select schedule</option>
          <option value="WEEKLY">Weekly</option>
          <option value="BIWEEKLY">Bi-weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
