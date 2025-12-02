/**
 * Metadata Analytics Dashboard - Phase 4
 *
 * High-level overview of metadata governance health,
 * predictive insights, and recent activity.
 *
 * Philosophy: "Know the health of your metadata at a glance."
 */

"use client";

import { WorkbenchLayout } from "@/components/workbench/WorkbenchLayout";
import { ActionHeader } from "@/components/workbench/ActionHeader";
import { MetadataHealthDashboard } from "@/components/analytics/MetadataHealthDashboard";
import { PredictiveInsightsCard } from "@/components/analytics/PredictiveInsightsCard";
import { ActivityFeed } from "@/components/collaboration/ActivityFeed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react";
import {
  SAMPLE_HEALTH_DATA,
  SAMPLE_PREDICTIVE_INSIGHTS,
  SAMPLE_ACTIVITIES,
} from "@/lib/sample-analytics";
import { useState } from "react";

export default function MetadataAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  const handleTakeAction = (insightId: string) => {
    console.log("Take action on insight:", insightId);
    alert(`Taking action on insight: ${insightId}`);
  };

  const handleViewInsightDetails = (insightId: string) => {
    console.log("View insight details:", insightId);
  };

  return (
    <WorkbenchLayout
      header={
        <ActionHeader
          title={
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              <span>Metadata Analytics</span>
              <Badge variant="outline" className="font-normal">
                Health: {SAMPLE_HEALTH_DATA.overallHealth}%
              </Badge>
            </div>
          }
          filters={
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          }
          actions={
            <>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Report
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          }
        />
      }
      sidebar={
        <div className="space-y-4 p-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-base">
              Recent Activity
            </h3>
            <ActivityFeed activities={SAMPLE_ACTIVITIES} maxItems={8} />
          </div>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* Health Dashboard */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-text-base">
            Metadata Health Overview
          </h2>
          <MetadataHealthDashboard data={SAMPLE_HEALTH_DATA} />
        </section>

        {/* Predictive Insights */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-base">
              Predictive Insights
            </h2>
            <Badge variant="outline" className="gap-2">
              <TrendingUp className="h-3 w-3" />
              {SAMPLE_PREDICTIVE_INSIGHTS.length} active
            </Badge>
          </div>
          <PredictiveInsightsCard
            insights={SAMPLE_PREDICTIVE_INSIGHTS}
            onTakeAction={handleTakeAction}
            onViewDetails={handleViewInsightDetails}
          />
        </section>

        {/* Quality Trends (Placeholder for future chart) */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-text-base">
            Quality Trends
          </h2>
          <div className="rounded-lg border border-border-base bg-bg-subtle p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-text-muted mb-3" />
            <p className="text-sm text-text-muted">
              Quality trend charts coming soon
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Will show quality scores over time, by domain, and by tier
            </p>
          </div>
        </section>
      </div>
    </WorkbenchLayout>
  );
}

