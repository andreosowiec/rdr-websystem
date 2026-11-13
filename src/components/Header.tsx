import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { RdrLogo } from './RdrLogo';

interface HeaderProps {
  onNavigateToScheduler: () => void;
}

const NAV_ITEMS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Setores', href: '#setores' },
  { label: 'Clientes', href: '#clientes' },
  { label: 'Empresa', href: '#empresa' },
  { label: 'Contato', href: '#agendamento' },
];

export function Header({ onNavigateToScheduler }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const handlePrimaryCta = () => {
    setMobileOpen(false);
    onNavigateToScheduler();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#061124]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#inicio"
          aria-label="RDR Serviços e Manutenção — Início"
          className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
        >
          <RdrLogo compact />
        </a>

        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrimaryCta}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            Agendar Visita
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-200 hover:text-white border border-white/15 rounded-md cursor-pointer focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B1A36]">
          <nav aria-label="Navegação móvel" className="px-4 py-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="mt-2 w-full py-3 px-4 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors cursor-pointer"
            >
              Agendar Visita Técnica
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
