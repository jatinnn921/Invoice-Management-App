import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { InvoiceForm } from '@/components/invoice-form';
import { useInvoices } from '@/lib/invoice-data';

export default function InvoiceEditor() {
  const params = useParams<{ id?: string }>();
  const { invoices } = useInvoices();
  const editingId = params.id;
  const initial = editingId ? invoices.find((invoice) => invoice.id === editingId) : undefined;
  return <div className="mx-auto max-w-[1240px] px-5 py-8 md:px-10 md:py-11">
    <div className="animate-rise mb-8"><Link href={initial ? `/invoices/${initial.id}` : '/'} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary" data-testid="link-back-editor"><ArrowLeft size={14} /> {initial ? 'Back to invoice' : 'Back to overview'}</Link><p className="font-data text-[10px] uppercase tracking-[.2em] text-accent">{initial ? 'Edit invoice' : 'New invoice'}</p><h1 className="mt-2 font-display text-4xl tracking-[-.04em] sm:text-5xl">{initial ? `Refine ${initial.number}` : 'Make it official.'}</h1><p className="mt-3 max-w-lg text-sm text-muted-foreground">{initial ? 'Make a change, keep the momentum.' : 'A clear invoice is a small act of confidence. Fill in the details below.'}</p></div>
    {editingId && !initial ? <div className="rounded-xl border border-dashed border-border bg-card py-20 text-center"><p className="font-display text-2xl">We couldn’t find that invoice.</p><Link href="/" className="mt-4 inline-block text-sm font-semibold text-accent" data-testid="link-missing-invoice-home">Return to overview</Link></div> : <InvoiceForm initial={initial} editingId={editingId} />}
  </div>;
}