import { updateOrderAction } from "../../actions";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EditOrderPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const { id } = await props.params;
  const { error } = await props.searchParams;
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

  if (!orgMember) {
    redirect("/orders");
  }

  // Fetch the order
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("org_id", orgMember.org_id)
    .single();

  if (!order) {
    redirect("/orders");
  }

  let clients: any[] = [];
  const { data } = await supabase
    .from("clients")
    .select("id, company_name, first_name, last_name")
    .eq("org_id", orgMember.org_id)
    .order("created_at", { ascending: false });
    
  if (data) {
    clients = data;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/orders" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Order</h1>
        <p className="text-sm text-gray-500 mt-1">Update the details for this order.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form action={updateOrderAction} className="space-y-8">
        <input type="hidden" name="order_id" value={order.id} />
        
        <div className="bg-card border border-subtle shadow-card rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                defaultValue={order.client_id}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all shadow-sm"
              >
                <option value="">Select a client...</option>
                {clients.map(client => {
                  const name = client.company_name || [client.first_name, client.last_name].filter(Boolean).join(" ");
                  return (
                    <option key={client.id} value={client.id}>{name}</option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Order Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="description"
                name="description"
                required
                defaultValue={order.description}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all shadow-sm"
                placeholder="e.g. 4 SEO Blog Articles, Website Copywriting..."
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                id="amount"
                name="amount"
                defaultValue={order.amount}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all shadow-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={order.status || "Pending"}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all shadow-sm"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="expected_delivery_date"
                name="expected_delivery_date"
                defaultValue={order.expected_delivery_date ? order.expected_delivery_date.split('T')[0] : ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all shadow-sm"
              />
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link 
            href="/orders" 
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all hover:bg-brand/90 hover:-translate-y-0.5 active:scale-95 shadow-brand/20 hover:shadow-brand/40"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
