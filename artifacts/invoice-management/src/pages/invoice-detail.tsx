import { Link, useParams } from 'wouter';
import { InvoicePreview } from '@/components/invoice-preview';
import { useInvoices } from '@/lib/invoice-data';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { invoices, markPaid } = useInvoices();
  const invoice = invoices.find((item) => item.id === id);
  if (!invoice) return <div className="mx-auto max-w-lg px-5 py-24 text-center"><h1 className="font-display text-3xl">Invoice not found.</h1><Link href="/" className="mt-4 inline-block text-sm font-semibold text-accent" data-testid="link-detail-not-found">Return to overview</Link></div>;
  return <div className="bg-[#f4f0e8] px-5 py-8 md:px-10 md:py-11"><InvoicePreview invoice={invoice} onMarkPaid={() => markPaid(invoice.id)} /></div>;
}