/**
 * Demo Data - Complete & Realistic
 * 
 * Philosophy: Show users the full potential of the system
 * with realistic, complete examples that tell a story.
 * 
 * This is NOT placeholder data.
 * This is an onboarding experience that demonstrates:
 * - Multi-level approvals in action
 * - Rich audit trails
 * - Team collaboration
 * - Real-world business scenarios
 */

export const DEMO_SCENARIO = {
  name: "Acme Corporation Demo",
  description: "A realistic month in the life of a growing company",
};

/**
 * Demo Users - A Complete Team
 * Shows different roles working together
 */
export const DEMO_USERS = [
  {
    id: "demo_cfo",
    name: "Sarah Chen",
    title: "Chief Financial Officer",
    email: "sarah.chen@acme.com",
    role: "org_admin" as const,
    status: "active",
    avatarUrl: null,
    joinedAt: "2024-01-15T09:00:00Z",
    lastActive: "2024-12-02T16:30:00Z",
    bio: "Oversees all financial operations and approves high-value payments",
    permissions: [
      "manage_users",
      "approve_payments",
      "view_audit_log",
      "manage_organization",
    ],
  },
  {
    id: "demo_accountant",
    name: "Michael Rodriguez",
    title: "Senior Accountant",
    email: "michael.rodriguez@acme.com",
    role: "member" as const,
    status: "active",
    avatarUrl: null,
    joinedAt: "2024-01-20T10:00:00Z",
    lastActive: "2024-12-02T15:45:00Z",
    bio: "Creates payment requests and manages vendor relationships",
    permissions: ["create_payments", "view_own_payments"],
  },
  {
    id: "demo_manager",
    name: "Jennifer Lee",
    title: "Operations Manager",
    email: "jennifer.lee@acme.com",
    role: "member" as const,
    status: "active",
    avatarUrl: null,
    joinedAt: "2024-02-01T09:00:00Z",
    lastActive: "2024-12-02T14:20:00Z",
    bio: "First-level approver for operational expenses",
    permissions: ["approve_payments", "create_payments", "view_team_payments"],
  },
  {
    id: "demo_treasury",
    name: "David Kim",
    title: "Treasury Officer",
    email: "david.kim@acme.com",
    role: "member" as const,
    status: "active",
    avatarUrl: null,
    joinedAt: "2024-02-10T09:00:00Z",
    lastActive: "2024-12-02T13:15:00Z",
    bio: "Executes approved payments and uploads payment slips",
    permissions: ["disburse_payments", "upload_slips"],
  },
  {
    id: "demo_analyst",
    name: "Emily Tan",
    title: "Financial Analyst",
    email: "emily.tan@acme.com",
    role: "viewer" as const,
    status: "active",
    avatarUrl: null,
    joinedAt: "2024-03-01T09:00:00Z",
    lastActive: "2024-12-02T11:00:00Z",
    bio: "Monitors financial data and generates reports",
    permissions: ["view_all_payments", "view_audit_log"],
  },
  {
    id: "demo_intern",
    name: "Alex Wong",
    title: "Finance Intern",
    email: "alex.wong@acme.com",
    role: "viewer" as const,
    status: "invited",
    avatarUrl: null,
    joinedAt: "2024-11-28T00:00:00Z",
    lastActive: null,
    bio: "Recently invited to observe financial processes",
    permissions: ["view_own_payments"],
  },
];

/**
 * Demo Payment Requests - A Complete Workflow
 * Shows the full lifecycle: Draft → Review → Approved → Disbursed → Completed
 */
export const DEMO_PAYMENTS = [
  {
    id: "PR-2024-042",
    traceId: "tr_vendor_payment_nov_2024",
    title: "November Software Licenses",
    description:
      "Annual renewal for Microsoft 365, Slack Premium, and GitHub Enterprise licenses for 50 users",
    category: "OPERATING_EXPENSE",
    amount: 24500.0,
    currency: "MYR",
    status: "COMPLETED",
    createdBy: DEMO_USERS[1], // Michael (Accountant)
    createdAt: "2024-11-15T09:30:00Z",
    approvalChain: [
      {
        approver: DEMO_USERS[2], // Jennifer (Manager)
        approvedAt: "2024-11-15T14:20:00Z",
        comment: "Approved - essential for team productivity",
      },
      {
        approver: DEMO_USERS[0], // Sarah (CFO)
        approvedAt: "2024-11-16T10:15:00Z",
        comment: "Approved - within budget",
      },
    ],
    disbursedBy: DEMO_USERS[3], // David (Treasury)
    disbursedAt: "2024-11-18T11:00:00Z",
    paymentMethod: "Bank Transfer",
    referenceNumber: "TXN-20241118-001",
    slipUploadedAt: "2024-11-18T15:30:00Z",
    completedAt: "2024-11-18T15:30:00Z",
    attachments: [
      { name: "Invoice-Microsoft.pdf", size: "245 KB", uploadedAt: "2024-11-15T09:30:00Z" },
      { name: "Invoice-Slack.pdf", size: "156 KB", uploadedAt: "2024-11-15T09:31:00Z" },
      { name: "Payment-Slip.pdf", size: "89 KB", uploadedAt: "2024-11-18T15:30:00Z" },
    ],
  },
  {
    id: "PR-2024-043",
    traceId: "tr_office_renovation_dec_2024",
    title: "Office Renovation - Phase 2",
    description:
      "Complete renovation of 3rd floor office space including new furniture, lighting, and AV equipment",
    category: "CAPITAL_EXPENDITURE",
    amount: 125000.0,
    currency: "MYR",
    status: "DISBURSED_AWAITING_SLIP",
    createdBy: DEMO_USERS[2], // Jennifer (Manager)
    createdAt: "2024-11-20T10:00:00Z",
    approvalChain: [
      {
        approver: DEMO_USERS[0], // Sarah (CFO)
        approvedAt: "2024-11-22T11:30:00Z",
        comment: "Approved - critical for expansion plans",
      },
    ],
    disbursedBy: DEMO_USERS[3], // David (Treasury)
    disbursedAt: "2024-12-01T14:00:00Z",
    paymentMethod: "Bank Transfer",
    referenceNumber: "TXN-20241201-002",
    slipUploadedAt: null,
    completedAt: null,
    attachments: [
      { name: "Quotation-Contractor.pdf", size: "1.2 MB", uploadedAt: "2024-11-20T10:00:00Z" },
      { name: "Floor-Plan.pdf", size: "890 KB", uploadedAt: "2024-11-20T10:01:00Z" },
    ],
  },
  {
    id: "PR-2024-044",
    traceId: "tr_marketing_campaign_q1_2025",
    title: "Q1 2025 Marketing Campaign",
    description:
      "Digital marketing campaign including Google Ads, Facebook/Instagram ads, and influencer partnerships for new product launch",
    category: "MARKETING_EXPENSE",
    amount: 45000.0,
    currency: "MYR",
    status: "APPROVED_AWAITING_DISBURSE",
    createdBy: DEMO_USERS[1], // Michael (Accountant)
    createdAt: "2024-11-25T14:00:00Z",
    approvalChain: [
      {
        approver: DEMO_USERS[2], // Jennifer (Manager)
        approvedAt: "2024-11-26T09:15:00Z",
        comment: "Approved - aligns with Q1 strategy",
      },
      {
        approver: DEMO_USERS[0], // Sarah (CFO)
        approvedAt: "2024-11-27T10:00:00Z",
        comment: "Approved - good ROI projection",
      },
    ],
    disbursedBy: null,
    disbursedAt: null,
    paymentMethod: null,
    referenceNumber: null,
    slipUploadedAt: null,
    completedAt: null,
    attachments: [
      { name: "Campaign-Proposal.pdf", size: "2.1 MB", uploadedAt: "2024-11-25T14:00:00Z" },
      { name: "Budget-Breakdown.xlsx", size: "156 KB", uploadedAt: "2024-11-25T14:01:00Z" },
    ],
  },
  {
    id: "PR-2024-045",
    traceId: "tr_vendor_payment_overdue",
    title: "Cloud Infrastructure - November",
    description: "AWS cloud services for production and staging environments",
    category: "OPERATING_EXPENSE",
    amount: 8750.0,
    currency: "MYR",
    status: "UNDER_REVIEW",
    createdBy: DEMO_USERS[1], // Michael (Accountant)
    createdAt: "2024-12-01T11:00:00Z",
    approvalChain: [],
    disbursedBy: null,
    disbursedAt: null,
    paymentMethod: null,
    referenceNumber: null,
    slipUploadedAt: null,
    completedAt: null,
    attachments: [
      { name: "AWS-Invoice-Nov.pdf", size: "178 KB", uploadedAt: "2024-12-01T11:00:00Z" },
    ],
  },
  {
    id: "PR-2024-046",
    traceId: "tr_training_budget_rejected",
    title: "Team Training Budget - Exceeded",
    description: "Additional training courses requested beyond approved budget",
    category: "TRAINING_DEVELOPMENT",
    amount: 15000.0,
    currency: "MYR",
    status: "REJECTED",
    createdBy: DEMO_USERS[2], // Jennifer (Manager)
    createdAt: "2024-11-28T15:00:00Z",
    approvalChain: [
      {
        approver: DEMO_USERS[0], // Sarah (CFO)
        approvedAt: "2024-11-29T10:00:00Z",
        comment: "Rejected - exceeded Q4 training budget. Please resubmit in Q1 2025 budget cycle.",
      },
    ],
    disbursedBy: null,
    disbursedAt: null,
    paymentMethod: null,
    referenceNumber: null,
    slipUploadedAt: null,
    completedAt: null,
    attachments: [
      { name: "Training-Proposal.pdf", size: "445 KB", uploadedAt: "2024-11-28T15:00:00Z" },
    ],
  },
  {
    id: "DRAFT-001",
    traceId: "tr_draft_office_supplies",
    title: "Office Supplies Restock",
    description: "Monthly restock of office supplies and pantry items",
    category: "OPERATING_EXPENSE",
    amount: 3200.0,
    currency: "MYR",
    status: "DRAFT",
    createdBy: DEMO_USERS[1], // Michael (Accountant)
    createdAt: "2024-12-02T09:00:00Z",
    approvalChain: [],
    disbursedBy: null,
    disbursedAt: null,
    paymentMethod: null,
    referenceNumber: null,
    slipUploadedAt: null,
    completedAt: null,
    attachments: [],
  },
];

/**
 * Demo Audit Trail - Rich History
 * Shows complete traceability
 */
export const DEMO_AUDIT_EVENTS = [
  {
    id: "evt_001",
    traceId: "tr_vendor_payment_nov_2024",
    action: "payment.slip_uploaded",
    actorName: "David Kim",
    actorEmail: "david.kim@acme.com",
    targetType: "payment",
    targetId: "PR-2024-042",
    description: 'Uploaded payment slip "Payment-Slip.pdf" for PR-2024-042',
    timestamp: "2024-11-18T15:30:00Z",
    metadata: { fileName: "Payment-Slip.pdf", fileSize: "89 KB" },
  },
  {
    id: "evt_002",
    traceId: "tr_vendor_payment_nov_2024",
    action: "payment.disbursed",
    actorName: "David Kim",
    actorEmail: "david.kim@acme.com",
    targetType: "payment",
    targetId: "PR-2024-042",
    description: "Disbursed payment PR-2024-042 via Bank Transfer (TXN-20241118-001)",
    timestamp: "2024-11-18T11:00:00Z",
    metadata: {
      amount: 24500,
      currency: "MYR",
      method: "Bank Transfer",
      reference: "TXN-20241118-001",
    },
  },
  {
    id: "evt_003",
    traceId: "tr_vendor_payment_nov_2024",
    action: "payment.approved",
    actorName: "Sarah Chen",
    actorEmail: "sarah.chen@acme.com",
    targetType: "payment",
    targetId: "PR-2024-042",
    description: "Approved payment PR-2024-042 (CFO approval)",
    timestamp: "2024-11-16T10:15:00Z",
    metadata: { approvalLevel: 2, comment: "Approved - within budget" },
  },
  {
    id: "evt_004",
    traceId: "tr_vendor_payment_nov_2024",
    action: "payment.approved",
    actorName: "Jennifer Lee",
    actorEmail: "jennifer.lee@acme.com",
    targetType: "payment",
    targetId: "PR-2024-042",
    description: "Approved payment PR-2024-042 (Manager approval)",
    timestamp: "2024-11-15T14:20:00Z",
    metadata: { approvalLevel: 1, comment: "Approved - essential for team productivity" },
  },
  {
    id: "evt_005",
    traceId: "tr_vendor_payment_nov_2024",
    action: "payment.created",
    actorName: "Michael Rodriguez",
    actorEmail: "michael.rodriguez@acme.com",
    targetType: "payment",
    targetId: "PR-2024-042",
    description: "Created payment request PR-2024-042",
    timestamp: "2024-11-15T09:30:00Z",
    metadata: { amount: 24500, currency: "MYR", category: "OPERATING_EXPENSE" },
  },
  {
    id: "evt_006",
    traceId: "tr_user_invite_alex",
    action: "user.invited",
    actorName: "Sarah Chen",
    actorEmail: "sarah.chen@acme.com",
    targetType: "user",
    targetId: "alex.wong@acme.com",
    description: "Invited user alex.wong@acme.com with role Viewer",
    timestamp: "2024-11-28T14:15:00Z",
    metadata: { role: "viewer", email: "alex.wong@acme.com" },
  },
  {
    id: "evt_007",
    traceId: "tr_training_budget_rejected",
    action: "payment.rejected",
    actorName: "Sarah Chen",
    actorEmail: "sarah.chen@acme.com",
    targetType: "payment",
    targetId: "PR-2024-046",
    description: "Rejected payment PR-2024-046",
    timestamp: "2024-11-29T10:00:00Z",
    metadata: {
      reason: "Exceeded Q4 training budget. Please resubmit in Q1 2025 budget cycle.",
    },
  },
];

/**
 * Demo Organization
 */
export const DEMO_ORGANIZATION = {
  id: "org_acme",
  name: "Acme Corporation",
  slug: "acme-corp",
  contactEmail: "hello@acme.com",
  website: "https://acme.com",
  address: "123 Innovation Drive, Tech Park, Kuala Lumpur 50450, Malaysia",
  logoUrl: null,
  industry: "Technology",
  size: "50-100 employees",
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-11-30T16:45:00Z",
  updatedBy: {
    name: "Sarah Chen",
    email: "sarah.chen@acme.com",
  },
};

/**
 * Helper to check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("demo_mode") === "enabled";
}

/**
 * Enable demo mode
 */
export function enableDemoMode() {
  if (typeof window === "undefined") return;
  localStorage.setItem("demo_mode", "enabled");
}

/**
 * Disable demo mode
 */
export function disableDemoMode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("demo_mode");
}

