'use client';

import * as React from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, MoreHorizontal, Download, Filter, Search,
  DollarSign, User, Calendar, TrendingUp, Truck, Package, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Table, TableRenderers,
  Button, Input, Select, Badge, Avatar, Modal,
  formatCurrency, formatDate, cn
} from '@step-in-crm/ui';
import { getOrders, getContacts, createOrder, updateOrder } from '@/actions/data';

const ORDER_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'confirmed', label: 'Confirmed', color: 'info' },
  { value: 'processing', label: 'Processing', color: 'warning' },
  { value: 'shipped', label: 'Shipped', color: 'accent' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
] as const;

function statusBadge(status: string) {
  const config = ORDER_STATUSES.find(s => s.value === status) || { value: status, label: status, color: 'default' };
  const colorMap: Record<string, string> = {
    default: 'default', info: 'info', warning: 'warning', 
    accent: 'accent', success: 'success', danger: 'danger'
  };
  return <Badge variant={colorMap[config.color] as any} size="sm">{config.label}</Badge>;
}

export async function OrdersContent({ initialParams }: { initialParams: { page?: string; status?: string; search?: string } }) {
  const [contactsResult] = await Promise.all([getContacts({ pageSize: 100, type: 'customer' })]);
  const contactOptions = contactsResult.data.map(c => ({ value: c.id, label: `${c.name} (${c.company})` }));

  return (
    <OrdersClient 
      initialParams={initialParams}
      contacts={contactOptions}
    />
  );
}

function OrdersClient({ 
  initialParams, 
  contacts 
}: { 
  initialParams: { page?: string; status?: string; search?: string };
  contacts: { value: string; label: string }[];
}) {
  const [page, setPage] = React.useState(Number(initialParams.page) || 1);
  const [pageSize, setPageSize] = React.useState(25);
  const [statusFilter, setStatusFilter] = React.useState(initialParams.status || '');
  const [searchQuery, setSearchQuery] = React.useState(initialParams.search || '');
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  const [selectedOrders, setSelectedOrders] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{ orders: any[]; total: number }>({ orders: [], total: 0 });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    customerId: '', orderNumber: '', status: 'draft',
    items: [] as any[],
    logisticsPartner: '', trackingNumber: '',
    shippingAddress: '', billingAddress: '',
    subtotalCents: 0, taxCents: 0, discountCents: 0, totalCents: 0,
    expectedDate: '',
  });
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrders({
        page,
        pageSize,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (order: any) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items,
      logisticsPartner: order.logisticsPartner || '',
      trackingNumber: order.trackingNumber || '',
      shippingAddress: JSON.stringify(order.shippingAddress, null, 2),
      billingAddress: JSON.stringify(order.billingAddress, null, 2),
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
      discountCents: order.discountCents,
      totalCents: order.totalCents,
      expectedDate: order.expectedDate ? new Date(order.expectedDate).toISOString().split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setFormData({
      customerId: '', orderNumber: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, status: 'draft',
      items: [], logisticsPartner: '', trackingNumber: '',
      shippingAddress: '{}', billingAddress: '{}',
      subtotalCents: 0, taxCents: 0, discountCents: 0, totalCents: 0,
      expectedDate: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!formData.customerId) setFormErrors.customerId = 'Customer is required';
    if (!formData.orderNumber.trim()) setFormErrors.orderNumber = 'Order number is required';
    if (Object.keys(formErrors).length > 0) return;

    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, formData);
      } else {
        await createOrder(formData);
      }
      setModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const columns = [
    { 
      key: 'orderNumber', 
      header: 'Order #', 
      width: '140px',
      render: (order: any) => (
        <code className="text-sm font-mono text-text">{order.orderNumber}</code>
      ),
      sortable: true 
    },
    { 
      key: 'customer', 
      header: 'Customer', 
      minWidth: '200px',
      render: (order: any) => (
        <div>
          <p className="font-medium text-text truncate max-w-[180px]">{contacts.find(c => c.value === order.customerId)?.label || order.customerId}</p>
        </div>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      width: '130px',
      render: (order: any) => statusBadge(order.status),
      sortable: true 
    },
    { 
      key: 'totalCents', 
      header: 'Total', 
      width: '130px',
      render: (order: any) => formatCurrency(order.totalCents),
      sortable: true 
    },
    { 
      key: 'logisticsPartner', 
      header: 'Logistics', 
      width: '130px',
      render: (order: any) => order.logisticsPartner || <span className="text-text-muted">—</span> 
    },
    { 
      key: 'trackingNumber', 
      header: 'Tracking', 
      width: '150px',
      render: (order: any) => order.trackingNumber || <span className="text-text-muted">—</span> 
    },
    { 
      key: 'expectedDate', 
      header: 'Expected', 
      width: '120px',
      render: (order: any) => order.expectedDate ? formatDate(order.expectedDate) : <span className="text-text-muted">—</span>,
      sortable: true 
    },
    { 
      key: 'createdAt', 
      header: 'Created', 
      width: '120px',
      render: (order: any) => formatDate(order.createdAt),
      sortable: true 
    },
    { 
      key: 'actions', 
      header: '', 
      width: '60px',
      render: (order: any) => (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRowClick(order); }} aria-label="Edit order">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Orders</h1>
          <p className="text-text-muted mt-1">Manage orders and fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreateOrder}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md">
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search by order #, customer..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              options={[{ value: '', label: 'All Status' }, ...ORDER_STATUSES]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              placeholder="Status"
              className="w-[150px]"
            />
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card variant="default" padding="none">
        <Table
          columns={columns}
          data={data.orders}
          keyExtractor={(order) => order.id}
          loading={loading}
          emptyMessage="No orders found. Create your first order to get started."
          emptyAction={
            <Button variant="primary" size="sm" onClick={handleCreateOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          }
          onRowClick={handleRowClick}
          selection={{
            selectedKeys: selectedOrders,
            onChange: setSelectedOrders,
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

      {/* Create/Edit Order Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingOrder(null); }}
        title={editingOrder ? 'Edit Order' : 'New Order'}
        size="xl"
        variant="form"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => { setModalOpen(false); setEditingOrder(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={false}>
              {editingOrder ? 'Save Changes' : 'Create Order'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Customer *"
              options={[{ value: '', label: 'Select Customer' }, ...contacts]}
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              error={formErrors.customerId}
              required
            />
            <Input
              label="Order Number *"
              value={formData.orderNumber}
              onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
              error={formErrors.orderNumber}
              required
            />
            <Select
              label="Status"
              options={ORDER_STATUSES}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            />
            <Input
              label="Expected Date"
              type="date"
              value={formData.expectedDate}
              onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
            />
            <Input
              label="Logistics Partner"
              value={formData.logisticsPartner}
              onChange={(e) => setFormData({...formData, logisticsPartner: e.target.value})}
            />
            <Input
              label="Tracking Number"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1.5">Shipping Address (JSON)</label>
              <textarea
                className="w-full h-32 font-mono text-sm p-3 bg-surface border border-border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                value={formData.shippingAddress}
                onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                placeholder='{"address": "123 Main St", "city": "Bangalore", "state": "KA", "pincode": "560001"}'
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1.5">Billing Address (JSON)</label>
              <textarea
                className="w-full h-32 font-mono text-sm p-3 bg-surface border border-border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                value={formData.billingAddress}
                onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                placeholder='{"address": "123 Main St", "city": "Bangalore", "state": "KA", "pincode": "560001"}'
              />
            </div>
            <Input
              label="Subtotal (₹)"
              type="number"
              min="0"
              value={formData.subtotalCents / 100}
              onChange={(e) => setFormData({...formData, subtotalCents: Math.round(parseFloat(e.target.value) * 100)})}
            />
            <Input
              label="Tax (₹)"
              type="number"
              min="0"
              value={formData.taxCents / 100}
              onChange={(e) => setFormData({...formData, taxCents: Math.round(parseFloat(e.target.value) * 100)})}
            />
            <Input
              label="Discount (₹)"
              type="number"
              min="0"
              value={formData.discountCents / 100}
              onChange={(e) => setFormData({...formData, discountCents: Math.round(parseFloat(e.target.value) * 100)})}
            />
            <Input
              label="Total (₹)"
              type="number"
              min="0"
              value={formData.totalCents / 100}
              onChange={(e) => setFormData({...formData, totalCents: Math.round(parseFloat(e.target.value) * 100)})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}