-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in their organization"
ON invoices FOR SELECT
TO authenticated
USING (is_org_member(org_id));

CREATE POLICY "Users can create invoices in their organization"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update invoices in their organization"
ON invoices FOR UPDATE
TO authenticated
USING (is_org_member(org_id))
WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can delete invoices in their organization"
ON invoices FOR DELETE
TO authenticated
USING (is_org_member(org_id));

-- Trigger to update 'updated_at'
CREATE TRIGGER update_invoices_modtime
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
