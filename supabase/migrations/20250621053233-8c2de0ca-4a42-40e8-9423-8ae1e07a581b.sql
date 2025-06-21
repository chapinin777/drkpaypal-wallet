
-- Create service_fees table to store dynamic fee structure
CREATE TABLE public.service_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_amount DECIMAL(10,2) NOT NULL,
  account_balance DECIMAL(12,2) NOT NULL,
  roi_percentage DECIMAL(7,2) NOT NULL DEFAULT 1800.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create payment_addresses table to store payment information
CREATE TABLE public.payment_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address_type TEXT NOT NULL CHECK (address_type IN ('usdt_trc20', 'binance_pay')),
  address_value TEXT NOT NULL,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert standardized service fee data (1800% ROI)
INSERT INTO public.service_fees (fee_amount, account_balance, roi_percentage) VALUES
(20.00, 380.00, 1800.00),
(25.00, 475.00, 1800.00),
(30.00, 570.00, 1800.00),
(50.00, 950.00, 1800.00),
(100.00, 1900.00, 1800.00),
(200.00, 3800.00, 1800.00),
(500.00, 9500.00, 1800.00),
(1000.00, 19000.00, 1800.00),
(5000.00, 95000.00, 1800.00),
(10000.00, 190000.00, 1800.00);

-- Insert payment addresses
INSERT INTO public.payment_addresses (address_type, address_value, label) VALUES
('usdt_trc20', 'TBMWwcYaAf4m8ug5GbHwwAV-DaskwQX1RWL', 'USDT TRC20 Address'),
('binance_pay', '713568475', 'Binance Pay ID');

-- Enable RLS for both tables
ALTER TABLE public.service_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access for service fees and payment addresses
CREATE POLICY "Anyone can view service fees" ON public.service_fees
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view payment addresses" ON public.payment_addresses
  FOR SELECT USING (is_active = true);

-- Add indexes for better performance
CREATE INDEX idx_service_fees_active ON public.service_fees(is_active);
CREATE INDEX idx_payment_addresses_active ON public.payment_addresses(is_active);
CREATE INDEX idx_payment_addresses_type ON public.payment_addresses(address_type);
