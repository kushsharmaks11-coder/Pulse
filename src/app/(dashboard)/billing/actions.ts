"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInvoiceAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!orgMember) {
    return redirect("/billing/new?error=No organization found");
  }

  const client_id = formData.get("client_id") as string;
  const amountStr = formData.get("amount") as string;
  const status = formData.get("status") as string;
  const due_date = formData.get("due_date") as string;
  const notes = formData.get("notes") as string;

  if (!client_id || !due_date || !amountStr) {
    return redirect("/billing/new?error=Client, amount, and due date are required");
  }

  const amount = parseFloat(amountStr);

  const { error: insertError } = await supabase
    .from("invoices")
    .insert({
      org_id: orgMember.org_id,
      client_id,
      amount,
      status: status || "draft",
      due_date,
      notes: notes || null
    });

  if (insertError) {
    console.error("Error creating invoice:", insertError);
    return redirect(`/billing/new?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath("/billing");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  redirect("/billing");
}

export async function updateInvoiceAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const invoice_id = formData.get("invoice_id") as string;
  const client_id = formData.get("client_id") as string;
  const amountStr = formData.get("amount") as string;
  const status = formData.get("status") as string;
  const due_date = formData.get("due_date") as string;
  const notes = formData.get("notes") as string;

  if (!invoice_id || !client_id || !due_date || !amountStr) {
    return redirect(`/billing/${invoice_id}/edit?error=Missing required fields`);
  }

  const amount = parseFloat(amountStr);

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      client_id,
      amount,
      status: status || "draft",
      due_date,
      notes: notes || null
    })
    .eq("id", invoice_id);

  if (updateError) {
    console.error("Error updating invoice:", updateError);
    return redirect(`/billing/${invoice_id}/edit?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/billing");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  redirect("/billing");
}
