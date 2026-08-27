import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { formatDate, formatMoney, invoiceTotal, type Invoice } from '@/lib/invoice-data';
import { StatusBadge } from '@/components/status-badge';

export function InvoiceTable({ invoices, onMarkPaid, onDelete }: { invoices: Invoice[]; onMarkPaid: (id: string) => void; onDelete: (id: string) => void }) {
  return <div className="hidden overflow-hidden rounded-xl border border-card-border bg-card md:block soft-shadow">
    <table className="w-full text-left"><thead><tr className="border-b border-border bg-muted/35 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground"><th className="px-6 py-4">Invoice</th><th className="px-4 py-4">Client</th><th className="px-4 py-4">Issued</th><th className="px-4 py-4">Due date</th><th className="px-4 py-4">Amount</th><th className="px-4 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
      <tbody>{invoices.map((invoice) => <tr key={invoice.id} className="group border-b border-border/70 last:border-0 hover:bg-[#faf7f0]" data-testid={`row-invoice-${invoice.id}`}>
        <td className="px-6 py-4"><Link href={`/invoices/${invoice.id}`} className="font-data text-xs font-medium text-primary hover:text-accent" data-testid={`link-table-invoice-${invoice.id}`}>{invoice.number}</Link></td>
        <td className="px-4 py-4"><p className="text-sm font-semibold">{invoice.clientName}</p><p className="mt-0.5 text-xs text-muted-foreground">{invoice.clientEmail}</p></td>
        <td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(invoice.issueDate)}</td><td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(invoice.dueDate)}</td>
        <td className="px-4 py-4 font-data text-sm font-medium">{formatMoney(invoiceTotal(invoice))}</td><td className="px-4 py-4"><StatusBadge status={invoice.status} /></td>
        <td className="px-6 py-4"><div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"><Link href={`/invoices/${invoice.id}/edit`} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-primary" data-testid={`link-edit-invoice-${invoice.id}`}><Pencil size={14} /></Link>{invoice.status !== 'Paid' && <button onClick={() => onMarkPaid(invoice.id)} className="rounded-md p-2 text-muted-foreground hover:bg-[#dceee8] hover:text-[#286354]" title="Mark paid" data-testid={`button-table-mark-paid-${invoice.id}`}><ArrowUpRight size={14} /></button>}<button onClick={() => onDelete(invoice.id)} className="rounded-md p-2 text-muted-foreground hover:bg-[#f8dcd5] hover:text-[#a14232]" title="Delete invoice" data-testid={`button-delete-invoice-${invoice.id}`}><Trash2 size={14} /></button></div></td>
      </tr>)}</tbody></table>
  </div>;
}