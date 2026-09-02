import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Download } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function AdminReports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-eyebrow">Analytics</p>
        <h1 className="font-display text-3xl mt-1">Reports</h1>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border border-border p-4 rounded">
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="font-display text-2xl mt-2">0</p>
        </div>
        <div className="bg-background border border-border p-4 rounded">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="font-display text-2xl mt-2">₦0</p>
        </div>
        <div className="bg-background border border-border p-4 rounded">
          <p className="text-xs text-muted-foreground">Avg Order Value</p>
          <p className="font-display text-2xl mt-2">₦0</p>
        </div>
        <div className="bg-background border border-border p-4 rounded">
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
          <p className="font-display text-2xl mt-2">0%</p>
        </div>
      </div>

      <div className="bg-background border border-border p-6 space-y-4">
        <h3 className="font-medium text-sm">Generate Report</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-2">From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="inp" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="inp" />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-gold text-onyx px-4 py-2 text-xs font-medium uppercase hover:bg-gold/90 transition-colors">
            <BarChart3 className="h-4 w-4" /> View Report
          </button>
          <button className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-medium uppercase hover:border-gold hover:text-gold transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
