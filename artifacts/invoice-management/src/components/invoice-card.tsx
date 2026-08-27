import { ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { Link } from 'wouter';
import { formatDate, formatMoney, invoiceTotal, type Invoice } from '@/lib/invoice-data';
import { StatusBadge } from '@/components/status-badge';

export function InvoiceCard({ invoice, onMarkPaid }: { invoice: Invoice; onMarkPaid: (id: string) => void }) {
  return <article className="group rounded-xl border border-card-border bg-card p-4 soft-shadow transition-all hover:-translate-y-0.5 hover:border-accent/50" data-testid={`card-invoice-${invoice.id}`}>
    <div className="mb-5 flex items-start justify-between">
      <div><Link href={`/invoices/${invoice.id}`} className="font-data text-xs font-medium text-muted-foreground hover:text-accent" data-testid={`link-invoice-number-${invoice.id}`}>{invoice.number}</Link><h3 className="mt-1 font-semibold">{invoice.clientName}</h3></div>
      <button className="rounded-md p-1 text-muted-foreground hover:bg-muted" data-testid={`button-more-invoice-${invoice.id}`}><MoreHorizontal size={17} /></button>
    </div>
    <div className="flex items-end justify-between"><div><p className="font-data text-lg font-medium">{formatMoney(invoiceTotal(invoice))}</p><p className="mt-1 text-xs text-muted-foreground">Due {formatDate(invoice.dueDate)}</p></div><StatusBadge status={invoice.status} /></div>
    {invoice.status !== 'Paid' && <button onClick={() => onMarkPaid(invoice.id)} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100" data-testid={`button-mark-paid-${invoice.id}`}>Mark as paid <ArrowUpRight size={13} /></button>}
  </article>;
}