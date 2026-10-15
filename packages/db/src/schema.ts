import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================
// ENUMS
// ============================================================
export const leadSourceEnum = pgEnum('lead_source', [
  'manual', 'meta', 'google', 'website', 'whatsapp', 'indiamart', 
  'tradeindia', 'justdial', 'exportersindia', 'sulekha', '99acres', 
  'magicbricks', 'housing', 'pharmahopers', 'bulk_import', 'referral', 'other'
]);

export const leadStatusEnum = pgEnum('lead_status', [
  'new', 'contacted', 'qualified', 'unqualified', 'lost'
]);

export const dealStageEnum = pgEnum('deal_stage', [
  'qualify', 'propose', 'negotiate', 'close_won', 'close_lost'
]);

export const orderStatusEnum = pgEnum('order_status', [
  'draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
]);

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open', 'in_progress', 'on_hold', 'resolved', 'closed'
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'low', 'medium', 'high', 'critical'
]);

export const amcStatusEnum = pgEnum('amc_status', [
  'active', 'expired', 'renewed'
]);

export const poStatusEnum = pgEnum('po_status', [
  'draft', 'sent', 'acknowledged', 'partial', 'received', 'cancelled'
]);

export const aionAgentTypeEnum = pgEnum('aion_agent_type', [
  'calling', 'chat', 'qualifier', 'followup', 'bulk'
]);

export const aionAgentStatusEnum = pgEnum('aion_agent_status', [
  'active', 'paused', 'draft'
]);

export const aionConversationStatusEnum = pgEnum('aion_conversation_status', [
  'active', 'completed', 'handoff', 'failed'
]);

export const aionDispositionEnum = pgEnum('aion_disposition', [
  'hot', 'warm', 'cold'
]);

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft', 'running', 'paused', 'completed'
]);

export const campaignContactStatusEnum = pgEnum('campaign_contact_status', [
  'pending', 'dialing', 'answered', 'qualified', 'callback', 'voicemail', 'failed'
]);

export const integrationTypeEnum = pgEnum('integration_type', [
  'indiamart', 'tradeindia', 'justdial', 'shopify', 'woocommerce', 
  'wordpress', 'whatsapp', 'sms', 'email', 'calendar', 'accounting'
]);

export const integrationStatusEnum = pgEnum('integration_status', [
  'connected', 'disconnected', 'error'
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing', 'active', 'past_due', 'canceled', 'incomplete'
]);

export const userRoleEnum = pgEnum('user_role', [
  'admin', 'manager', 'rep'
]);

export const activityTypeEnum = pgEnum('activity_type', [
  'call', 'meeting', 'email', 'whatsapp', 'note', 'task', 'field_visit'
]);

export const communicationChannelEnum = pgEnum('communication_channel', [
  'call', 'whatsapp', 'email', 'sms'
]);

export const communicationDirectionEnum = pgEnum('communication_direction', [
  'inbound', 'outbound'
]);

export const communicationParticipantTypeEnum = pgEnum('communication_participant_type', [
  'lead', 'contact', 'user'
]);

export const communicationStatusEnum = pgEnum('communication_status', [
  'queued', 'sent', 'delivered', 'read', 'failed', 'bounced'
]);

// ============================================================
// CORE TABLES
// ============================================================

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  industry: text('industry'),
  size: text('size'),
  address: jsonb('address').default({}),
  gstNumber: text('gst_number'),
  currency: text('currency').notNull().default('INR'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  branding: jsonb('branding').default({ logoUrl: null, primaryColor: '#2563eb' }),
  subscriptionTier: text('subscription_tier').notNull().default('growth'),
  subscriptionStatus: text('subscription_status').notNull().default('trialing'),
  aiBudgetCents: integer('ai_budget_cents').notNull().default(500000),
  aiSpentCents: integer('ai_spent_cents').notNull().default(0),
  aiBudgetResetAt: timestamp('ai_budget_reset_at', { withTimezone: true }).notNull().defaultNow(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('rep'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  notificationPrefs: jsonb('notification_prefs').default({ email: true, push: true, sms: false, whatsapp: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  mobileAppToken: text('mobile_app_token'),
  mobileTokenExpiresAt: timestamp('mobile_token_expires_at', { withTimezone: true }),
  supabaseUserId: uuid('supabase_user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgEmailUnique: uniqueIndex('users_org_email_unique').on(table.orgId, table.email),
  orgIdIdx: index('users_org_id_idx').on(table.orgId),
  supabaseUserIdIdx: index('users_supabase_user_id_idx').on(table.supabaseUserId),
}));

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripePriceId: text('stripe_price_id'),
  status: subscriptionStatusEnum('status').notNull().default('trialing'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  trialStart: timestamp('trial_start', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdIdx: index('subscriptions_org_id_idx').on(table.orgId),
  stripeCustomerIdIdx: index('subscriptions_stripe_customer_id_idx').on(table.stripeCustomerId),
}));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(),
  changes: jsonb('changes'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgEntityIdx: index('audit_logs_org_entity_idx').on(table.orgId, table.entityType, table.entityId),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt.desc()),
}));

// ============================================================
// SALES TABLES
// ============================================================

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  source: leadSourceEnum('source').notNull().default('manual'),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  company: text('company'),
  designation: text('designation'),
  territory: text('territory'),
  score: integer('score').notNull().default(0),
  status: leadStatusEnum('status').notNull().default('new'),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  aiQualifiedAt: timestamp('ai_qualified_at', { withTimezone: true }),
  aiSummary: text('ai_summary'),
  aiObjections: jsonb('ai_objections').default([]),
  aiNextAction: text('ai_next_action'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgStatusIdx: index('leads_org_status_idx').on(table.orgId, table.status),
  orgAssignedIdx: index('leads_org_assigned_idx').on(table.orgId, table.assignedTo),
  orgSourceIdx: index('leads_org_source_idx').on(table.orgId, table.source),
  orgScoreCreatedIdx: index('leads_org_score_created_idx').on(table.orgId, table.score.desc(), table.createdAt.desc()),
  orgPhoneIdx: index('leads_org_phone_idx').on(table.orgId, table.phone),
  orgEmailIdx: index('leads_org_email_idx').on(table.orgId, table.email),
}));

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  valueCents: integer('value_cents').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  stage: dealStageEnum('stage').notNull().default('qualify'),
  probability: integer('probability').notNull().default(10),
  expectedCloseDate: date('expected_close_date'),
  actualCloseDate: date('actual_close_date'),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  lostReason: text('lost_reason'),
  competitor: text('competitor'),
  products: jsonb('products').default([]),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgStageIdx: index('deals_org_stage_idx').on(table.orgId, table.stage),
  orgAssignedIdx: index('deals_org_assigned_idx').on(table.orgId, table.assignedTo),
  orgExpectedCloseIdx: index('deals_org_expected_close_idx').on(table.orgId, table.expectedCloseDate),
  leadIdIdx: index('deals_lead_id_idx').on(table.leadId),
}));

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  whatsappNumber: text('whatsapp_number'),
  company: text('company'),
  designation: text('designation'),
  address: jsonb('address').default({}),
  type: text('type').notNull().default('prospect'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgTypeIdx: index('contacts_org_type_idx').on(table.orgId, table.type),
  orgLeadIdx: index('contacts_org_lead_idx').on(table.orgId, table.leadId),
  orgEmailIdx: index('contacts_org_email_idx').on(table.orgId, table.email),
  orgPhoneIdx: index('contacts_org_phone_idx').on(table.orgId, table.phone),
  orgWhatsappIdx: index('contacts_org_whatsapp_idx').on(table.orgId, table.whatsappNumber),
}));

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  type: activityTypeEnum('type').notNull(),
  subject: text('subject').notNull(),
  description: text('description'),
  outcome: text('outcome'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  relatedType: text('related_type').notNull(),
  relatedId: uuid('related_id').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgRelatedIdx: index('activities_org_related_idx').on(table.orgId, table.relatedType, table.relatedId),
  orgAssignedDueIdx: index('activities_org_assigned_due_idx').on(table.orgId, table.assignedTo, table.dueAt),
  orgCompletedIdx: index('activities_org_completed_idx').on(table.orgId, table.completedAt.desc()),
}));

export const communications = pgTable('communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  channel: communicationChannelEnum('channel').notNull(),
  direction: communicationDirectionEnum('direction').notNull(),
  participantType: communicationParticipantTypeEnum('participant_type').notNull(),
  participantId: uuid('participant_id').notNull(),
  content: text('content'),
  transcript: text('transcript'),
  recordingUrl: text('recording_url'),
  aiSummary: text('ai_summary'),
  aiScore: integer('ai_score'),
  durationSeconds: integer('duration_seconds'),
  status: communicationStatusEnum('status').notNull().default('sent'),
  externalId: text('external_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgChannelIdx: index('communications_org_channel_idx').on(table.orgId, table.channel),
  orgParticipantIdx: index('communications_org_participant_idx').on(table.orgId, table.participantType, table.participantId),
  orgCreatedIdx: index('communications_org_created_idx').on(table.orgId, table.createdAt.desc()),
  externalIdIdx: index('communications_external_id_idx').on(table.externalId),
}));

// ============================================================
// OPERATIONS TABLES
// ============================================================

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  category: text('category'),
  unit: text('unit').notNull().default('pcs'),
  gstRate: numeric('gst_rate', { precision: 5, scale: 2 }).notNull().default('18.00'),
  hsnCode: text('hsn_code'),
  purchasePriceCents: integer('purchase_price_cents').notNull().default(0),
  salePriceCents: integer('sale_price_cents').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  bom: jsonb('bom').default([]),
  stockTracking: boolean('stock_tracking').notNull().default(true),
  expiryTracking: boolean('expiry_tracking').notNull().default(false),
  defaultWarehouseId: uuid('default_warehouse_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgSkuUnique: uniqueIndex('products_org_sku_unique').on(table.orgId, table.sku),
  orgCategoryIdx: index('products_org_category_idx').on(table.orgId, table.category),
  orgWarehouseIdx: index('products_org_warehouse_idx').on(table.orgId, table.defaultWarehouseId),
}));

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: jsonb('address').notNull().default({}),
  isDefault: boolean('is_default').notNull().default(false),
  managerId: uuid('manager_id').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgDefaultIdx: index('warehouses_org_default_idx').on(table.orgId, table.isDefault),
}));

export const stockLevels = pgTable('stock_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
  reservedQty: integer('reserved_qty').notNull().default(0),
  reorderLevel: integer('reorder_level').notNull().default(0),
  maxLevel: integer('max_level'),
  lastCountedAt: timestamp('last_counted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgProductWarehouseUnique: uniqueIndex('stock_levels_org_product_warehouse_unique').on(table.orgId, table.productId, table.warehouseId),
  orgProductIdx: index('stock_levels_org_product_idx').on(table.orgId, table.productId),
  orgWarehouseIdx: index('stock_levels_org_warehouse_idx').on(table.orgId, table.warehouseId),
  reorderIdx: index('stock_levels_reorder_idx').on(table.orgId, table.productId),
}));

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').notNull().references(() => contacts.id, { onDelete: 'restrict' }),
  orderNumber: text('order_number').notNull(),
  status: orderStatusEnum('status').notNull().default('draft'),
  items: jsonb('items').notNull().default([]),
  logisticsPartner: text('logistics_partner'),
  trackingNumber: text('tracking_number'),
  shippingAddress: jsonb('shipping_address').notNull().default({}),
  billingAddress: jsonb('billing_address').notNull().default({}),
  subtotalCents: integer('subtotal_cents').notNull().default(0),
  taxCents: integer('tax_cents').notNull().default(0),
  discountCents: integer('discount_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  expectedDate: date('expected_date'),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgOrderNumberUnique: uniqueIndex('orders_org_order_number_unique').on(table.orgId, table.orderNumber),
  orgStatusIdx: index('orders_org_status_idx').on(table.orgId, table.status),
  orgCustomerIdx: index('orders_org_customer_idx').on(table.orgId, table.customerId),
  orgDealIdx: index('orders_org_deal_idx').on(table.orgId, table.dealId),
  orgCreatedIdx: index('orders_org_created_idx').on(table.orgId, table.createdAt.desc()),
}));

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  sku: text('sku'),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('18.00'),
  discountPct: numeric('discount_pct', { precision: 5, scale: 2 }).notNull().default('0'),
  totalCents: integer('total_cents').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
  productIdIdx: index('order_items_product_id_idx').on(table.productId),
}));

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => contacts.id, { onDelete: 'restrict' }),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  description: text('description'),
  category: text('category'),
  priority: ticketPriorityEnum('priority').notNull().default('medium'),
  status: ticketStatusEnum('status').notNull().default('open'),
  slaDueAt: timestamp('sla_due_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  amcId: uuid('amc_id').references(() => amcs.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgStatusIdx: index('tickets_org_status_idx').on(table.orgId, table.status),
  orgPrioritySlaIdx: index('tickets_org_priority_sla_idx').on(table.orgId, table.priority, table.slaDueAt),
  orgAssignedIdx: index('tickets_org_assigned_idx').on(table.orgId, table.assignedTo),
  orgCustomerIdx: index('tickets_org_customer_idx').on(table.orgId, table.customerId),
}));

export const amcs = pgTable('amcs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => contacts.id, { onDelete: 'restrict' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  valueCents: integer('value_cents').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  renewalTerms: text('renewal_terms'),
  status: amcStatusEnum('status').notNull().default('active'),
  autoRenew: boolean('auto_renew').notNull().default(false),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgStatusEndIdx: index('amcs_org_status_end_idx').on(table.orgId, table.status, table.endDate),
  orgCustomerIdx: index('amcs_org_customer_idx').on(table.orgId, table.customerId),
}));

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'restrict' }),
  poNumber: text('po_number').notNull(),
  status: poStatusEnum('status').notNull().default('draft'),
  items: jsonb('items').notNull().default([]),
  expectedDate: date('expected_date'),
  receivedDate: date('received_date'),
  subtotalCents: integer('subtotal_cents').notNull().default(0),
  taxCents: integer('tax_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgPoNumberUnique: uniqueIndex('purchase_orders_org_po_number_unique').on(table.orgId, table.poNumber),
  orgStatusIdx: index('purchase_orders_org_status_idx').on(table.orgId, table.status),
  orgVendorIdx: index('purchase_orders_org_vendor_idx').on(table.orgId, table.vendorId),
  orgExpectedIdx: index('purchase_orders_org_expected_idx').on(table.orgId, table.expectedDate),
}));

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: jsonb('address').default({}),
  gstNumber: text('gst_number'),
  paymentTerms: text('payment_terms'),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  categories: text('categories').array(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgEmailUnique: uniqueIndex('vendors_org_email_unique').on(table.orgId, table.email),
  orgCategoriesIdx: index('vendors_org_categories_idx').on(table.orgId, table.categories),
}));

// ============================================================
// AION TABLES
// ============================================================

export const aionAgents = pgTable('aion_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: aionAgentTypeEnum('type').notNull(),
  status: aionAgentStatusEnum('status').notNull().default('draft'),
  config: jsonb('config').notNull().default({}),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgTypeStatusIdx: index('aion_agents_org_type_status_idx').on(table.orgId, table.type, table.status),
}));

export const aionConversations = pgTable('aion_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => aionAgents.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  channel: text('channel').notNull(),
  status: aionConversationStatusEnum('status').notNull().default('active'),
  transcript: jsonb('transcript').default([]),
  aiSummary: text('ai_summary'),
  aiScore: integer('ai_score'),
  disposition: aionDispositionEnum('disposition'),
  handoffTo: uuid('handoff_to').references(() => users.id, { onDelete: 'set null' }),
  handoffReason: text('handoff_reason'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  activePerLeadChannelUnique: uniqueIndex('aion_convs_active_per_lead_channel_unique')
    .on(table.leadId, table.channel)
    .where(sql`${table.status} = 'active' AND ${table.leadId} IS NOT NULL`),
  orgAgentIdx: index('aion_convs_org_agent_idx').on(table.orgId, table.agentId),
  orgLeadIdx: index('aion_convs_org_lead_idx').on(table.orgId, table.leadId),
  orgStatusStartedIdx: index('aion_convs_org_status_started_idx').on(table.orgId, table.status, table.startedAt.desc()),
}));

export const aionCampaigns = pgTable('aion_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => aionAgents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  listSource: text('list_source').notNull(),
  totalContacts: integer('total_contacts').notNull().default(0),
  dialed: integer('dialed').notNull().default(0),
  answered: integer('answered').notNull().default(0),
  qualified: integer('qualified').notNull().default(0),
  hotLeads: integer('hot_leads').notNull().default(0),
  callbacks: integer('callbacks').notNull().default(0),
  voicemails: integer('voicemails').notNull().default(0),
  status: campaignStatusEnum('status').notNull().default('draft'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgAgentIdx: index('aion_campaigns_org_agent_idx').on(table.orgId, table.agentId),
  orgStatusIdx: index('aion_campaigns_org_status_idx').on(table.orgId, table.status),
}));

export const campaignContacts = pgTable('campaign_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => aionCampaigns.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  status: campaignContactStatusEnum('status').notNull().default('pending'),
  callSid: text('call_sid'),
  recordingUrl: text('recording_url'),
  aiSummary: text('ai_summary'),
  disposition: aionDispositionEnum('disposition'),
  dialedAt: timestamp('dialed_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  campaignContactUnique: uniqueIndex('campaign_contacts_campaign_contact_unique').on(table.campaignId, table.contactId),
  campaignStatusIdx: index('campaign_contacts_campaign_status_idx').on(table.campaignId, table.status),
  contactIdx: index('campaign_contacts_contact_idx').on(table.contactId),
}));

// ============================================================
// INTEGRATIONS & SETTINGS
// ============================================================

export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  type: integrationTypeEnum('type').notNull(),
  name: text('name').notNull(),
  config: jsonb('config').notNull().default({}),
  status: integrationStatusEnum('status').notNull().default('disconnected'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  lastError: text('last_error'),
  syncCursor: jsonb('sync_cursor').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgTypeNameUnique: uniqueIndex('integrations_org_type_name_unique').on(table.orgId, table.type, table.name),
  orgTypeIdx: index('integrations_org_type_idx').on(table.orgId, table.type),
  orgStatusIdx: index('integrations_org_status_idx').on(table.orgId, table.status),
}));

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  config: jsonb('config').notNull().default({}),
  schedule: text('schedule'),
  recipients: uuid('recipients').array(),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  lastRunStatus: text('last_run_status'),
  lastRunError: text('last_run_error'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgTypeIdx: index('reports_org_type_idx').on(table.orgId, table.type),
  scheduleIdx: index('reports_schedule_idx').on(table.schedule),
}));

export const fieldVisits = pgTable('field_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  checkInAt: timestamp('check_in_at', { withTimezone: true }).notNull(),
  checkInLat: numeric('check_in_lat', { precision: 10, scale: 7 }).notNull(),
  checkInLng: numeric('check_in_lng', { precision: 10, scale: 7 }).notNull(),
  checkOutAt: timestamp('check_out_at', { withTimezone: true }),
  checkOutLat: numeric('check_out_lat', { precision: 10, scale: 7 }),
  checkOutLng: numeric('check_out_lng', { precision: 10, scale: 7 }),
  photos: jsonb('photos').default([]),
  notes: text('notes'),
  outcome: text('outcome'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgUserDateIdx: index('field_visits_org_user_date_idx').on(table.orgId, table.userId, table.checkInAt.desc()),
  orgLeadIdx: index('field_visits_org_lead_idx').on(table.orgId, table.leadId),
}));

export const processedWebhookEvents = pgTable('processed_webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: text('provider').notNull(),
  eventId: text('event_id').notNull(),
  eventType: text('event_type').notNull(),
  payloadHash: text('payload_hash').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  providerEventUnique: uniqueIndex('processed_webhook_events_provider_event_unique').on(table.provider, table.eventId),
  providerTypeIdx: index('processed_webhook_events_provider_type_idx').on(table.provider, table.eventType),
}));

// ============================================================
// VIEWS (created via migrations)
// ============================================================

// ============================================================
// EXPORTS
// ============================================================
export const schema = {
  organizations,
  users,
  subscriptions,
  auditLogs,
  leads,
  deals,
  contacts,
  activities,
  communications,
  products,
  warehouses,
  stockLevels,
  orders,
  orderItems,
  tickets,
  amcs,
  purchaseOrders,
  vendors,
  aionAgents,
  aionConversations,
  aionCampaigns,
  campaignContacts,
  integrations,
  reports,
  fieldVisits,
  processedWebhookEvents,
};

export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Communication = typeof communications.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type StockLevel = typeof stockLevels.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type Amc = typeof amcs.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type AionAgent = typeof aionAgents.$inferSelect;
export type AionConversation = typeof aionConversations.$inferSelect;
export type AionCampaign = typeof aionCampaigns.$inferSelect;
export type CampaignContact = typeof campaignContacts.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type FieldVisit = typeof fieldVisits.$inferSelect;
export type ProcessedWebhookEvent = typeof processedWebhookEvents.$inferSelect;