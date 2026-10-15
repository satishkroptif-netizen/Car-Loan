'use client';

import * as React from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, MoreHorizontal, DollarSign, User, Calendar, TrendingUp,
  Filter, Download, Search
} from 'lucide-react';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, Badge, StageBadge, Avatar, Modal, Input, Select,
  formatCurrency, formatDate, cn
} from '@step-in-crm/ui';
import { getDeals, getUsers, createDeal, updateDeal, advanceDealStage, getLeads } from '@/actions/data';

const STAGES = [
  { key: 'qualify', label: 'Qualify', color: 'bg-accent', order: 1 },
  { key: 'propose', label: 'Propose', color: 'bg-info', order: 2 },
  { key: 'negotiate', label: 'Negotiate', color: 'bg-warning', order: 3 },
  { key: 'close_won', label: 'Won', color: 'bg-success', order: 4 },
  { key: 'close_lost', label: 'Lost', color: 'bg-danger', order: 5 },
] as const;

type StageKey = typeof STAGES[number]['key'];

interface DealCardProps {
  deal: any;
  users: { value: string; label: string }[];
  onClick: (deal: any) => void;
  onAdvance: (deal: any, stage: StageKey) => void;
}

function DealCard({ deal, users, onClick, onAdvance }: DealCardProps) {
  const assignee = users.find(u => u.value === deal.assignedTo);
  const age = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div
      className="bg-surface border border-border rounded-lg p-3 shadow-sm hover:shadow-lg transition-all duration-fast cursor-pointer"
      onClick={() => onClick(deal)}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id: deal.id, fromStage: deal.stage }));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-text truncate flex-1">{deal.name}</h4>
        <StageBadge stage={deal.stage} size="sm" />
      </div>
      <p className="text-2xl font-bold text-text mb-2">{formatCurrency(deal.valueCents)}</p>
      <div className="space-y-1.5 text-xs text-text-muted">
        {deal.leadId && <p className="truncate">Lead: {deal.leadId.slice(0, 8)}...</p>}
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span className="truncate">{assignee?.label || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'No close date'}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{age}d old • {deal.probability}%</span>
        </div>
      </div>
    </div>
  );
}

interface PipelineColumnProps {
  stage: StageKey;
  deals: any[];
  users: { value: string; label: string }[];
  onDealClick: (deal: any) => void;
  onAdvance: (deal: any, stage: StageKey) => void;
  onDrop: (e: React.DragEvent, targetStage: StageKey) => void;
  onDragOver: (e: React.DragEvent) => void;
}

function PipelineColumn({ stage, deals, users, onDealClick, onAdvance, onDrop, onDragOver }: PipelineColumnProps) {
  const stageInfo = STAGES.find(s => s.key === stage)!;
  const totalValue = deals.reduce((sum, d) => sum + d.valueCents, 0);
  const isClosed = ['close_won', 'close_lost'].includes(stage);

  return (
    <div
      className="flex flex-col min-w-[320px] max-w-[320px] bg-surface-elevated/50 rounded-xl border border-border"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', stageInfo.color)} />
          <h3 className="font-semibold text-text capitalize">{stageInfo.label}</h3>
          <Badge variant="default" size="sm">{deals.length}</Badge>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-text">{formatCurrency(totalValue)}</p>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 min-h-[400px] overflow-y-auto" role="list" aria-label={`${stageInfo.label} stage`}>
        {deals.length === 0 ? (
          <div className="text-center text-text-muted py-8">
            <p className="mb-2">No deals in this stage</p>
            {!isClosed && (
              <Button variant="ghost" size="sm" onClick={() => onAdvance({ id: 'new' }, stage)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Deal
              </Button>
            )}
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              users={users}
              onClick={onDealClick}
              onAdvance={onAdvance}
            />
          ))
        )}
      </div>
      {!isClosed && (
        <div className="p-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onAdvance({ id: 'new' }, stage)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Deal
          </Button>
        </div>
      )}
    </div>
  );
}

export async function PipelineContent() {
  const [dealsResult, users] = await Promise.all([
    getDeals({ pageSize: 100 }),
    getUsers(),
  ]);
  
  const userOptions = users.map(u => ({ value: u.id, label: u.name }));
  const deals = dealsResult.data;

  // Group deals by stage
  const dealsByStage = STAGES.reduce((acc, s) => {
    acc[s.key] = deals.filter(d => d.stage === s.key);
    return acc;
  }, {} as Record<StageKey, any[]>);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    name: '', valueCents: 0, stage: 'qualify' as StageKey, 
    expectedCloseDate: '', assignedTo: '', leadId: '', probability: 10
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [leads, setLeads] = React.useState<any[]>([]);

  React.useEffect(() => {
    getLeads({ pageSize: 100, status: 'qualified' }).then(r => setLeads(r.data));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: StageKey) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.fromStage !== targetStage) {
        advanceDealStage(data.id, targetStage).then(() => window.location.reload());
      }
    } catch (err) {
      console.error('Drop failed:', err);
    }
  };

  const handleDealClick = (deal: any) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      valueCents: deal.valueCents,
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
      assignedTo: deal.assignedTo || '',
      leadId: deal.leadId || '',
      probability: deal.probability,
    });
    setModalOpen(true);
  };

  const handleCreateDeal = (stage: StageKey) => {
    setEditingDeal(null);
    setFormData({
      name: '', valueCents: 0, stage, expectedCloseDate: '', assignedTo: '', leadId: '', probability: 10
    });
    setModalOpen(true);
  };

  const handleAdvance = (deal: any, targetStage: StageKey) => {
    if (deal.id === 'new') {
      handleCreateDeal(targetStage);
    } else {
      advanceDealStage(deal.id, targetStage).then(() => window.location.reload());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!formData.name.trim()) setFormErrors.name = 'Deal name is required';
    if (formData.valueCents <= 0) setFormErrors.valueCents = 'Value must be greater than 0';
    if (Object.keys(formErrors).length > 0) return;

    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, formData);
      } else {
        await createDeal(formData);
      }
      setModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to save deal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Pipeline</h1>
          <p className="text-text-muted mt-1">Drag and drop deals to advance stages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleCreateDeal('qualify')}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max" role="tablist" aria-label="Sales pipeline stages">
          {STAGES.map((stageInfo) => (
            <PipelineColumn
              key={stageInfo.key}
              stage={stageInfo.key}
              deals={dealsByStage[stageInfo.key]}
              users={userOptions}
              onDealClick={handleDealClick}
              onAdvance={handleAdvance}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          ))}
        </div>
      </div>

      {/* Create/Edit Deal Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingDeal(null); }}
        title={editingDeal ? 'Edit Deal' : 'New Deal'}
        size="lg"
        variant="form"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => { setModalOpen(false); setEditingDeal(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={false}>
              {editingDeal ? 'Save Changes' : 'Create Deal'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Deal Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              error={formErrors.name}
              required
            />
            <Input
              label="Value (₹) *"
              type="number"
              min="1"
              value={formData.valueCents / 100}
              onChange={(e) => setFormData({...formData, valueCents: Math.round(parseFloat(e.target.value) * 100)})}
              error={formErrors.valueCents}
              required
            />
            <Select
              label="Stage"
              options={STAGES.map(s => ({ value: s.key, label: s.label }))}
              value={formData.stage}
              onChange={(e) => setFormData({...formData, stage: e.target.value as StageKey})}
            />
            <Input
              label="Expected Close Date"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
            />
            <Select
              label="Assigned To"
              options={[{ value: '', label: 'Unassigned' }, ...userOptions]}
              value={formData.assignedTo}
              onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
            />
            <Select
              label="Lead"
              options={[{ value: '', label: 'No Lead' }, ...leads.map(l => ({ value: l.id, label: `${l.name} (${l.company})` }))]}
              value={formData.leadId}
              onChange={(e) => setFormData({...formData, leadId: e.target.value})}
            />
            <Input
              label="Probability (%)"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value) || 0})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}