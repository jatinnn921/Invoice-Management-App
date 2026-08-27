import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, ChevronRight, FileText, Menu, Plus, Sparkles, Users, X } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const navItems = [
    { href: '/', label: 'Overview', icon: BarChart3 },
    { href: '/invoices/new', label: 'New invoice', icon: Plus },
    { href: '/clients', label: 'Clients', icon: Users },
  ];
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className={`no-print fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-7">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Sparkles size={17} strokeWidth={2.5} /></span>
            <span className="font-display text-[22px] tracking-[-.03em]">ledgerly</span>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent md:hidden" data-testid="button-close-menu"><X size={18} /></button>
        </div>
        <div className="px-5 pt-8">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-sidebar-foreground/40">Workspace</p>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? location === '/' : location.startsWith(href);
              return <Link key={href} href={href} onClick={() => setOpen(false)} className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`}>
                <span className="flex items-center gap-3"><Icon size={17} strokeWidth={active ? 2.4 : 1.8} /><span>{label}</span></span>
                {active && <ChevronRight size={14} className="text-sidebar-primary" />}
              </Link>;
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-sidebar-border p-5">
          <div className="rounded-xl bg-sidebar-accent/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sidebar-primary"><Sparkles size={14} /><span className="text-[11px] font-semibold uppercase tracking-[.12em]">Quietly capable</span></div>
            <p className="text-xs leading-relaxed text-sidebar-foreground/55">A clearer view of the work that keeps your studio moving.</p>
          </div>
          <div className="mt-5 flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d6a84f] text-xs font-bold text-[#283044]">AR</div>
            <div><p className="text-xs font-semibold">Alex Rivera</p><p className="text-[11px] text-sidebar-foreground/45">Independent studio</p></div>
          </div>
        </div>
      </aside>
      {open && <button aria-label="Close navigation" className="no-print fixed inset-0 z-30 bg-[#172035]/35 md:hidden" onClick={() => setOpen(false)} data-testid="button-overlay-close" />}
      <main className="min-h-[100dvh] md:pl-[252px]">
        <header className="no-print flex h-20 items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur md:px-10">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-muted md:hidden" data-testid="button-open-menu"><Menu size={20} /></button>
          <div className="hidden text-sm text-muted-foreground md:block">Tuesday, June 18, 2024 <span className="mx-2 text-border">/</span> Keep the paper moving.</div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/invoices/new" className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="link-header-new-invoice"><Plus size={15} /> New invoice</Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}