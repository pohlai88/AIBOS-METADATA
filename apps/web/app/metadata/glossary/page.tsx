/**
 * Metadata Glossary Browser - Silent Killer Frontend
 *
 * The core SSOT for all canonical field definitions.
 * Implements the Single-Page Contextual Workbench pattern:
 * - Left: DataGrid with all metadata fields
 * - Right: ContextualSidebar with field details
 * - Top: ActionHeader with search and filters
 *
 * Key UX Principle: Clicking a row updates the sidebar - never navigates away.
 *
 * @see UI-IMPLEMENTATION-PLAN.md Section 3.1: Metadata Glossary Browser
 */

"use client";

import { useState } from "react";
import { WorkbenchLayout } from "@/components/workbench/WorkbenchLayout";
import { ActionHeader } from "@/components/workbench/ActionHeader";
import { ContextualSidebar, type SidebarTab } from "@/components/workbench/ContextualSidebar";
import { DataGrid, MetadataFieldCell, type DataGridColumn } from "@/components/workbench/DataGrid";
import {
  LineageEmptyState,
  AISuggestionsEmptyState,
  ComplianceEmptyState,
} from "@/components/workbench/EmptyState";
import { LineageMiniGraph } from "@/components/metadata/LineageMiniGraph";
import { AISuggestionsList } from "@/components/metadata/AISuggestionCard";
import {
  ComplianceStatusCard,
  getSampleComplianceRequirements,
} from "@/components/governance/ComplianceStatusCard";
import { MicroActionDrawer, useMicroActionDrawer } from "@/components/governance/MicroActionDrawer";
import { ChangeRequestForm } from "@/components/governance/ChangeRequestForm";
import type { ChangeRequest } from "@/components/governance/ChangeRequestForm";
import { QualityScoreBadge, QualityScoreIndicator } from "@/components/ui/quality-badge";
import { TierBadge } from "@/components/ui/metadata-badges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  User,
  BarChart3,
  GitBranch,
  Sparkles,
  Shield,
  Plus,
  Search,
  Database,
  AlertCircle,
  FileText,
} from "lucide-react";
import { SAMPLE_METADATA_FIELDS, getSampleDataStats, type MetadataField } from "@/lib/sample-data";
import { getLineageForField, hasLineage } from "@/lib/sample-lineage";
import { getAISuggestionsForField, getAISuggestionCount } from "@/lib/sample-ai-proposals";

export default function MetadataGlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<MetadataField | null>(null);
  const [useSampleData, setUseSampleData] = useState(true); // Toggle for demo data

  // Micro Action Drawer for change requests
  const changeRequestDrawer = useMicroActionDrawer();

  const stats = getSampleDataStats();

  const handleSubmitChangeRequest = (request: ChangeRequest) => {
    console.log("Change request submitted:", request);
    // In real app: call API to submit change request
    alert(`Change request submitted for ${request.fieldName}`);
    changeRequestDrawer.close();
  };

  // Filter data based on search, domain, and module
  const filteredData = SAMPLE_METADATA_FIELDS.filter((field) => {
    const matchesSearch =
      searchQuery === "" ||
      field.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain =
      selectedDomain === "all" || field.domain === selectedDomain;
    const matchesModule =
      selectedModule === "all" || field.module === selectedModule;
    return matchesSearch && matchesDomain && matchesModule;
  });

  // Define columns for the data grid
  const columns: DataGridColumn<MetadataField>[] = [
    {
      id: "fieldName",
      label: "Field Name",
      sortable: true,
      width: "w-[250px]",
      render: (_, row) => (
        <MetadataFieldCell
          fieldName={row.fieldName}
          label={row.label}
          tier={row.tier}
        />
      ),
    },
    {
      id: "domain",
      label: "Domain",
      sortable: true,
      width: "w-[120px]",
      render: (value) => (
        <Badge variant="outline" className="font-mono text-xs">
          {value}
        </Badge>
      ),
    },
    {
      id: "module",
      label: "Module",
      sortable: true,
      width: "w-[100px]",
    },
    {
      id: "qualityScore",
      label: "Quality",
      sortable: true,
      width: "w-[140px]",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <QualityScoreBadge score={value} showProgress />
          {getAISuggestionCount(row.fieldName) > 0 && (
            <div className="relative" title={`${getAISuggestionCount(row.fieldName)} AI suggestions`}>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                {getAISuggestionCount(row.fieldName)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "owner",
      label: "Owner",
      sortable: true,
      width: "w-[150px]",
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-text-muted" />
          <span className="text-sm text-text-muted">@{value}</span>
        </div>
      ),
    },
  ];

  // Define sidebar tabs
  const sidebarTabs: SidebarTab[] = [
    {
      id: "definition",
      label: "Definition",
      icon: <BookOpen className="h-3 w-3" />,
      content: selectedField ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-text-base">Business Definition</h3>
            <p className="mt-1 text-sm text-text-muted">{selectedField.definition}</p>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-text-muted">Field Name</span>
              <p className="font-mono text-sm text-text-base">{selectedField.fieldName}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Label</span>
              <p className="text-sm text-text-base">{selectedField.label}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Data Type</span>
              <p className="font-mono text-sm text-text-base">{selectedField.dataType}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Sensitivity</span>
              <Badge variant="outline" className="mt-1">{selectedField.sensitivity}</Badge>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Select a field to view definition</p>
      ),
    },
    {
      id: "owner",
      label: "Owner",
      icon: <User className="h-3 w-3" />,
      content: selectedField ? (
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-text-muted">Data Steward</span>
            <p className="mt-1 text-sm text-text-base">@{selectedField.owner}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Autonomy Tier</span>
            <div className="mt-1">
              <TierBadge tier={selectedField.tier} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Select a field to view owner</p>
      ),
    },
    {
      id: "quality",
      label: "Quality",
      icon: <BarChart3 className="h-3 w-3" />,
      content: selectedField ? (
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium text-text-muted">Quality Score</span>
            <div className="mt-2">
              <QualityScoreBadge score={selectedField.qualityScore} size="lg" showProgress />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Last Profiled</span>
            <p className="mt-1 text-sm text-text-base">2025-12-02 15:30:00 UTC</p>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Thresholds</span>
            <p className="mt-1 text-xs text-text-muted">
              Target: 80% • Current: {selectedField.qualityScore}%
            </p>
          </div>
          {selectedField.qualityScore < 90 && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2">
              <p className="text-xs text-warning">
                ⚠️ Consider running quality profiler to identify specific issues
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Select a field to view quality metrics</p>
      ),
    },
    {
      id: "lineage",
      label: "Lineage",
      icon: <GitBranch className="h-3 w-3" />,
      badge: selectedField && hasLineage(selectedField.fieldName) ? undefined : 0,
      content: selectedField && hasLineage(selectedField.fieldName) ? (
        <LineageMiniGraph
          {...getLineageForField(selectedField.fieldName)}
          currentNodeId="current"
          onViewFull={() => console.log("View full lineage graph")}
        />
      ) : (
        <LineageEmptyState fieldName={selectedField?.fieldName} />
      ),
    },
    {
      id: "ai",
      label: "AI",
      icon: <Sparkles className="h-3 w-3" />,
      badge: selectedField ? getAISuggestionCount(selectedField.fieldName) : 0,
      content: selectedField ? (
        <AISuggestionsList
          suggestions={getAISuggestionsForField(selectedField.fieldName)}
          onAccept={(id) => console.log("Accept suggestion:", id)}
          onReject={(id) => console.log("Reject suggestion:", id)}
          onViewDetails={(id) => console.log("View details:", id)}
          emptyMessage="All clear! No suggestions for this field."
        />
      ) : (
        <AISuggestionsEmptyState />
      ),
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: <Shield className="h-3 w-3" />,
      content: selectedField ? (
        <ComplianceStatusCard
          fieldName={selectedField.fieldName}
          requirements={getSampleComplianceRequirements(selectedField.fieldName)}
          overallStatus={
            selectedField.fieldName === "customer_name"
              ? "partial"
              : "compliant"
          }
          onViewDetails={() => console.log("View compliance details")}
        />
      ) : (
        <ComplianceEmptyState fieldName={selectedField?.fieldName} />
      ),
    },
  ];

  return (
    <WorkbenchLayout
      header={
        <ActionHeader
          title={
            <div className="flex items-center gap-3">
              <span>Metadata Glossary</span>
              <Badge variant="outline" className="font-normal">
                {filteredData.length} fields
              </Badge>
            </div>
          }
          indicators={
            <Badge variant="outline" className="gap-2">
              <Database className="h-3 w-3" />
              {useSampleData ? "Demo Data" : "Live Data"}
            </Badge>
          }
          filters={
            <>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  type="search"
                  placeholder="Search fields, definitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains ({stats.total})</SelectItem>
                  <SelectItem value="FINANCE">Finance ({stats.byDomain.FINANCE})</SelectItem>
                  <SelectItem value="TAX">Tax ({stats.byDomain.TAX})</SelectItem>
                  <SelectItem value="HR">HR ({stats.byDomain.HR})</SelectItem>
                  <SelectItem value="OPERATIONS">Operations ({stats.byDomain.OPERATIONS})</SelectItem>
                  <SelectItem value="SALES">Sales ({stats.byDomain.SALES})</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="AR">AR</SelectItem>
                  <SelectItem value="AP">AP</SelectItem>
                  <SelectItem value="GL">GL</SelectItem>
                  <SelectItem value="TAX">Tax</SelectItem>
                  <SelectItem value="PAYROLL">Payroll</SelectItem>
                  <SelectItem value="INVENTORY">Inventory</SelectItem>
                  <SelectItem value="ORDERS">Orders</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
          actions={
            <>
              {selectedField && (
                <Button
                  variant="outline"
                  onClick={changeRequestDrawer.open}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Request Change
                </Button>
              )}
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Field
              </Button>
            </>
          }
        />
      }
      sidebar={
        <ContextualSidebar
          tabs={sidebarTabs}
          header={
            selectedField ? (
              <div>
                <h2 className="font-semibold text-text-base">{selectedField.label}</h2>
                <p className="font-mono text-xs text-text-muted">{selectedField.fieldName}</p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Select a field to view details</p>
            )
          }
        />
      }
      sidebarOpen={selectedField !== null}
    >
      <div className="p-6">
        <DataGrid
          columns={columns}
          data={filteredData}
          onRowClick={setSelectedField}
          selectedRowId={selectedField?.id}
        />
      </div>

      {/* Change Request Drawer */}
      {selectedField && (
        <MicroActionDrawer
          open={changeRequestDrawer.isOpen}
          onClose={changeRequestDrawer.close}
          title="Request Metadata Change"
          size="md"
        >
          <ChangeRequestForm
            fieldName={selectedField.fieldName}
            currentTier={typeof selectedField.tier === "string" ? parseInt(selectedField.tier.replace("tier", "")) : selectedField.tier}
            onSubmit={handleSubmitChangeRequest}
            onCancel={changeRequestDrawer.close}
          />
        </MicroActionDrawer>
      )}
    </WorkbenchLayout>
  );
}
