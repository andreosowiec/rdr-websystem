import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { loginAdmin } from '../../services/visitApi';
import { RdrLogo } from '../RdrLogo';

interface AdminLoginViewProps {
  onLoginSuccess: (username: string) => void;
  onBackToSite: () => void;
}

export function AdminLoginView({ onLoginSuccess, onBackToSite }: AdminLoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Informe usuário e senha para acessar o painel.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAdmin(username.trim(), password);
      onLoginSuccess(result.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061124] text-[#F8FAFC] flex flex-col justify-between px-4 py-8">
      <div className="max-w-md w-full mx-auto flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar para o site comercial</span>
        </button>

        <RdrLogo compact />
      </div>

      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-[#0B1A36] border border-white/10 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="w-10 h-10 rounded-md bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[#F8FAFC]">
                Painel Administrativo RDR
              </h1>
              <p className="text-xs text-slate-400">Gestão de visitas técnicas e triagem</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="admin-user" className="block text-xs font-medium text-slate-300 mb-1.5">
                Usuário Corporativo
              </label>
              <input
                id="admin-user"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@rdr"
                className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Senha de Acesso
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-md bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 rounded-md transition-colors cursor-pointer"
            >
              {isLoading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400 leading-relaxed">
            <span>Acesso padrão de teste: </span>
            <span className="font-mono text-slate-200">admin@rdr</span>
            <span> / </span>
            <span className="font-mono text-slate-200">rdr2026</span>
            <span> (configurável via variáveis de ambiente antes de publicar).</span>
          </div>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-400">
        RDR Serviços e Manutenção Ltda — Acesso Restrito à Coordenação
      </div>
    </div>
  );
}
