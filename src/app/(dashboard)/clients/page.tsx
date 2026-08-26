import { createClient } from "@/utils/supabase/server";
import { Plus, Search, Filter, MoreVertical, TrendingUp } from "lucide-react";
import Link from "next/link";
import ClientActions from "@/components/ClientActions";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { SearchInput } from "@/components/SearchInput";

// Helper component for the mini sparkline
function Sparkline({ color, points }: { color: string, points: string }) {
  return (
    <svg className="w-24 h-12" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={points} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function ClientsPage(props: { searchParams: Promise<{ client_id?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const clientId = searchParams.client_id;
  const q = searchParams.q;

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

  let clients: any[] = [];
  let invoices: any[] = [];

  if (orgMember) {
    let clientQuery = supabase
      .from("clients")
      .select("*")
      .eq("org_id", orgMember.org_id)
      .order("created_at", { ascending: false });
      
    if (q) {
      clientQuery = clientQuery.ilike("company_name", `%${q}%`);
    }
      
    const { data: clientsData } = await clientQuery;
      
    if (clientsData) {
      clients = clientsData;
    }

    let invoiceQuery = supabase
      .from("invoices")
      .select("*")
      .eq("org_id", orgMember.org_id);
      
    if (clientId) {
      invoiceQuery = invoiceQuery.eq("client_id", clientId);
    }
      
    const { data: invoicesData } = await invoiceQuery;
      
    if (invoicesData) {
      invoices = invoicesData;
    }
  }

  // Calculate Metrics from actual data
  const totalOutstanding = invoices
    .filter(inv => inv.status?.toLowerCase() === 'sent' || inv.status?.toLowerCase() === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const totalOverdue = invoices
    .filter(inv => inv.status?.toLowerCase() === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const totalDraft = invoices
    .filter(inv => inv.status?.toLowerCase() === 'draft')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold text-purple-900">Clients</h1>
          {(clientId || q) && (
            <Link 
              href="/clients" 
              className="text-sm font-medium text-gray-500 hover:text-brand transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
            >
              Clear Filter
            </Link>
          )}
        </div>
        <Link 
          href="/clients/new" 
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all hover:bg-brand/90 hover:-translate-y-0.5 active:scale-95 shadow-brand/20 hover:shadow-brand/40"
        >
          New Client <Plus className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:shadow-brand/10 hover:border-brand/30 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">Total outstanding</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalOutstanding)}</div>
          <div className="flex items-center justify-between mt-auto">
            {totalOutstanding > 0 ? (
              <>
                <div className="flex items-center text-xs font-medium text-emerald-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  2.3% <span className="text-muted ml-1 font-normal">Last month</span>
                </div>
                <Sparkline color="#10b981" points="M5 25 Q 20 20, 35 25 T 65 15 T 95 5" />
              </>
            ) : (
              <div className="flex items-center text-xs font-medium text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:shadow-brand/10 hover:border-brand/30 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">Overdue</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalOverdue)}</div>
          <div className="flex items-center justify-between mt-auto">
            {totalOverdue > 0 ? (
              <>
                <div className="flex items-center text-xs font-medium text-red-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  2.3% <span className="text-muted ml-1 font-normal">Last month</span>
                </div>
                <Sparkline color="#ef4444" points="M5 25 Q 20 25, 35 15 T 65 20 T 95 5" />
              </>
            ) : (
              <div className="flex items-center text-xs font-medium text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:shadow-brand/10 hover:border-brand/30 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">In draft</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalDraft)}</div>
          <div className="flex items-center justify-between mt-auto">
            {totalDraft > 0 ? (
              <>
                <div className="flex items-center text-xs font-medium text-gray-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  1.8% <span className="text-muted ml-1 font-normal">Last month</span>
                </div>
                <Sparkline color="#4b5563" points="M5 25 Q 25 15, 45 25 T 75 10 T 95 5" />
              </>
            ) : (
              <div className="flex items-center text-xs font-medium text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clients List Section */}
      <div className="bg-card rounded-xl border border-subtle shadow-card overflow-hidden">
        <div className="p-5 border-b border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Clients List</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchInput placeholder="Search company..." />
          </div>
        </div>

        {clients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
              Get started by creating your first client. You'll be able to manage their billing, invoices, and more.
            </p>
            <Link 
              href="/clients/new" 
              className="flex items-center gap-2 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Add your first client
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Company Name</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email Address</th>
                  <th className="px-6 py-4 font-medium">Total Outstanding</th>
                  <th className="px-6 py-4 font-medium">Status / Note</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => {
                  const companyName = client.company_name || [client.first_name, client.last_name].filter(Boolean).join(" ") || "Unnamed Client";
                  const personName = [client.last_name, client.first_name].filter(Boolean).join(", ");
                  const isSelected = clientId === client.id;
                  
                  return (
                    <tr key={client.id} className={`${isSelected ? 'bg-brand/10' : 'hover:bg-brand/5'} transition-colors group`}>
                      <td className="px-6 py-4">
                        <Link href={`?client_id=${client.id}`} className="flex items-center gap-3">
                          <CompanyAvatar name={companyName} />
                          <span className={`font-medium ${isSelected ? 'text-brand' : 'text-gray-900'} hover:underline`}>{companyName}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{personName || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{client.email || "-"}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">$0.00</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                         {client.status === "Active" ? "Authorization Created" : "Appeal Note"}
                      </td>
                      <td className="px-6 py-4">
                        <ClientActions clientId={client.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {clients.length > 0 && (
          <div className="p-4 border-t border-subtle flex items-center justify-between text-sm text-gray-500">
            <div>Page 1 of 1</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-200 text-gray-500 bg-white rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white" disabled>Previous</button>
              <button className="px-3 py-1.5 border border-gray-200 text-gray-500 bg-white rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white" disabled>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
