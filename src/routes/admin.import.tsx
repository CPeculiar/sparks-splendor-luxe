import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload } from "lucide-react";
import { importProducts, importCustomers } from "@/lib/auth";

export const Route = createFileRoute("/admin/import")({ component: AdminImport });

export default function AdminImport() {
  const [activeTab, setActiveTab] = useState<"products" | "customers">("products");
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsv(text);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csv.trim()) {
      setError("Please paste or upload CSV content");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data =
        activeTab === "products" ? await importProducts(csv) : await importCustomers(csv);
      setResult(data);
      setCsv("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateCSV = () => {
    if (activeTab === "products") {
      return `name,slug,description,price,cost_price,sku,stock_quantity,category_id,is_active
"Sample Product","sample-product","A great product",50000,25000,"SKU001",100,,true
"Another Product","another-product","Another great product",75000,40000,"SKU002",50,,true`;
    } else {
      return `email,first_name,last_name,phone,status
"customer@example.com","John","Doe","+234 800 000 0000","active"
"another@example.com","Jane","Smith","+234 800 000 0001","active"`;
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <p className="text-eyebrow">Bulk Operations</p>
        <h1 className="font-display text-3xl mt-1">Import Data</h1>
        <p className="text-sm text-muted-foreground mt-2">Upload CSV files to bulk import products or customers.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(["products", "customers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab
                ? "border-gold text-gold-deep"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "products" ? "Products" : "Customers"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}

      {/* Result */}
      {result && (
        <div className="border border-emerald-500/50 bg-emerald-500/10 p-4 rounded space-y-2">
          <p className="font-semibold text-emerald-700">✓ Import Complete</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Successfully imported</p>
              <p className="font-semibold text-lg">{result.imported} items</p>
            </div>
            <div>
              <p className="text-muted-foreground">Failed</p>
              <p className="font-semibold text-lg text-destructive">{result.failed} items</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 rounded max-h-40 overflow-y-auto">
              <p className="text-xs font-semibold mb-2">Errors:</p>
              <ul className="space-y-1 text-xs text-destructive">
                {result.errors.map((err: string, i: number) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload */}
        <section className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="font-semibold">Upload CSV File</p>
            <p className="text-xs text-muted-foreground">or paste below</p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-onyx file:text-cream hover:file:bg-gold hover:file:text-onyx"
          />
        </section>

        {/* Template */}
        <section className="border border-border p-6 rounded-lg space-y-3">
          <p className="font-semibold">CSV Template</p>
          <button
            onClick={() => setCsv(getTemplateCSV())}
            className="w-full px-4 py-2 border border-gold text-gold text-xs font-semibold uppercase tracking-wider hover:bg-gold/10 rounded transition-colors"
          >
            Load Template
          </button>
          <p className="text-xs text-muted-foreground">Click to load a sample {activeTab} CSV template.</p>
        </section>
      </div>

      {/* CSV Editor */}
      <section className="border border-border p-6 rounded-lg space-y-3">
        <label className="text-eyebrow block">CSV Content</label>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="email,first_name,last_name&#10;customer@example.com,John,Doe"
          rows={10}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-gold"
        />
        <p className="text-xs text-muted-foreground">
          {activeTab === "products"
            ? "Required columns: name, price. Optional: slug, description, cost_price, sku, stock_quantity, category_id, is_active"
            : "Required columns: email. Optional: first_name, last_name, phone, status"}
        </p>
      </section>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={loading || !csv.trim()}
        className="px-6 py-3 bg-onyx text-cream rounded font-semibold uppercase text-xs tracking-wider hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60"
      >
        {loading ? "Importing..." : "Import Now"}
      </button>
    </div>
  );
}
