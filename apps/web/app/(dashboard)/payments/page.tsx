"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button, Input, Card, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@aibos/ui";
import { EmptyState } from "@/components/EmptyStates";
import { DEMO_PAYMENTS, isDemoMode } from "@/lib/demo-data";

/**
 * Payments Hub
 * 
 * From GRCD-PAYMENT-CYCLE-FRONTEND.md:
 * - Lane-based navigation (My Requests / Need Approval / Disburse)
 * - Payment table with status pills
 * - Search and filters
 */

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const payments = isDemoMode() ? DEMO_PAYMENTS : [];
  const hasPayments = payments.length > 0;

  // Show empty state if no payments
  if (!hasPayments) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Payments</h1>
            <p className="text-text-muted">Manage payment requests from creation to completion.</p>
          </div>
        </div>
        <EmptyState variant="payments" onAction={() => {}} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Payments</h1>
          <p className="text-text-muted">Manage payment requests from creation to completion.</p>
        </div>
        <Link href="/payments/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Payment Request
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Lanes */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All <Badge variant="default" className="ml-2">{payments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="my-requests">
            My Requests
          </TabsTrigger>
          <TabsTrigger value="need-approval">
            Need Approval
          </TabsTrigger>
          <TabsTrigger value="disburse">
            To Disburse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PaymentTable payments={payments} />
        </TabsContent>
        <TabsContent value="my-requests">
          <div className="py-12 text-center text-text-muted">Feature coming soon</div>
        </TabsContent>
        <TabsContent value="need-approval">
          <div className="py-12 text-center text-text-muted">Feature coming soon</div>
        </TabsContent>
        <TabsContent value="disburse">
          <div className="py-12 text-center text-text-muted">Feature coming soon</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentTable({ payments }: { payments: typeof DEMO_PAYMENTS }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-sm text-text-muted">
              <th className="p-4 font-medium">Request ID</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-background-subtle transition-colors">
                <td className="p-4">
                  <Link href={`/payments/${payment.id}`} className="font-mono text-sm text-primary-600 hover:text-primary-700">
                    {payment.id}
                  </Link>
                </td>
                <td className="p-4">
                  <div className="font-medium text-text">{payment.title}</div>
                  <div className="text-sm text-text-muted">{payment.category}</div>
                </td>
                <td className="p-4 font-medium">
                  {payment.currency} {payment.amount.toLocaleString()}
                </td>
                <td className="p-4">
                  <Badge variant={payment.status.toLowerCase().includes("completed") ? "completed" : payment.status.toLowerCase().includes("reject") ? "rejected" : "review"}>
                    {payment.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-text-muted">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

