-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  description TEXT NOT NULL,
  expected_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view orders in their organization"
ON orders FOR SELECT
TO authenticated
USING (is_org_member(org_id));

CREATE POLICY "Users can create orders in their organization"
ON orders FOR INSERT
TO authenticated
WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update orders in their organization"
ON orders FOR UPDATE
TO authenticated
USING (is_org_member(org_id))
WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can delete orders in their organization"
ON orders FOR DELETE
TO authenticated
USING (is_org_member(org_id));

-- Trigger to update 'updated_at'
CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
