import { useState } from "react";
import { Link } from "wouter";
import { useFeedbackStats, useFeedbackList } from "@/hooks/use-feedback";
import { StatsCard } from "@/components/StatsCard";
import { 
  BarChart3, 
  Smile, 
  Meh, 
  Frown, 
  Download, 
  History, 
  LayoutDashboard, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { type DateFilter } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [page, setPage] = useState(1);
  
  const { data: stats, isLoading: statsLoading } = useFeedbackStats(dateFilter);
  const { data: history, isLoading: historyLoading } = useFeedbackList(page);

  const chartData = {
    labels: ['Muito Satisfeito', 'Satisfeito', 'Insatisfeito'],
    datasets: [
      {
        label: 'Votos',
        data: [
          stats?.breakdown.very_satisfied || 0,
          stats?.breakdown.satisfied || 0,
          stats?.breakdown.dissatisfied || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // Green
          'rgba(250, 204, 21, 0.6)', // Yellow
          'rgba(239, 68, 68, 0.6)', // Red
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(250, 204, 21)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-display font-bold text-2xl">
            <BarChart3 className="w-8 h-8" />
            <span>Kiosk<span className="text-slate-400">Admin</span></span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'overview' 
                ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'history' 
                ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-5 h-5" />
            Histórico
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-slate-50 rounded-xl p-4">
             <h4 className="font-semibold text-sm text-slate-900">Precisa de Ajuda?</h4>
             <p className="text-xs text-slate-500 mt-1">Contacte o suporte para assistência com exportação de dados.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 lg:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              {activeTab === 'overview' ? 'Visão Geral do Painel' : 'Histórico de Feedback'}
            </h1>
            <p className="text-slate-500 mt-1">
              Bem-vindo de volta. Aqui está o que está a acontecer hoje.
            </p>
          </div>

          <div className="flex gap-3">
             <a 
               href="/api/export/csv" 
               download
               className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
             >
               <Download className="w-4 h-4" />
               CSV
             </a>
             <a 
               href="/api/export/txt" 
               download
               className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
             >
               <Download className="w-4 h-4" />
               TXT
             </a>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <div className="space-y-6 animate-in">
            {/* Filter */}
            <div className="flex gap-2 mb-6">
              {(['today', 'week', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    dateFilter === filter
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter === 'today' ? 'Hoje' : filter === 'week' ? 'Esta Semana' : 'Sempre'}
                </button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                title="Total de Feedback" 
                value={stats?.total || 0} 
                icon={BarChart3} 
                className="border-l-4 border-l-blue-500"
                colorClass="text-blue-500 bg-blue-500"
              />
              <StatsCard 
                title="Muito Satisfeito" 
                value={stats?.total ? stats.breakdown.very_satisfied : 0} 
                description={`${stats?.percentages.very_satisfied || '0%'} do total`}
                icon={Smile} 
                className="border-l-4 border-l-green-500"
                colorClass="text-green-500 bg-green-500"
              />
              <StatsCard 
                title="Satisfeito" 
                value={stats?.total ? stats.breakdown.satisfied : 0} 
                description={`${stats?.percentages.satisfied || '0%'} do total`}
                icon={Meh} 
                className="border-l-4 border-l-yellow-400"
                colorClass="text-yellow-500 bg-yellow-400"
              />
              <StatsCard 
                title="Insatisfeito" 
                value={stats?.total ? stats.breakdown.dissatisfied : 0} 
                description={`${stats?.percentages.dissatisfied || '0%'} do total`}
                icon={Frown} 
                className="border-l-4 border-l-red-500"
                colorClass="text-red-500 bg-red-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-lg font-bold font-display text-slate-900 mb-6">Distribuição de Satisfação</h3>
                <div className="h-64 md:h-80 w-full">
                  {!statsLoading && <Bar options={chartOptions} data={chartData} />}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-lg font-bold font-display text-slate-900 mb-6">Resumo Rápido</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                      <Smile className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Mais Popular</p>
                      <p className="text-xs text-green-700">Muito Satisfeito lidera com {stats?.percentages.very_satisfied || '0%'} </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-3 bg-slate-100 rounded-full text-slate-600">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Período Atual</p>
                      <p className="text-xs text-slate-500">
                        {dateFilter === 'today' ? 'A mostrar dados de hoje' : 
                         dateFilter === 'week' ? 'A mostrar os últimos 7 dias' : 'A mostrar dados de sempre'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden animate-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-900">ID</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Avaliação</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Data</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">A carregar registos...</td>
                    </tr>
                  ) : history?.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum registo encontrado.</td>
                    </tr>
                  ) : (
                    history?.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-slate-500">#{item.id}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            item.rating === 'very_satisfied' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.rating === 'satisfied' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {item.rating === 'very_satisfied' && '🤩 Muito Satisfeito'}
                            {item.rating === 'satisfied' && '🙂 Satisfeito'}
                            {item.rating === 'dissatisfied' && '🙁 Insatisfeito'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {format(new Date(item.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                          {format(new Date(item.createdAt), 'HH:mm:ss')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-sm text-slate-500">Página {page}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!history || history.items.length < 20} // Assuming 20 is limit
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Seguinte <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
