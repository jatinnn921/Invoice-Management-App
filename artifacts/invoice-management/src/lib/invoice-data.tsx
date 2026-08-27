import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  invoices: number;
  totalBilled: number;
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  taxRate: number;
  notes: string;
  items: LineItem[];
};

const initialClients: Client[] = [
  { id: 'cl-1', name: 'Maya Chen', email: 'maya@northstar.studio', company: 'Northstar Studio', invoices: 3, totalBilled: 12400 },
  { id: 'cl-2', name: 'Oliver Grant', email: 'oliver@fieldwork.co', company: 'Fieldwork Co.', invoices: 2, totalBilled: 7850 },
  { id: 'cl-3', name: 'Priya Shah', email: 'priya@commonthread.org', company: 'Common Thread', invoices: 4, totalBilled: 18200 },
  { id: 'cl-4', name: 'Theo Martins', email: 'theo@marrow.design', company: 'Marrow Design', invoices: 1, totalBilled: 3600 },
  { id: 'cl-5', name: 'Elena Rossi', email: 'elena@solace.world', company: 'Solace World', invoices: 2, totalBilled: 9200 },
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1048', number: 'INV-1048', clientId: 'cl-1', clientName: 'Maya Chen', clientEmail: 'maya@northstar.studio',
    issueDate: '2024-06-03', dueDate: '2024-06-17', status: 'Paid', taxRate: 0,
    notes: 'Thank you for trusting us with the next chapter.',
    items: [{ id: 'li-1', description: 'Brand strategy sprint', quantity: 1, unitPrice: 2400 }, { id: 'li-2', description: 'Visual direction & toolkit', quantity: 1, unitPrice: 1800 }],
  },
  {
    id: 'inv-1047', number: 'INV-1047', clientId: 'cl-3', clientName: 'Priya Shah', clientEmail: 'priya@commonthread.org',
    issueDate: '2024-06-01', dueDate: '2024-06-15', status: 'Pending', taxRate: 8.25,
    notes: 'Payment is due within 14 days of issue.',
    items: [{ id: 'li-3', description: 'June editorial design retainer', quantity: 1, unitPrice: 3200 }],
  },
  {
    id: 'inv-1046', number: 'INV-1046', clientId: 'cl-2', clientName: 'Oliver Grant', clientEmail: 'oliver@fieldwork.co',
    issueDate: '2024-05-18', dueDate: '2024-06-01', status: 'Overdue', taxRate: 0,
    notes: 'A gentle reminder that this invoice is now past due.',
    items: [{ id: 'li-4', description: 'Product photography — May', quantity: 2, unitPrice: 750 }, { id: 'li-5', description: 'Post-production', quantity: 1, unitPrice: 420 }],
  },
  {
    id: 'inv-1045', number: 'INV-1045', clientId: 'cl-5', clientName: 'Elena Rossi', clientEmail: 'elena@solace.world',
    issueDate: '2024-05-12', dueDate: '2024-05-26', status: 'Paid', taxRate: 0,
    notes: 'It was a pleasure working together.',
    items: [{ id: 'li-6', description: 'Campaign art direction', quantity: 1, unitPrice: 2800 }],
  },
  {
    id: 'inv-1044', number: 'INV-1044', clientId: 'cl-4', clientName: 'Theo Martins', clientEmail: 'theo@marrow.design',
    issueDate: '2024-05-02', dueDate: '2024-05-16', status: 'Pending', taxRate: 5,
    notes: '',
    items: [{ id: 'li-7', description: 'Website content system', quantity: 1, unitPrice: 1800 }, { id: 'li-8', description: 'Copywriting workshop', quantity: 1, unitPrice: 900 }],
  },
];

type InvoiceDraft = Omit<Invoice, 'id' | 'status'> & { id?: string; status?: InvoiceStatus };

type InvoiceContextValue = {
  invoices: Invoice[];
  clients: Client[];
  addInvoice: (invoice: InvoiceDraft) => Invoice;
  updateInvoice: (id: string, invoice: InvoiceDraft) => void;
  deleteInvoice: (id: string) => void;
  markPaid: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'invoices' | 'totalBilled'>) => void;
  updateClient: (id: string, client: Omit<Client, 'id' | 'invoices' | 'totalBilled'>) => void;
  deleteClient: (id: string) => void;
};

const InvoiceContext = createContext<InvoiceContextValue | null>(null);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [clients, setClients] = useState(initialClients);

  const value = useMemo<InvoiceContextValue>(() => ({
    invoices,
    clients,
    addInvoice: (invoice) => {
      const created = { ...invoice, id: `inv-${Date.now()}`, status: invoice.status ?? 'Pending' } as Invoice;
      setInvoices((current) => [created, ...current]);
      return created;
    },
    updateInvoice: (id, invoice) => setInvoices((current) => current.map((item) => item.id === id ? { ...item, ...invoice, id } as Invoice : item)),
    deleteInvoice: (id) => setInvoices((current) => current.filter((item) => item.id !== id)),
    markPaid: (id) => setInvoices((current) => current.map((item) => item.id === id ? { ...item, status: 'Paid' } : item)),
    addClient: (client) => setClients((current) => [{ ...client, id: `cl-${Date.now()}`, invoices: 0, totalBilled: 0 }, ...current]),
    updateClient: (id, client) => setClients((current) => current.map((item) => item.id === id ? { ...item, ...client } : item)),
    deleteClient: (id) => setClients((current) => current.filter((item) => item.id !== id)),
  }), [invoices, clients]);

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) throw new Error('useInvoices must be used within InvoiceProvider');
  return context;
}

export function invoiceSubtotal(invoice: Pick<Invoice, 'items'>) {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function invoiceTax(invoice: Pick<Invoice, 'items' | 'taxRate'>) {
  return invoiceSubtotal(invoice) * (invoice.taxRate / 100);
}

export function invoiceTotal(invoice: Pick<Invoice, 'items' | 'taxRate'>) {
  return invoiceSubtotal(invoice) + invoiceTax(invoice);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}