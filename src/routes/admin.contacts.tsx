import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Trash2, Archive } from "lucide-react";

export const Route = createFileRoute("/admin/contacts")({ component: AdminContacts });

function AdminContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch contacts from backend
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-eyebrow">Communication</p>
        <h1 className="font-display text-3xl mt-1">Contact Form Submissions</h1>
      </header>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="bg-background border border-border p-12 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No contact submissions yet</p>
        </div>
      ) : (
        <div className="bg-background border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide">Subject</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.subject}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-2 hover:text-gold"><Archive className="h-4 w-4" /></button>
                    <button className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
