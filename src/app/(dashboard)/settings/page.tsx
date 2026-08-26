import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateProfileSettings } from "./actions";
import { Save } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-purple-900">Settings</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your account and preferences.</p>
      </div>

      <form action={updateProfileSettings} className="bg-card rounded-xl border border-subtle shadow-card overflow-hidden">
        <div className="p-6 border-b border-subtle">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Profile Details</h2>
          <p className="text-sm text-gray-500">Update your personal information.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed">
                {user.email}
              </div>
              <p className="text-xs text-gray-400 mt-1">Email address cannot be changed here.</p>
            </div>
            
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name || ""}
                placeholder="Enter your full name"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            type="submit"
            className="flex items-center gap-2 bg-brand text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all hover:bg-brand/90 hover:-translate-y-0.5 active:scale-95 shadow-brand/20 hover:shadow-brand/40"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
