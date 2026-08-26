"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrderAction(formData: FormData) {
  const supabase = await createClient();

  // Validate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!orgMember) {
    return redirect("/orders/new?error=No organization found");
  }

  // Extract form data
  const client_id = formData.get("client_id") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const status = formData.get("status") as string;
  const expected_delivery_date = formData.get("expected_delivery_date") as string;

  if (!client_id || !description) {
    return redirect("/orders/new?error=Client and description are required");
  }

  // Convert amount to number, default to 0
  const amount = amountStr ? parseFloat(amountStr) : 0;

  // Insert order
  const { error: insertError } = await supabase
    .from("orders")
    .insert({
      org_id: orgMember.org_id,
      client_id,
      description,
      amount,
      status: status || "Pending",
      expected_delivery_date: expected_delivery_date || null
    });

  if (insertError) {
    console.error("Error creating order:", insertError);
    return redirect(`/orders/new?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath("/orders");
  redirect("/orders");
}

export async function updateOrderAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const order_id = formData.get("order_id") as string;
  const client_id = formData.get("client_id") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const status = formData.get("status") as string;
  const expected_delivery_date = formData.get("expected_delivery_date") as string;

  if (!order_id || !client_id || !description) {
    return redirect(`/orders/${order_id}/edit?error=Missing required fields`);
  }

  const amount = amountStr ? parseFloat(amountStr) : 0;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      client_id,
      description,
      amount,
      status: status || "Pending",
      expected_delivery_date: expected_delivery_date || null
    })
    .eq("id", order_id);

  if (updateError) {
    console.error("Error updating order:", updateError);
    return redirect(`/orders/${order_id}/edit?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/orders");
  redirect("/orders");
}
