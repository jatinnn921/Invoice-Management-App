import { useMemo, useState, type FormEvent } from 'react';
import { CalendarDays, ChevronDown, Plus, Save, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatMoney, invoiceSubtotal, invoiceTax, invoiceTotal, type Invoice, type LineItem } from '@/lib/invoice-data';
import { useInvoices } from '@/lib/invoice-data';

type Draft = Omit<Invoice, 'id' | 'status'>;

export function InvoiceForm({ initial, editingId }: { initial?: Invoice; editingId?: string }) {
  const [, setLocation] = useLocation();
  const { clients, addInvoice, updateInvoice } = useInvoices();
  const [form, setForm] = useState<Draft>(initial ? { ...initial } : {
    number: `INV-${1050 + Math.floor(Math.random() * 30)}`, clientId: '', clientName: '', clientEmail: '',
    issueDate: '2024-06-18', dueDate: '2024-07-02', taxRate: 0, notes: 'Payment is due within 14 days of issue.',
    items: [{ id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }],
  });
  const subtotal = useMemo(() => invoiceSubtotal(form), [form]);
  const tax = useMemo(() => invoiceTax(form), [form]);
  const total = useMemo(() => invoiceTotal(form), [form]);
  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm((current) => ({ ...current, [key]: value }));
  const selectClient = (id: string) => {
    const client = clients.find((item) => item.id === id);
    if (client) setForm((current) => ({ ...current, clientId: id, clientName: client.name, clientEmail: client.email }));
  };
  const setItem = (id: string, key: keyof LineItem, value: string) => setForm((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, [key]: key === 'description' ? value : Number(value) } : item) }));
  const addItem = () => setForm((current) => ({ ...current, items: [...current.items, { id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }] }));
  const removeItem = (id: string) => setForm((current) => ({ ...current, items: current.items.length === 1 ? current.items : current.items.filter((item) => item.id !== id) }));
  const save = (event: FormEvent) => {
    event.preventDefault();
    const saved = editingId ? (updateInvoice(editingId, form), { id: editingId }) : addInvoice(form);
    setLocation(`/invoices/${saved.id}`);
  };
  const fieldClass = 'mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/15';
  return <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
    <div className="space-y-6">
      <section className="rounded-xl border border-card-border bg-card p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between"><div><p className="font-data text-[10px] uppercase tracking-[.18em] text-accent">01 / Recipient</p><h2 className="mt-1 font-display text-2xl">Who is this for?</h2></div><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-data text-muted-foreground">Required</span></div>
        <div className="grid gap-5 sm:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground sm:col-span-2">Select a client<select value={form.clientId} onChange={(e) => selectClient(e.target.value)} className={fieldClass} data-testid="select-client"><option value="">Choose from your clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.company} — {client.name}</option>)}</select></label>
          <label className="text-xs font-semibold text-muted-foreground">Client name<input required value={form.clientName} onChange={(e) => setField('clientName', e.target.value)} className={fieldClass} placeholder="Maya Chen" data-testid="input-client-name" /></label>
          <label className="text-xs font-semibold text-muted-foreground">Email address<input required type="email" value={form.clientEmail} onChange={(e) => setField('clientEmail', e.target.value)} className={fieldClass} placeholder="maya@studio.com" data-testid="input-client-email" /></label>
        </div>
      </section>
      <section className="rounded-xl border border-card-border bg-card p-5 sm:p-7">
        <div className="mb-6"><p className="font-data text-[10px] uppercase tracking-[.18em] text-accent">02 / Details</p><h2 className="mt-1 font-display text-2xl">Set the terms.</h2></div>
        <div className="grid gap-5 sm:grid-cols-3"><label className="text-xs font-semibold text-muted-foreground">Invoice number<input required value={form.number} onChange={(e) => setField('number', e.target.value)} className={`${fieldClass} font-data`} data-testid="input-invoice-number" /></label><label className="text-xs font-semibold text-muted-foreground">Issue date<div className="relative"><input required type="date" value={form.issueDate} onChange={(e) => setField('issueDate', e.target.value)} className={`${fieldClass} pr-9`} data-testid="input-issue-date" /><CalendarDays size={15} className="pointer-events-none absolute right-3 top-5 text-muted-foreground" /></div></label><label className="text-xs font-semibold text-muted-foreground">Due date<div className="relative"><input required type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} className={`${fieldClass} pr-9`} data-testid="input-due-date" /><CalendarDays size={15} className="pointer-events-none absolute right-3 top-5 text-muted-foreground" /></div></label></div>
      </section>
      <section className="rounded-xl border border-card-border bg-card p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between"><div><p className="font-data text-[10px] uppercase tracking-[.18em] text-accent">03 / Line items</p><h2 className="mt-1 font-display text-2xl">What did you make?</h2></div><button type="button" onClick={addItem} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:border-accent hover:text-accent" data-testid="button-add-line-item"><Plus size={14} /> Add line</button></div>
        <div className="hidden grid-cols-[1fr_92px_130px_28px] gap-3 px-1 pb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground sm:grid"><span>Description</span><span>Qty</span><span>Unit price</span><span /></div>
        <div className="space-y-3">{form.items.map((item) => <div key={item.id} className="grid gap-2 rounded-lg border border-border/70 p-3 sm:grid-cols-[1fr_92px_130px_28px] sm:items-center sm:border-0 sm:p-0"><label className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground sm:sr-only">Description<input required value={item.description} onChange={(e) => setItem(item.id, 'description', e.target.value)} className={`${fieldClass} mt-1 sm:mt-0`} placeholder="e.g. Brand strategy sprint" data-testid={`input-item-description-${item.id}`} /></label><label className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground sm:sr-only">Quantity<input required min="1" type="number" value={item.quantity} onChange={(e) => setItem(item.id, 'quantity', e.target.value)} className={`${fieldClass} mt-1 sm:mt-0`} data-testid={`input-item-quantity-${item.id}`} /></label><label className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-foreground sm:sr-only">Unit price<div className="relative"><span className="absolute left-3 top-5 text-sm text-muted-foreground">$</span><input required min="0" step="0.01" type="number" value={item.unitPrice} onChange={(e) => setItem(item.id, 'unitPrice', e.target.value)} className={`${fieldClass} mt-1 pl-7 sm:mt-0`} data-testid={`input-item-price-${item.id}`} /></div></label><button type="button" onClick={() => removeItem(item.id)} className="justify-self-end rounded-md p-2 text-muted-foreground hover:bg-[#f8dcd5] hover:text-[#a14232]" data-testid={`button-remove-line-${item.id}`}><Trash2 size={15} /></button></div>)}</div>
      </section>
      <section className="rounded-xl border border-card-border bg-card p-5 sm:p-7"><div className="mb-5"><p className="font-data text-[10px] uppercase tracking-[.18em] text-accent">04 / A little context</p><h2 className="mt-1 font-display text-2xl">Leave a note.</h2></div><textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} className="min-h-24 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/15" placeholder="A warm thank you, payment instructions, or anything else..." data-testid="textarea-invoice-notes" /></section>
    </div>
    <aside className="lg:sticky lg:top-6 lg:h-fit"><div className="rounded-xl bg-primary p-6 text-primary-foreground"><div className="mb-8 flex items-center justify-between"><span className="font-data text-[10px] uppercase tracking-[.16em] text-primary-foreground/50">Invoice summary</span><ChevronDown size={16} className="text-primary-foreground/40" /></div><div className="space-y-4 border-b border-primary-foreground/15 pb-5"><div className="flex justify-between text-sm"><span className="text-primary-foreground/55">Subtotal</span><span className="font-data">{formatMoney(subtotal)}</span></div><div className="flex items-center justify-between text-sm"><label className="text-primary-foreground/55" htmlFor="tax-rate">Tax rate</label><div className="flex items-center gap-1"><input id="tax-rate" type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={(e) => setField('taxRate', Number(e.target.value))} className="w-14 border-b border-primary-foreground/35 bg-transparent py-1 text-right font-data text-sm outline-none" data-testid="input-tax-rate" /><span className="text-primary-foreground/55">%</span></div></div><div className="flex justify-between text-sm"><span className="text-primary-foreground/55">Tax</span><span className="font-data">{formatMoney(tax)}</span></div></div><div className="flex items-end justify-between py-5"><span className="text-sm font-semibold">Total due</span><span className="font-display text-3xl">{formatMoney(total)}</span></div><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5" data-testid="button-save-invoice"><Save size={16} /> {editingId ? 'Save changes' : 'Create invoice'}</button><p className="mt-3 text-center text-[11px] text-primary-foreground/40">You can edit this anytime.</p></div></aside>
  </form>;
}