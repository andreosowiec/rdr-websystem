import { COMPANY_CREDENTIALS } from '../data/rdrContent';
import { RdrLogo } from './RdrLogo';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#040B18] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          <div className="md:col-span-5">
            <RdrLogo />
            <p className="mt-3 text-sm text-slate-300 max-w-sm leading-relaxed">
              Sua solução em eletromecânica industrial para hotéis, resorts, shoppings, hospitais e
              indústrias na Bahia.
            </p>
            <p className="mt-3 font-mono text-xs text-slate-400 tabular-nums">
              CNPJ {COMPANY_CREDENTIALS.cnpj} · {COMPANY_CREDENTIALS.instagramHandle}
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-xs font-semibold text-[#F8FAFC] mb-3">Navegação</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href="#servicos" className="hover:text-yellow-400 transition-colors">
                  Serviços e Oficina
                </a>
              </li>
              <li>
                <a href="#setores" className="hover:text-yellow-400 transition-colors">
                  Setores Atendidos
                </a>
              </li>
              <li>
                <a href="#clientes" className="hover:text-yellow-400 transition-colors">
                  Clientes e Casos Reais
                </a>
              </li>
              <li>
                <a href="#empresa" className="hover:text-yellow-400 transition-colors">
                  Empresa e Endereço
                </a>
              </li>
              <li>
                <a href="#agendamento" className="hover:text-yellow-400 transition-colors">
                  Agendar Visita Técnica
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="text-slate-400 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Área Administrativa
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="text-xs font-semibold text-[#F8FAFC] mb-3">Sede e Contato Oficial</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {COMPANY_CREDENTIALS.address}
              <br />
              {COMPANY_CREDENTIALS.cityState}
            </p>
            <p className="mt-3 font-mono text-xs text-yellow-400 tabular-nums">
              WhatsApp: {COMPANY_CREDENTIALS.whatsappDisplay}
            </p>
            <p className="mt-1 text-xs text-slate-300">{COMPANY_CREDENTIALS.email}</p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <span>
            © {year} {COMPANY_CREDENTIALS.legalName} Todos os direitos reservados.
          </span>
          <span>{COMPANY_CREDENTIALS.hours}</span>
        </div>
      </div>
    </footer>
  );
}
