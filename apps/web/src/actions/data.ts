'use server';

import { seedData } from '@/lib/seed';
import { Lead, Deal, Order, Contact, User, Organization } from '@step-in-crm/db';
import { revalidatePath } from 'next/cache';

// Simulated database using seed data
const db = {
  leads: [...seedData.leads],
  deals: [...seedData.deals],
  orders: [...seedData.orders],
  contacts: [...seedData.contacts],
  users: [...seedData.users],
  organization: seedData.organization,
};

// Helper to simulate async DB calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getOrgId(): string {
  // In real app, get from auth session
  return seedData.organization.id;
}

// ============================================================
// LEADS
// ============================================================

export async function getLeads(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  assignedTo?: string;
  source?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}): Promise<{ data: Lead[]; total: number }> {
  await delay(100);
  
  const orgId = getOrgId();
  let results = db.leads.filter(l => l.orgId === orgId);
  
  if (params?.status) results = results.filter(l => l.status === params.status);
  if (params?.assignedTo) results = results.filter(l => l.assignedTo === params.assignedTo);
  if (params?.source) results = results.filter(l => l.source === params.source);
  if (params?.search) {
    const s = params.search.toLowerCase();
    results = results.filter(l => 
      l.name.toLowerCase().includes(s) ||
      l.company?.toLowerCase().includes(s) ||
      l.email?.toLowerCase().includes(s) ||
      l.phone?.includes(s)
    );
  }
  
  // Sort
  const sortBy = params?.sortBy || 'createdAt';
  const sortDir = params?.sortDir || 'desc';
  results.sort((a, b) => {
    const aVal = (a as any)[sortBy];
    const bVal = (b as any)[sortBy];
    if (aVal === bVal) return 0;
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });
  
  const total = results.length;
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const start = (page - 1) * pageSize;
  const data = results.slice(start, start + pageSize);
  
  return { data, total };
}

export async function getLead(id: string): Promise<Lead | null> {
  await delay(50);
  return db.leads.find(l => l.id === id && l.orgId === getOrgId()) || null;
}

export async function createLead(input: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'orgId'> & { orgId?: string }): Promise<Lead> {
  await delay(100);
  const lead: Lead = {
    ...input,
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orgId: input.orgId || getOrgId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.leads.unshift(lead);
  revalidatePath('/leads');
  return lead;
}

export async function updateLead(id: string, input: Partial<Lead>): Promise<Lead | null> {
  await delay(100);
  const idx = db.leads.findIndex(l => l.id === id && l.orgId === getOrgId());
  if (idx === -1) return null;
  db.leads[idx] = { ...db.leads[idx], ...input, updatedAt: new Date() };
  revalidatePath('/leads');
  revalidatePath(`/leads/${id}`);
  return db.leads[idx];
}

export async function deleteLead(id: string): Promise<boolean> {
  await delay(100);
  const idx = db.leads.findIndex(l => l.id === id && l.orgId === getOrgId());
  if (idx === -1) return false;
  db.leads.splice(idx, 1);
  revalidatePath('/leads');
  return true;
}

// ============================================================
// DEALS
// ============================================================

export async function getDeals(params?: {
  page?: number;
  pageSize?: number;
  stage?: string;
  assignedTo?: string;
  search?: string;
}): Promise<{ data: Deal[]; total: number }> {
  await delay(100);
  
  const orgId = getOrgId();
  let results = db.deals.filter(d => d.orgId === orgId);
  
  if (params?.stage) results = results.filter(d => d.stage === params.stage);
  if (params?.assignedTo) results = results.filter(d => d.assignedTo === params.assignedTo);
  if (params?.search) {
    const s = params.search.toLowerCase();
    results = results.filter(d => 
      d.name.toLowerCase().includes(s) ||
      d.lostReason?.toLowerCase().includes(s)
    );
  }
  
  results.sort((a, b) => {
    const stageOrder = ['qualify', 'propose', 'negotiate', 'close_won', 'close_lost'];
    const aIdx = stageOrder.indexOf(a.stage);
    const bIdx = stageOrder.indexOf(b.stage);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const total = results.length;
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const start = (page - 1) * pageSize;
  const data = results.slice(start, start + pageSize);
  
  return { data, total };
}

export async function getDeal(id: string): Promise<Deal | null> {
  await delay(50);
  return db.deals.find(d => d.id === id && d.orgId === getOrgId()) || null;
}

export async function createDeal(input: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'orgId' | 'version'> & { orgId?: string }): Promise<Deal> {
  await delay(100);
  const deal: Deal = {
    ...input,
    id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orgId: input.orgId || getOrgId(),
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.deals.unshift(deal);
  revalidatePath('/deals');
  revalidatePath('/pipeline');
  return deal;
}

export async function updateDeal(id: string, input: Partial<Deal>): Promise<Deal | null> {
  await delay(100);
  const idx = db.deals.findIndex(d => d.id === id && d.orgId === getOrgId());
  if (idx === -1) return null;
  db.deals[idx] = { ...db.deals[idx], ...input, updatedAt: new Date(), version: db.deals[idx].version + 1 };
  revalidatePath('/deals');
  revalidatePath('/pipeline');
  revalidatePath(`/deals/${id}`);
  return db.deals[idx];
}

export async function advanceDealStage(id: string, stage: Deal['stage'], note?: string): Promise<Deal | null> {
  await delay(100);
  const idx = db.deals.findIndex(d => d.id === id && d.orgId === getOrgId());
  if (idx === -1) return null;
  
  const deal = db.deals[idx];
  const oldStage = deal.stage;
  
  db.deals[idx] = {
    ...deal,
    stage,
    probability: stage === 'close_won' ? 100 : stage === 'close_lost' ? 0 : deal.probability,
    actualCloseDate: ['close_won', 'close_lost'].includes(stage) ? new Date() : deal.actualCloseDate,
    updatedAt: new Date(),
    version: deal.version + 1,
  };
  
  // Log activity
  if (note) {
    db.activities = db.activities || [];
    db.activities.unshift({
      id: `act_${Date.now()}`,
      orgId: getOrgId(),
      type: 'note',
      subject: `Stage changed: ${oldStage} → ${stage}`,
      description: note,
      relatedType: 'deal',
      relatedId: id,
      assignedTo: deal.assignedTo,
      createdBy: deal.assignedTo,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  revalidatePath('/deals');
  revalidatePath('/pipeline');
  revalidatePath(`/deals/${id}`);
  return db.deals[idx];
}

// ============================================================
// ORDERS
// ============================================================

export async function getOrders(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  customerId?: string;
}): Promise<{ data: Order[]; total: number }> {
  await delay(100);
  
  const orgId = getOrgId();
  let results = db.orders.filter(o => o.orgId === orgId);
  
  if (params?.status) results = results.filter(o => o.status === params.status);
  if (params?.customerId) results = results.filter(o => o.customerId === params.customerId);
  
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const total = results.length;
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const start = (page - 1) * pageSize;
  const data = results.slice(start, start + pageSize);
  
  return { data, total };
}

export async function getOrder(id: string): Promise<Order | null> {
  await delay(50);
  return db.orders.find(o => o.id === id && o.orgId === getOrgId()) || null;
}

export async function createOrder(input: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orgId'> & { orgId?: string }): Promise<Order> {
  await delay(100);
  const order: Order = {
    ...input,
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orgId: input.orgId || getOrgId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.orders.unshift(order);
  revalidatePath('/orders');
  return order;
}

export async function updateOrder(id: string, input: Partial<Order>): Promise<Order | null> {
  await delay(100);
  const idx = db.orders.findIndex(o => o.id === id && o.orgId === getOrgId());
  if (idx === -1) return null;
  db.orders[idx] = { ...db.orders[idx], ...input, updatedAt: new Date() };
  revalidatePath('/orders');
  revalidatePath(`/orders/${id}`);
  return db.orders[idx];
}

// ============================================================
// CONTACTS
// ============================================================

export async function getContacts(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  search?: string;
}): Promise<{ data: Contact[]; total: number }> {
  await delay(100);
  
  const orgId = getOrgId();
  let results = db.contacts.filter(c => c.orgId === orgId);
  
  if (params?.type) results = results.filter(c => c.type === params.type);
  if (params?.search) {
    const s = params.search.toLowerCase();
    results = results.filter(c => 
      c.name.toLowerCase().includes(s) ||
      c.company?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.phone?.includes(s)
    );
  }
  
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const total = results.length;
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const start = (page - 1) * pageSize;
  const data = results.slice(start, start + pageSize);
  
  return { data, total };
}

// ============================================================
// USERS
// ============================================================

export async function getUsers(): Promise<User[]> {
  await delay(50);
  return db.users.filter(u => u.orgId === getOrgId());
}

export async function getCurrentUser(): Promise<User | null> {
  // In real app, get from session
  await delay(10);
  return db.users[0]; // Return admin as current user
}

// ============================================================
// ORGANIZATION
// ============================================================

export async function getOrganization(): Promise<Organization> {
  await delay(10);
  return db.organization;
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  await delay(100);
  const orgId = getOrgId();
  
  const leadsThisMonth = db.leads.filter(l => 
    l.orgId === orgId && 
    new Date(l.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ).length;
  
  const pipelineValue = db.deals
    .filter(d => d.orgId === orgId && !['close_won', 'close_lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.valueCents, 0);
  
  const wonDeals = db.deals.filter(d => d.orgId === orgId && d.stage === 'close_won');
  const totalDeals = db.deals.filter(d => d.orgId === orgId && ['close_won', 'close_lost'].includes(d.stage));
  const winRate = totalDeals.length > 0 ? (wonDeals.length / totalDeals.length) * 100 : 0;
  
  const aiQualified = db.leads.filter(l => l.orgId === orgId && l.aiQualifiedAt).length;
  
  return {
    leadsThisMonth,
    pipelineValue,
    winRate: Math.round(winRate * 10) / 10,
    aiQualified,
  };
}

export async function getPipelineSummary() {
  await delay(100);
  const orgId = getOrgId();
  const stages = ['qualify', 'propose', 'negotiate', 'close_won', 'close_lost'] as const;
  
  return stages.map(stage => {
    const deals = db.deals.filter(d => d.orgId === orgId && d.stage === stage);
    return {
      stage,
      count: deals.length,
      totalValueCents: deals.reduce((sum, d) => sum + d.valueCents, 0),
    };
  });
}

export async function getRecentActivities(limit = 10) {
  await delay(50);
  // Mock activities
  return [
    { id: '1', type: 'call', subject: 'Call with Rajesh Kumar', relatedType: 'lead', relatedId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', createdAt: new Date(Date.now() - 3600000), assignedTo: '44444444-4444-4444-4444-444444444444' },
    { id: '2', type: 'email', subject: 'Proposal sent to Nair Consulting', relatedType: 'deal', relatedId: '22222222-3333-4444-5555-666666666666', createdAt: new Date(Date.now() - 7200000), assignedTo: '44444444-4444-4444-4444-444444444444' },
    { id: '3', type: 'meeting', subject: 'Demo with GrowFast Logistics', relatedType: 'lead', relatedId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', createdAt: new Date(Date.now() - 10800000), assignedTo: '55555555-5555-5555-5555-555555555555' },
  ].slice(0, limit);
}

export async function getHotLeads(limit = 5) {
  await delay(50);
  return db.leads
    .filter(l => l.orgId === getOrgId() && l.score >= 70 && ['new', 'contacted', 'qualified'].includes(l.status))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}