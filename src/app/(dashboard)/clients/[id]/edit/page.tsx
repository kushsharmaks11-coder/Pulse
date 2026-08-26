import { updateClientAction } from "../../actions";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export default async function EditClientPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ error?: string }> 
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client, error: fetchError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !client) {
    notFound();
  }

  // Need to bind the client ID to the action to pass it along
  const updateActionWithId = updateClientAction.bind(null, id);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/clients" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Client</h1>
        <p className="text-sm text-gray-500 mt-1">Update details for {client.company_name || `${client.first_name || ""} ${client.last_name || ""}`}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form action={updateActionWithId} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-card border border-subtle shadow-card rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                defaultValue={client.first_name || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="Jane"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                defaultValue={client.last_name || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="Doe"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-gray-500 text-xs ml-1">(Provide a name or company)</span>
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                defaultValue={client.company_name || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="Acme Corp"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-card border border-subtle shadow-card rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={client.email || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="jane@acme.com"
              />
            </div>
            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                id="mobile_number"
                name="mobile_number"
                defaultValue={client.mobile_number || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-card border border-subtle shadow-card rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={client.address || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="123 Business Rd, Suite 100"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                required
                defaultValue={client.country}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="United States"
              />
            </div>
            <div>
              <label htmlFor="state_province" className="block text-sm font-medium text-gray-700 mb-2">State / Province</label>
              <input
                type="text"
                id="state_province"
                name="state_province"
                defaultValue={client.state_province || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="CA"
              />
            </div>
            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                defaultValue={client.postal_code || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                placeholder="90210"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link 
            href="/clients" 
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand/90 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
