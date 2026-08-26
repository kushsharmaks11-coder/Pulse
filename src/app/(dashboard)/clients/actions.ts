"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Get user's default organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!orgMember) {
    throw new Error("No organization found");
  }

  // Extract form data
  const firstName = formData.get("first_name") as string | null;
  const lastName = formData.get("last_name") as string | null;
  const companyName = formData.get("company_name") as string | null;
  const email = formData.get("email") as string | null;
  const mobileNumber = formData.get("mobile_number") as string | null;
  const address = formData.get("address") as string | null;
  const country = formData.get("country") as string;
  const stateProvince = formData.get("state_province") as string | null;
  const postalCode = formData.get("postal_code") as string | null;
  const currencyAndLanguage = formData.get("currency_and_language") as string | null;
  
  // Insert into database
  const { error } = await supabase.from("clients").insert({
    org_id: orgMember.org_id,
    created_by: user.id,
    first_name: firstName || null,
    last_name: lastName || null,
    company_name: companyName || null,
    email: email || null,
    mobile_number: mobileNumber || null,
    address: address || null,
    country,
    state_province: stateProvince || null,
    postal_code: postalCode || null,
    currency_and_language: currencyAndLanguage || null,
    // Note: Preferences are intentionally left out as per user request (they will use DB defaults)
  });

  if (error) {
    console.error("Error creating client:", error);
    redirect(`/clients/new?error=Could not create client: ${error.message}`);
  }

  // Revalidate the clients list page and redirect
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const firstName = formData.get("first_name") as string | null;
  const lastName = formData.get("last_name") as string | null;
  const companyName = formData.get("company_name") as string | null;
  const email = formData.get("email") as string | null;
  const mobileNumber = formData.get("mobile_number") as string | null;
  const address = formData.get("address") as string | null;
  const country = formData.get("country") as string;
  const stateProvince = formData.get("state_province") as string | null;
  const postalCode = formData.get("postal_code") as string | null;
  const currencyAndLanguage = formData.get("currency_and_language") as string | null;

  const { error } = await supabase
    .from("clients")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      company_name: companyName || null,
      email: email || null,
      mobile_number: mobileNumber || null,
      address: address || null,
      country,
      state_province: stateProvince || null,
      postal_code: postalCode || null,
      currency_and_language: currencyAndLanguage || null,
    })
    .eq("id", clientId);

  if (error) {
    console.error("Error updating client:", error);
    redirect(`/clients/${clientId}/edit?error=Could not update client: ${error.message}`);
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) {
    console.error("Error deleting client:", error);
    throw new Error(error.message);
  }

  revalidatePath("/clients");
}
