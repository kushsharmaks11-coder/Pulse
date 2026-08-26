import { createClient } from "@/utils/supabase/server";
import { Plus, Users, Receipt, TrendingUp, MoreVertical } from "lucide-react";
import Link from "next/link";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { DashboardCharts } from "./DashboardCharts"; // Client Component for Recharts

export default async function DashboardPage(props: { searchParams: Promise<{ client_id?: string }> }) {
  const searchParams = await props.searchParams;
  const clientId = searchParams.client_id;

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
    // Fetch recent 5 clients
    const { data: clientsData } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", orgMember.org_id)
      .order("created_at", { ascending: false })
      .limit(5);
      
    if (clientsData) clients = clientsData;

    // Fetch all invoices to calculate metrics
    let invoiceQuery = supabase
      .from("invoices")
      .select("*")
      .eq("org_id", orgMember.org_id);
      
    if (clientId) {
      invoiceQuery = invoiceQuery.eq("client_id", clientId);
    }
      
    const { data: invoicesData } = await invoiceQuery;
      
    if (invoicesData) invoices = invoicesData;
  }

  // Calculate Metrics from actual data
  const totalOutstanding = invoices
    .filter(inv => inv.status?.toLowerCase() === 'sent' || inv.status?.toLowerCase() === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const totalDraft = invoices
    .filter(inv => inv.status?.toLowerCase() === 'draft')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
    
  const totalPaid = invoices
    .filter(inv => inv.status?.toLowerCase() === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  // Simple formatting helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-purple-900">Dashboard</h1>
        </div>
        {clientId && (
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-gray-500 hover:text-brand transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
          >
            Clear Filter
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:shadow-brand/10 hover:border-brand/30 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">Total Clients</h3>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{clients.length}</div>
          <div className="flex items-center text-xs font-medium text-gray-900 mt-auto">
            <TrendingUp className="w-3 h-3 mr-1" />
            Active
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:shadow-brand/10 hover:border-brand/30 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">Outstanding</h3>
            <Receipt className="w-4 h-4 text-brand" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalOutstanding)}</div>
          <div className="flex items-center text-xs font-medium text-gray-900 mt-auto">
            Awaiting payment
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:shadow-brand/10 hover:border-brand/30 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">In Draft</h3>
            <Receipt className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalDraft)}</div>
          <div className="flex items-center text-xs font-medium text-gray-900 mt-auto">
            Not yet sent
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-subtle shadow-card flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:shadow-brand/10 hover:border-brand/30 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted">Total Paid</h3>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(totalPaid)}</div>
          <div className="flex items-center text-xs font-medium text-gray-900 mt-auto">
            Collected revenue
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-subtle shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            {/* The dropdown has been moved inside DashboardCharts to handle interactive state */}
          </div>
          <div className="h-72 w-full">
            <DashboardCharts invoices={invoices} />
          </div>
        </div>

        {/* Recent Clients Section */}
        <div className="bg-card rounded-xl border border-subtle shadow-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-subtle flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-brand font-medium hover:underline">View All</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {clients.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm mb-4">No clients found.</p>
                <Link href="/clients/new" className="text-sm text-brand font-medium hover:underline">Add one now</Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {clients.map(client => {
                  const companyName = client.company_name || [client.first_name, client.last_name].filter(Boolean).join(" ") || "Unnamed Client";
                  const isSelected = clientId === client.id;
                  
                  return (
                    <li key={client.id} className={`group ${isSelected ? 'bg-brand/10' : 'hover:bg-gray-50/80'} transition-colors`}>
                      <Link href={`?client_id=${client.id}`} className="p-4 flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <CompanyAvatar name={companyName} className="w-10 h-10" />
                          <div>
                            <p className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-gray-900'}`}>{companyName}</p>
                            <p className="text-xs text-gray-500">{client.email || "No email"}</p>
                          </div>
                        </div>
                        <div className="text-gray-400 hover:text-brand opacity-0 group-hover:opacity-100 transition-all">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
