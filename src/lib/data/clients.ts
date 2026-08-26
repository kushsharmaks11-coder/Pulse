"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { Client } from "../types";

// Note: In Supabase, the data types might be slightly different 
// (e.g. snake_case instead of camelCase in the DB). 
// For prototyping, we map them back to the UI's expected format.

export async function getClients(): Promise<Client[]> {
  const supabase = await createSupabaseClient();
  
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return (clients || []).map(mapDbToClient);
}

export async function createClient(clientData: Omit<Client, "id" | "status" | "createdAt">): Promise<Client> {
  const supabase = await createSupabaseClient();
  
  // Get the user's primary organization
  const { data: orgs, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .limit(1)
    .single();

  if (orgError || !orgs) {
    throw new Error("Could not find user organization.");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert([{
      org_id: orgs.id,
      first_name: clientData.firstName,
      last_name: clientData.lastName,
      company_name: clientData.companyName,
      email: clientData.email,
      mobile_number: clientData.mobileNumber,
      address: clientData.address,
      country: clientData.country,
      state_province: clientData.stateProvince,
      postal_code: clientData.postalCode,
      send_payment_reminders: clientData.settings.sendPaymentReminders,
      charge_late_fees: clientData.settings.chargeLateFees,
      currency_and_language: clientData.settings.currencyAndLanguage,
      invoice_attachments: clientData.settings.invoiceAttachments,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    throw new Error(error.message);
  }

  return mapDbToClient(data);
}

function mapDbToClient(dbRecord: any): Client {
  return {
    id: dbRecord.id,
    firstName: dbRecord.first_name || "",
    lastName: dbRecord.last_name || "",
    companyName: dbRecord.company_name || "",
    email: dbRecord.email || "",
    mobileNumber: dbRecord.mobile_number || "",
    address: dbRecord.address || "",
    country: dbRecord.country || "",
    stateProvince: dbRecord.state_province || "",
    postalCode: dbRecord.postal_code || "",
    status: dbRecord.status || "Active",
    createdAt: dbRecord.created_at,
    settings: {
      sendPaymentReminders: dbRecord.send_payment_reminders,
      chargeLateFees: dbRecord.charge_late_fees,
      currencyAndLanguage: dbRecord.currency_and_language,
      invoiceAttachments: dbRecord.invoice_attachments,
    }
  };
}
