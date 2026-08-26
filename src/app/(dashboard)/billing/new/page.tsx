import { createInvoiceAction } from "../actions";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  let clients: any[] = [];
  if (orgMember) {
    const { data } = await supabase
      .from("clients")
      .select("id, company_name, first_name, last_name")
      .eq("org_id", orgMember.org_id)
      .order("created_at", { ascending: false });
      
    if (data) {
      clients = data;
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/billing" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
        <p className="text-sm text-gray-500 mt-1">Bill your clients and track your payments.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form action={createInvoiceAction} className="space-y-8">
        <div className="bg-card border border-subtle shadow-card rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
              >
                <option value="">Select a client...</option>
                {clients.map(client => {
                  const name = client.company_name || [client.first_name, client.last_name].filter(Boolean).join(" ");
                  return (
                    <option key={client.id} value={client.id}>{name}</option>
                  );
                })}
              </select>
              {clients.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  You need to <Link href="/clients/new" className="underline font-medium">add a client</Link> before creating an invoice.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="amount"
                name="amount"
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                defaultValue="draft"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent (Awaiting Payment)</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="Any additional notes for this invoice..."
              />
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link 
            href="/billing" 
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={clients.length === 0}
            className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all hover:bg-brand/90 hover:-translate-y-0.5 active:scale-95 shadow-brand/20 hover:shadow-brand/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 disabled:shadow-none"
          >
            <Save className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
