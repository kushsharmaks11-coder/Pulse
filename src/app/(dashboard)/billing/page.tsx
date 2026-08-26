import { createClient } from "@/utils/supabase/server";
import { Plus, Search, Filter, Receipt, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CompanyAvatar } from "@/components/CompanyAvatar";

export default async function BillingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; 
  }

  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  let invoices: any[] = [];
  
  if (orgMember) {
    const { data } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          company_name
        )
      `)
      .eq("org_id", orgMember.org_id)
      .order("created_at", { ascending: false });
      
    if (data) {
      invoices = data;
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200'; // Draft
    }
  };

  // Metrics
  const hasInvoices = invoices.length > 0;

  const totalOutstanding = hasInvoices 
    ? invoices.filter(inv => inv.status.toLowerCase() === 'sent' || inv.status.toLowerCase() === 'overdue').reduce((sum, inv) => sum + Number(inv.amount), 0)
    : 15420; // Mock placeholder

  const totalPaid = hasInvoices
    ? invoices.filter(inv => inv.status.toLowerCase() === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0)
    : 12400; // Mock placeholder

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-purple-900">Billing</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage invoices, payments, and financial overview.</p>
        </div>
        <Link 
          href="/billing/new" 
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all hover:bg-brand/90 hover:-translate-y-0.5 active:scale-95 shadow-brand/20 hover:shadow-brand/40"
        >
          New Invoice <Plus className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">Total Outstanding</h3>
            <Receipt className="w-4 h-4 text-brand" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalOutstanding)}</div>
          <div className="flex items-center text-xs font-medium text-emerald-600 mt-auto">
            <TrendingUp className="w-3 h-3 mr-1" />
            Active invoices
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">Total Paid</h3>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalPaid)}</div>
          <div className="flex items-center text-xs font-medium text-emerald-600 mt-auto">
            Collected revenue
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-subtle shadow-card overflow-hidden">
        <div className="p-5 border-b border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
              Create your first invoice to bill your clients and track your revenue.
            </p>
            <Link 
              href="/billing/new" 
              className="flex items-center gap-2 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice ID</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => {
                  const client = invoice.clients;
                  const companyName = client?.company_name || [client?.first_name, client?.last_name].filter(Boolean).join(" ") || "Unknown Client";
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 uppercase text-xs tracking-wider">
                          {invoice.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CompanyAvatar name={companyName} className="w-6 h-6 text-[10px]" />
                          <span className="text-gray-600">{companyName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatCurrency(Number(invoice.amount))}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/billing/${invoice.id}/edit`} className="text-brand hover:underline font-medium text-sm">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
