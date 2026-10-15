'use client';

import * as React from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, MoreHorizontal, Download, Filter, Search,
  DollarSign, User, Calendar, TrendingUp, MoreHorizontal as MoreHorizontalIcon
} from 'lucide-react';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Table, TableRenderers,
  Button, Input, Select, Badge, StageBadge, Avatar, Modal,
  formatCurrency, formatDate, cn
} from '@step-in-crm/ui';
import { getDeals, getUsers, createDeal, updateDeal, advanceDealStage, getLeads } from '@/actions/data';

export async function DealsContent({ initialParams }: { initialParams: { page?: string; stage?: string; search?: string } }) {
  const [users, leadsResult] = await Promise.all([
    getUsers(),
    getLeads({ pageSize: 100, status: 'qualified' }),
  ]);
  
  const userOptions = users.map(u => ({ value: u.id, label: u.name }));
  const leadOptions = leadsResult.data.map(l => ({ value: l.id, label: `${l.name} (${l.company})` }));
  const stageOptions = [
    { value: 'qualify', label: 'Qualify' },
    { value: 'propose', label: 'Propose' },
    { value: 'negotiate', label: 'Negotiate' },
    { value: 'close_won', label: 'Won' },
    { value: 'close_lost', label: 'Lost' },
  ];

  return (
    <DealsClient 
      initialParams={initialParams}
      users={userOptions}
      leads={leadOptions}
      stageOptions={stageOptions}
    />
  );
}

function DealsClient({ 
  initialParams, 
  users, 
  leads, 
  stageOptions 
}: { 
  initialParams: { page?: string; stage?: string; search?: string };
  users: { value: string; label: string }[];
  leads: { value: string; label: string }[];
  stageOptions: { value: string; label: string }[];
}) {
  const [page, setPage] = React.useState(Number(initialParams.page) || 1);
  const [pageSize, setPageSize] = React.useState(25);
  const [stageFilter, setStageFilter] = React.useState(initialParams.stage || '');
  const [searchQuery, setSearchQuery] = React.useState(initialParams.search || '');
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  const [selectedDeals, setSelectedDeals] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{ data: any[]; total: number }>({ data: [], total: 0 });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    name: '', valueCents: 0, stage: 'qualify', 
    expectedCloseDate: '', assignedTo: '', leadId: '', probability: 10
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const fetchDeals = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDeals({
        page,
        pageSize,
        stage: stageFilter || undefined,
        search: searchQuery || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, stageFilter, searchQuery]);

  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (deal: any) => {
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

  const handleCreateDeal = () => {
    setEditingDeal(null);
    setFormData({
      name: '', valueCents: 0, stage: 'qualify', expectedCloseDate: '', assignedTo: '', leadId: '', probability: 10
    });
    setModalOpen(true);
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
      fetchDeals();
    } catch (error) {
      console.error('Failed to save deal:', error);
    }
  };

  const handleAdvanceStage = async (deal: any, newStage: string) => {
    if (confirm(`Move "${deal.name}" to ${newStage}?`)) {
      await advanceDealStage(deal.id, newStage as any);
      fetchDeals();
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Deal Name', 
      minWidth: '250px',
      render: (deal: any) => (
        <div>
          <p className="font-medium text-text truncate max-w-[200px]">{deal.name}</p>
          {deal.leadId && <p className="text-xs text-text-muted">Lead: {deal.leadId.slice(0, 8)}...</p>}
        </div>
      ),
      sortable: true 
    },
    { 
      key: 'valueCents', 
      header: 'Value', 
      width: '130px',
      render: (deal: any) => formatCurrency(deal.valueCents),
      sortable: true 
    },
    { 
      key: 'stage', 
      header: 'Stage', 
      width: '130px',
      render: (deal: any) => <StageBadge stage={deal.stage} size="sm" />,
      sortable: true 
    },
    { 
      key: 'probability', 
      header: 'Probability', 
      width: '100px',
      render: (deal: any) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all" 
              style={{ width: `${deal.probability}%` }}
            />
          </div>
          <span className="text-sm font-medium text-text w-12 text-right">{deal.probability}%</span>
        </div>
      ),
      sortable: true 
    },
    { 
      key: 'expectedCloseDate', 
      header: 'Expected Close', 
      width: '130px',
      render: (deal: any) => deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : <span className="text-text-muted">—</span>,
      sortable: true 
    },
    { 
      key: 'assignedTo', 
      header: 'Assignee', 
      width: '130px',
      render: (deal: any) => (
        deal.assignedTo ? (
          <div className="flex items-center gap-2">
            <Avatar 
              name={users.find(u => u.value === deal.assignedTo)?.label || 'User'} 
              size="xs" 
            />
            <span className="text-sm text-text truncate max-w-[100px]">
              {users.find(u => u.value === deal.assignedTo)?.label || 'Unknown'}
            </span>
          </div>
        ) : (
          <span className="text-text-muted text-sm">Unassigned</span>
        )
      ) 
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      width: '180px',
      render: (deal: any) => (
        <div className="flex items-center justify-center gap-1">
          {stageOptions.filter(s => s.value !== deal.stage).map((stage) => (
            <Button
              key={stage.value}
              variant="ghost"
              size="sm"
              onClick={() => handleAdvanceStage(deal, stage.value)}
              className="text-xs px-2"
            >
              {stage.label}
            </Button>
          ))}
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Deals</h1>
          <p className="text-text-muted mt-1">Manage your deals and opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateDeal}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md">
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              options={[{ value: '', label: 'All Stages' }, ...stageOptions]}
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
              placeholder="Stage"
              className="w-[150px]"
            />
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card variant="default" padding="none">
        <Table
          columns={columns}
          data={data.data}
          keyExtractor={(deal) => deal.id}
          loading={loading}
          emptyMessage="No deals found. Create your first deal to get started."
          emptyAction={
            <Button variant="primary" size="sm" onClick={handleCreateDeal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Deal
            </Button>
          }
          onRowClick={handleRowClick}
          selection={{
            selectedKeys: selectedDeals,
            onChange: setSelectedDeals,
          }}
          sortState={sortConfig}
          onSort={handleSort}
          pagination={{
            page,
            pageSize,
            total: data.total,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </Card>

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
              options={stageOptions}
              value={formData.stage}
              onChange={(e) => setFormData({...formData, stage: e.target.value})}
            />
            <Input
              label="Expected Close Date"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
            />
            <Select
              label="Assigned To"
              options={[{ value: '', label: 'Unassigned' }, ...users]}
              value={formData.assignedTo}
              onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
            />
            <Select
              label="Lead"
              options={[{ value: '', label: 'No Lead' }, ...leads]}
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