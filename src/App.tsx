import { useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SectorsAndProofSection } from './components/SectorsAndProofSection';
import { ServicesSection } from './components/ServicesSection';
import { VisitSchedulerSection } from './components/VisitSchedulerSection';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminLoginView } from './components/admin/AdminLoginView';
import type { ServiceCategory } from './data/rdrContent';
import { getAdminSession } from './services/visitApi';

type AppView = 'public' | 'admin';

function resolveViewFromPath(): AppView {
  return window.location.pathname.startsWith('/admin') ? 'admin' : 'public';
}

export default function App() {
  const [view, setView] = useState<AppView>(resolveViewFromPath);
  const [preselectedCategory, setPreselectedCategory] = useState<ServiceCategory | null>(null);

  const [checkingSession, setCheckingSession] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setView(resolveViewFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (view !== 'admin') return;
    let active = true;
    setCheckingSession(true);

    getAdminSession()
      .then((res) => {
        if (!active) return;
        setAdminUser(res.authenticated && res.username ? res.username : null);
      })
      .catch(() => {
        if (active) setAdminUser(null);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [view]);

  const navigateToView = (target: AppView) => {
    const nextPath = target === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setView(target);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const scrollToScheduler = (category?: ServiceCategory) => {
    if (category) {
      setPreselectedCategory(category);
    }
    const element = document.getElementById('agendamento');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (view === 'admin') {
    if (checkingSession) {
      return (
        <div className="min-h-screen bg-[#061124] text-slate-300 flex items-center justify-center text-sm">
          Verificando sessão administrativa...
        </div>
      );
    }

    if (!adminUser) {
      return (
        <AdminLoginView
          onLoginSuccess={(username) => setAdminUser(username)}
          onBackToSite={() => navigateToView('public')}
        />
      );
    }

    return (
      <AdminDashboardView
        username={adminUser}
        onLoggedOut={() => setAdminUser(null)}
        onBackToSite={() => navigateToView('public')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#061124] text-[#F8FAFC]">
      <Header onNavigateToScheduler={() => scrollToScheduler()} />
      <main className="flex-1">
        <HeroSection onScheduleClick={() => scrollToScheduler()} />
        <ServicesSection onRequestServiceDiagnosis={(cat) => scrollToScheduler(cat)} />
        <SectorsAndProofSection onRequestDiagnosis={(cat) => scrollToScheduler(cat)} />
        <VisitSchedulerSection preselectedCategory={preselectedCategory} />
      </main>
      <Footer onOpenAdmin={() => navigateToView('admin')} />
    </div>
  );
}
