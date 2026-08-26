"use client";

import { Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { deleteClientAction } from "@/app/(dashboard)/clients/actions";

export default function ClientActions({ clientId }: { clientId: string }) {
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      try {
        await deleteClientAction(clientId);
      } catch (error) {
        console.error("Failed to delete client", error);
        alert("Failed to delete client");
      }
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <Link 
        href={`/clients/${clientId}/edit`}
        className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
        title="Edit Client"
      >
        <Edit2 className="w-4 h-4" />
      </Link>
      <button 
        onClick={handleDelete}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Delete Client"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
