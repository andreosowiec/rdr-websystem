import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { listAdminVisits, logoutAdmin } from '../../services/visitApi';
import {
  VISIT_STATUSES,
  type AdminMetrics,
  type VisitRecord,
  type VisitStatus,
} from '../../types/visit';
import { RdrLogo } from '../RdrLogo';
import { VisitTriageDrawer } from './VisitTriageDrawer';

interface AdminDashboardViewProps {
  username: string;
  onLoggedOut: () => void;
  onBackToSite: () => void;
}

type StatusFilter = 'Todos' | VisitStatus;

const SERVICE_SHORT_LABEL: Record<string, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  preditiva: 'Preditiva',
  'bombas-incendio': 'Bombas / Incêndio',
  'climatizacao-chiller': 'Chiller / Torres',
  'quadros-transformadores': 'Quadros / Trafo',
  'torno-usinagem': 'Torno / Usinagem',
  'diagnostico-geral': 'Avaliação Geral',
};

function getStatusBadgeParts(status: VisitStatus) {
  switch (status) {
    case 'Agendada':
      return {
        className: 'text-yellow-300 border-yellow-400/30 bg-yellow-400/10',
        Icon: Clock,
      };
    case 'Em Triagem Técnica':
      return {
        className: 'text-sky-300 border-sky-400/30 bg-sky-400/10',
        Icon: CalendarClock,
      };
    case 'Confirmada':
      return {
        className: 'text-indigo-300 border-indigo-400/30 bg-indigo-400/10',
        Icon: CheckCircle2,
      };
    case 'Concluída':
      return {
        className: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
        Icon: CheckCircle2,
      };
    case 'Cancelada':
      return {
        className: 'text-red-300 border-red-500/30 bg-red-500/10',
        Icon: XCircle,
      };
  }
}

export function AdminDashboardView({
  username,
  onLoggedOut,
  onBackToSite,
}: AdminDashboardViewProps) {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    total: 0,
    pending: 0,
    emergency: 0,
    confirmedOrDone: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);

  const loadVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminVisits();
      setVisits(data.visits);
      setMetrics(data.metrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar agendamentos.';
      if (message.toLowerCase().includes('expirada') || message.toLowerCase().includes('autenticada')) {
        onLoggedOut();
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onLoggedOut]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const handleLogout = async () => {
    await logoutAdmin().catch(() => undefined);
    onLoggedOut();
  };

  const handleVisitUpdated = (updated: VisitRecord) => {
    setVisits((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      setMetrics({
        total: next.length,
        pending: next.filter(
          (v) => v.status === 'Agendada' || v.status === 'Em Triagem Técnica'
        ).length,
        emergency: next.filter(
          (v) =>
            v.urgency.toLowerCase().includes('emergenc') &&
            v.status !== 'Concluída' &&
            v.status !== 'Cancelada'
        ).length,
        confirmedOrDone: next.filter(
          (v) => v.status === 'Confirmada' || v.status === 'Concluída'
        ).length,
      });
      return next;
    });
    setSelectedVisit(updated);
  };

  const filteredVisits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return visits.filter((item) => {
      const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      return (
        item.protocol.toLowerCase().includes(query) ||
        item.companyName.toLowerCase().includes(query) ||
        item.contactName.toLowerCase().includes(query) ||
        item.cityState.toLowerCase().includes(query)
      );
    });
  }, [visits, statusFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-[#061124] text-[#F8FAFC] flex flex-col">
      <header className="sticky top-0 z-30 bg-[#061124]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm whitespace-nowrap shrink-0">
            <RdrLogo compact />
            <span className="text-slate-500" aria-hidden="true">
              /
            </span>
            <span className="text-slate-300">Agendamentos de Visita</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-xs text-slate-400 font-mono">
              {username}
            </span>
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Site Público</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-yellow-400 border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
              Gestão de Visitas Técnicas e Diagnósticos
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Triagem das solicitações enviadas pelo site comercial da RDR.
            </p>
          </div>

          <button
            type="button"
            onClick={loadVisits}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-100 bg-[#0B1A36] hover:bg-[#102347] border border-white/10 rounded-md transition-colors self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-yellow-400 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Atualizar Fila</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/10 rounded-lg bg-[#0B1A36] divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="p-5">
            <span className="text-xs text-slate-400 block">Total Registrado</span>
            <span className="mt-1 font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums block">
              {metrics.total}
            </span>
          </div>
          <div className="p-5">
            <span className="text-xs text-slate-400 block">Aguardando / Em Triagem</span>
            <span className="mt-1 font-mono text-2xl font-bold text-yellow-400 tabular-nums block">
              {metrics.pending}
            </span>
          </div>
          <div className="p-5">
            <span className="text-xs text-slate-400 block">Emergências Ativas</span>
            <span className="mt-1 font-mono text-2xl font-bold text-red-400 tabular-nums block">
              {metrics.emergency}
            </span>
          </div>
          <div className="p-5">
            <span className="text-xs text-slate-400 block">Confirmadas / Concluídas</span>
            <span className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums block">
              {metrics.confirmedOrDone}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar protocolo, empresa, cidade..."
              aria-label="Buscar agendamentos"
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-[#0B1A36] border border-white/10 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div
            role="group"
            aria-label="Filtrar agendamentos por status"
            className="flex flex-wrap items-center gap-1 p-1 bg-[#0B1A36] border border-white/10 rounded-lg"
          >
            {(['Todos', ...VISIT_STATUSES] as StatusFilter[]).map((statusOption) => {
              const active = statusFilter === statusOption;
              return (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => setStatusFilter(statusOption)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-yellow-400 text-[#061124] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {statusOption}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex flex-wrap items-center justify-between gap-4 text-sm text-red-300"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadVisits}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-md cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        <div className="bg-[#0B1A36] border border-white/10 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-white/10" aria-label="Carregando agendamentos">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse hidden sm:block" />
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-base font-semibold text-[#F8FAFC]">
                {visits.length === 0
                  ? 'Nenhuma visita técnica agendada ainda'
                  : 'Nenhum agendamento encontrado com os filtros atuais'}
              </p>
              <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                {visits.length === 0
                  ? 'Assim que um cliente preencher o formulário de agendamento no site comercial, a solicitação aparecerá aqui para triagem.'
                  : 'Limpe o campo de busca ou selecione "Todos" no filtro de status para visualizar todos os registros.'}
              </p>
              {visits.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('Todos');
                    setSearchTerm('');
                  }}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md cursor-pointer"
                >
                  Limpar Filtros
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBackToSite}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md cursor-pointer"
                >
                  Ir para o Agendador Público
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#061124]/70 text-xs font-semibold text-slate-400">
                    <th className="py-3 px-4">Protocolo</th>
                    <th className="py-3 px-4">Empresa / Contato</th>
                    <th className="py-3 px-4">Modalidade</th>
                    <th className="py-3 px-4">Criticidade</th>
                    <th className="py-3 px-4">Data Desejada</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {filteredVisits.map((item) => {
                    const { className, Icon } = getStatusBadgeParts(item.status);
                    const isEmergency = item.urgency.toLowerCase().includes('emergenc');
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedVisit(item)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono text-xs text-yellow-400 tabular-nums whitespace-nowrap">
                          {item.protocol}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#F8FAFC]">{item.companyName}</div>
                          <div className="text-xs text-slate-400">
                            {item.contactName} · {item.cityState}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                          {SERVICE_SHORT_LABEL[item.serviceType] || item.serviceType}
                        </td>
                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          {isEmergency ? (
                            <span className="inline-flex items-center gap-1.5 text-red-300 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                              <span>{item.urgency}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">{item.urgency}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-200 tabular-nums whitespace-nowrap">
                          {item.preferredDate}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${className}`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{item.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVisit(item);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-yellow-400 border border-white/15 rounded-md cursor-pointer"
                          >
                            Gerenciar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <VisitTriageDrawer
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
        onUpdated={handleVisitUpdated}
      />
    </div>
  );
}
