import { Check, Clock3, TriangleAlert } from 'lucide-react';
import type { InvoiceStatus } from '@/lib/invoice-data';

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = {
    Paid: { icon: Check, className: 'bg-[#dceee8] text-[#286354]', label: 'Paid' },
    Pending: { icon: Clock3, className: 'bg-[#f7e9c8] text-[#89641d]', label: 'Pending' },
    Overdue: { icon: TriangleAlert, className: 'bg-[#f8dcd5] text-[#a14232]', label: 'Overdue' },
  }[status];
  const Icon = config.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`} data-testid={`status-payment-${status.toLowerCase()}`}><Icon size={12} strokeWidth={2.5} />{config.label}</span>;
}