'use client';

import * as React from 'react';
import { 
  Users, TrendingUp, Target, Zap, 
  ChevronRight, Plus, Filter, Download,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Table, TableRenderers,
  Badge, StatusBadge, StageBadge,
  Button, Avatar,
  formatCurrency
} from '@step-in-crm/ui';
import { getDashboardStats, getPipelineSummary, getRecentActivities, getHotLeads } from '@/actions/data';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; label: string };
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <Card variant="kpi" padding="md">
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>
          <p className="text-3xl font-bold text-text mt-1">{value}</p>
          {change && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted')}>
              {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
              {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend === 'neutral' && <Minus className="h-3.5 w-3.5" />}
              <span className="font-medium">{change.value >= 0 ? '+' : ''}{change.value}%</span>
              <span className="text-text-muted">{change.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconBg)}>
          {React.cloneElement(icon as React.ReactElement, { className: cn('h-6 w-6', iconColor) })}
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@step-in-crm/ui';

export async function DashboardContent() {
  const [stats, pipeline, activities, hotLeads] = await Promise.all([
    getDashboardStats(),
    getPipelineSummary(),
    getRecentActivities(5),
    getHotLeads(5),
  ]);

  const pipelineStages = [
    { key: 'qualify', label: 'Qualify', color: 'bg-accent' },
    { key: 'propose', label: 'Propose', color: 'bg-info' },
    { key: 'negotiate', label: 'Negotiate', color: 'bg-warning' },
    { key: 'close_won', label: 'Won', color: 'bg-success' },
    { key: 'close_lost', label: 'Lost', color: 'bg-danger' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted mt-1">Overview of your sales pipeline and team performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Leads This Month"
          value={stats.leadsThisMonth}
          change={value: 12, label: 'vs last month'}
          trend="up"
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-accent-light"
          iconColor="text-accent"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats.pipelineValue)}
          change={value: 8, label: 'vs last month'}
          trend="up"
          icon={<TrendingUp className="h-6 w-6" />}
          iconBg="bg-success-light"
          iconColor="text-success"
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          change={value: -2, label: 'vs last month'}
          trend="down"
          icon={<Target className="h-6 w-6" />}
          iconBg="bg-warning-light"
          iconColor="text-warning"
        />
        <StatCard
          title="AI Qualified"
          value={stats.aiQualified}
          change={value: 25, label: 'vs last month'}
          trend="up"
          icon={<Zap className="h-6 w-6" />}
          iconBg="bg-info-light"
          iconColor="text-info"
        />
      </div>

      {/* Pipeline Funnel + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>Deal count and value per stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipeline.map((stage, index) => {
              const stageInfo = pipelineStages.find(s => s.key === stage.stage);
              const isLast = index === pipeline.length - 1;
              return (
                <div key={stage.stage} className={cn('relative', !isLast && 'pb-4')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', stageInfo?.color)} />
                      <span className="text-sm font-medium text-text capitalize">{stageInfo?.label || stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text">{stage.count}</p>
                      <p className="text-xs text-text-muted">{formatCurrency(stage.totalValueCents)}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', stageInfo?.color)}
                      style={{ width: `${pipeline.length > 0 ? (stage.count / Math.max(...pipeline.map(p => p.count))) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button variant="ghost" size="sm" className="w-full">
              View Full Pipeline
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest team actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-elevated/50 transition-colors">
                <div className={cn('p-2 rounded-full', 
                  activity.type === 'call' && 'bg-accent-light text-accent',
                  activity.type === 'email' && 'bg-success-light text-success',
                  activity.type === 'meeting' && 'bg-warning-light text-warning',
                  activity.type === 'note' && 'bg-info-light text-info',
                )}>
                  {activity.type === 'call' && <span>📞</span>}
                  {activity.type === 'email' && <span>✉️</span>}
                  {activity.type === 'meeting' && <span>🤝</span>}
                  {activity.type === 'note' && <span>📝</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{activity.subject}</p>
                  <p className="text-xs text-text-muted truncate">{activity.relatedType}: {activity.relatedId}</p>
                </div>
                <span className="text-xs text-text-muted shrink-0">
                  {new Date(activity.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-text-muted text-center py-4">No recent activity</p>
            )}
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button variant="ghost" size="sm" className="w-full">
              View All Activity
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Hot Leads */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Hot Leads</CardTitle>
            <CardDescription>High-score leads needing attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hotLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-elevated/50 transition-colors cursor-pointer">
                <Avatar name={lead.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text truncate">{lead.name}</p>
                    <StatusBadge status={lead.status} size="sm" />
                  </div>
                  <p className="text-xs text-text-muted truncate">{lead.company}</p>
                </div>
                <div className="text-right">
                  <Badge variant="accent" size="sm">{lead.score}</Badge>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
            {hotLeads.length === 0 && (
              <p className="text-text-muted text-center py-4">No hot leads</p>
            )}
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button variant="ghost" size="sm" className="w-full">
              View All Leads
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}