'use client';

import * as React from 'react';
import { 
  Search, Filter, Plus, Download, ChevronLeft, ChevronRight,
  Phone, Mail, MessageSquare, Zap, MoreHorizontal
} from 'lucide-react';
import { 
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  Table, TableRenderers,
  Button, Input, Select, Badge, StatusBadge, Avatar,
  Modal, formatCurrency, formatDate, cn
} from '@step-in-crm/ui';
import { getLeads, getUsers, createLead, updateLead, deleteLead } from '@/actions/data';

export async function LeadsContent({ initialParams }: { initialParams: { page?: string; status?: string; search?: string } }) {
  const [users] = await Promise.all([getUsers()]);
  
  const userOptions = users.map(u => ({ value: u.id, label: u.name }));
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'unqualified', label: 'Unqualified' },
    { value: 'lost', label: 'Lost' },
  ];
  const sourceOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'meta', label: 'Meta Ads' },
    { value: 'google', label: 'Google Ads' },
    { value: 'website', label: 'Website' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'indiamart', label: 'IndiaMART' },
    { value: 'tradeindia', label: 'TradeIndia' },
    { value: 'referral', label: 'Referral' },
  ];

  return (
    <LeadsClient 
      initialParams={initialParams}
      users={userOptions}
      statusOptions={statusOptions}
      sourceOptions={sourceOptions}
    />
  );
}

function LeadsClient({ 
  initialParams, 
  users, 
  statusOptions, 
  sourceOptions 
}: { 
  initialParams: { page?: string; status?: string; search?: string };
  users: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
}) {
  const [page, setPage] = React.useState(Number(initialParams.page) || 1);
  const [pageSize, setPageSize] = React.useState(25);
  const [statusFilter, setStatusFilter] = React.useState(initialParams.status || '');
  const [searchQuery, setSearchQuery] = React.useState(initialParams.search || '');
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  const [selectedLeads, setSelectedLeads] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{ leads: any[]; total: number }>({ leads: [], total: 0 });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    name: '', phone: '', email: '', company: '', designation: '', 
    territory: '', source: 'manual', assignedTo: '', status: 'new'
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const fetchLeads = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLeads({
        page,
        pageSize,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        sortBy: sortConfig.key,
        sortDir: sortConfig.direction,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, searchQuery, sortConfig]);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone || '',
      email: lead.email || '',
      company: lead.company || '',
      designation: lead.designation || '',
      territory: lead.territory || '',
      source: lead.source,
      assignedTo: lead.assignedTo || '',
      status: lead.status,
    });
    setModalOpen(true);
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setFormData({
      name: '', phone: '', email: '', company: '', designation: '', 
      territory: '', source: 'manual', assignedTo: '', status: 'new'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    // Validation
    if (!formData.name.trim()) setFormErrors.name = 'Name is required';
    if (!formData.phone.trim()) setFormErrors.phone = 'Phone is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormErrors.email = 'Invalid email format';
    }
    if (Object.keys(formErrors).length > 0) return;

    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData);
      } else {
        await createLead(formData);
      }
      setModalOpen(false);
      fetchLeads();
    } catch (error) {
      console.error('Failed to save lead:', error);
    }
  };

  const handleDelete = async (lead: any) => {
    if (confirm(`Delete lead "${lead.name}"?`)) {
      await deleteLead(lead.id);
      fetchLeads();
    }
  };

  const columns = [
    { 
      key: 'score', 
      header: 'Score', 
      width: '70px', 
      render: (lead: any) => (
        <Badge variant={lead.score >= 70 ? 'danger' : lead.score >= 40 ? 'warning' : 'success'} size="sm">
          {lead.score}
        </Badge>
      ),
      sortable: true 
    },
    { 
      key: 'name', 
      header: 'Name / Company', 
      minWidth: '250px',
      render: (lead: any) => (
        <div>
          <div className="flex items-center gap-2">
            <Avatar name={lead.name} size="xs" />
            <div>
              <p className="font-medium text-text truncate max-w-[200px]">{lead.name}</p>
              {lead.company && <p className="text-xs text-text-muted truncate max-w-[200px]">{lead.company}</p>}
            </div>
          </div>
        </div>
      ),
      sortable: true 
    },
    { 
      key: 'contact', 
      header: 'Contact', 
      width: '180px',
      render: (lead: any) => (
        <div className="text-sm">
          {lead.phone && <p className="truncate">{lead.phone}</p>}
          {lead.email && <p className="text-text-muted truncate">{lead.email}</p>}
        </div>
      ) 
    },
    { 
      key: 'source', 
      header: 'Source', 
      width: '120px',
      render: (lead: any) => (
        <Badge variant="info" size="sm">
          {sourceOptions.find(s => s.value === lead.source)?.label || lead.source}
        </Badge>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      width: '130px',
      render: (lead: any) => <StatusBadge status={lead.status} size="sm" />,
      sortable: true 
    },
    { 
      key: 'assignedTo', 
      header: 'Assignee', 
      width: '130px',
      render: (lead: any) => (
        lead.assignedTo ? (
          <div className="flex items-center gap-2">
            <Avatar 
              name={users.find(u => u.value === lead.assignedTo)?.label || 'User'} 
              size="xs" 
            />
            <span className="text-sm text-text truncate max-w-[100px]">
              {users.find(u => u.value === lead.assignedTo)?.label || 'Unknown'}
            </span>
          </div>
        ) : (
          <span className="text-text-muted text-sm">Unassigned</span>
        )
      ) 
    },
    { 
      key: 'createdAt', 
      header: 'Created', 
      width: '120px',
      render: (lead: any) => formatDate(lead.createdAt),
      sortable: true 
    },
    { 
      key: 'actions', 
      header: '', 
      width: '60px',
      render: (lead: any) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRowClick(lead); }} aria-label="Edit lead">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ) 
    },
  ];

  const rowActions = [
    {
      label: 'Call',
      icon: <Phone className="h-4 w-4" />,
      onClick: (lead: any) => alert(`Call ${lead.phone}`),
    },
    {
      label: 'WhatsApp',
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: (lead: any) => alert(`WhatsApp ${lead.whatsappNumber || lead.phone}`),
    },
    {
      label: 'Email',
      icon: <Mail className="h-4 w-4" />,
      onClick: (lead: any) => alert(`Email ${lead.email}`),
    },
    {
      label: 'AI Qualify',
      icon: <Zap className="h-4 w-4" />,
      onClick: (lead: any) => alert(`AI Qualify ${lead.name}`),
      variant: 'default' as const,
    },
    {
      label: 'Delete',
      icon: <MoreHorizontal className="h-4 w-4" />,
      onClick: (lead: any) => handleDelete(lead),
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Leads</h1>
          <p className="text-text-muted mt-1">Manage and qualify your leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateLead}>
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md">
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search by name, company, email, phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              options={[{ value: '', label: 'All Status' }, ...statusOptions]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              placeholder="Status"
              className="w-[150px]"
            />
            <Select
              options={[{ value: '', label: 'All Sources' }, ...sourceOptions]}
              value={''}
              onChange={() => {}}
              placeholder="Source"
              className="w-[150px]"
            />
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card variant="default" padding="none">
        <Table
          columns={columns}
          data={data.leads}
          keyExtractor={(lead) => lead.id}
          loading={loading}
          emptyMessage="No leads found. Create your first lead to get started."
          emptyAction={
            <Button variant="primary" size="sm" onClick={handleCreateLead}>
              <Plus className="h-4 w-4 mr-2" />
              Create Lead
            </Button>
          }
          onRowClick={handleRowClick}
          selection={{
            selectedKeys: selectedLeads,
            onChange: setSelectedLeads,
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
          rowActions={rowActions}
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLead(null); }}
        title={editingLead ? 'Edit Lead' : 'New Lead'}
        size="lg"
        variant="form"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => { setModalOpen(false); setEditingLead(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {editingLead ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              error={formErrors.name}
              required
            />
            <Input
              label="Phone *"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              error={formErrors.phone}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              error={formErrors.email}
            />
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
            <Input
              label="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({...formData, designation: e.target.value})}
            />
            <Input
              label="Territory"
              value={formData.territory}
              onChange={(e) => setFormData({...formData, territory: e.target.value})}
            />
            <Select
              label="Source"
              options={sourceOptions}
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            />
            <Select
              label="Assigned To"
              options={[{ value: '', label: 'Unassigned' }, ...users]}
              value={formData.assignedTo}
              onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}