'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Mail, MailOpen, MousePointerClick, ArrowLeft, TrendingUp, Eye, Loader2, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  requirement: string;
  submitted_at: string;
  email_sent: boolean;
  opened: boolean;
  clicked: boolean;
};

type Stats = {
  totalLeads: number;
  emailsSent: number;
  emailsOpened: number;
  linkClicks: number;
  openRate: number;
  clickRate: number;
};

type LeadWithClassification = Lead & {
  category: string;
  priority: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  'AI Automation': '#3b82f6',
  'Web Development': '#10b981',
  'Mobile App': '#f59e0b',
  'Marketing': '#ec4899',
  'Other': '#94a3b8',
};

const PRIORITY_COLORS: Record<string, string> = {
  'High': '#ef4444',
  'Medium': '#f59e0b',
  'Low': '#22c55e',
};

function classifyLead(requirement: string): { category: string; priority: string } {
  const req = requirement.toLowerCase();

  let category = 'Other';

  if (req.includes('chatbot') || req.includes('ai') || req.includes('automation')) {
    category = 'AI Automation';
  } else if (req.includes('website') || req.includes('web') || req.includes('landing page')) {
    category = 'Web Development';
  } else if (req.includes('mobile') || req.includes('app') || req.includes('ios') || req.includes('android')) {
    category = 'Mobile App';
  } else if (req.includes('marketing') || req.includes('seo') || req.includes('social media')) {
    category = 'Marketing';
  }

  const priority =
    category === 'AI Automation' ? 'High' :
    category === 'Web Development' ? 'Medium' :
    'Low';

  return { category, priority };
}

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadWithClassification[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    emailsSent: 0,
    emailsOpened: 0,
    linkClicks: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      const leadsWithClassification = (data.leads || []).map((lead: Lead) => ({
        ...lead,
        ...classifyLead(lead.requirement),
      }));
      setLeads(leadsWithClassification);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = () => {
    const counts: Record<string, number> = {};
    leads.forEach((lead) => {
      counts[lead.category] = (counts[lead.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getChartData = () => {
    return [
      { name: 'Total', value: stats.totalLeads },
      { name: 'Sent', value: stats.emailsSent },
      { name: 'Opened', value: stats.emailsOpened },
      { name: 'Clicked', value: stats.linkClicks },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">LeadFlow AI</span>
            </div>
          </div>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            New Lead
          </Button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600 mb-8">Track your leads and email performance</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
              <p className="text-sm text-slate-500">Total Leads</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.emailsSent}</div>
              <p className="text-sm text-slate-500">Emails Sent</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <MailOpen className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.emailsOpened}</div>
              <p className="text-sm text-slate-500">Emails Opened</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.openRate.toFixed(1)}%</div>
              <p className="text-sm text-slate-500">Open Rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointerClick className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.linkClicks}</div>
              <p className="text-sm text-slate-500">Link Clicks</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart2 className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.clickRate.toFixed(1)}%</div>
              <p className="text-sm text-slate-500">Click Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Lead Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Lead Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Priority</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Opened</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Clicked</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        No leads yet. Submit the form to get started.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{lead.name}</div>
                          {lead.company && (
                            <div className="text-sm text-slate-500">{lead.company}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{lead.email}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[lead.category]}20`,
                              color: CATEGORY_COLORS[lead.category],
                            }}
                          >
                            {lead.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${PRIORITY_COLORS[lead.priority]}20`,
                              color: PRIORITY_COLORS[lead.priority],
                            }}
                          >
                            {lead.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {lead.email_sent ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {lead.opened ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {lead.clicked ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">
                          {new Date(lead.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
