
-- Update wallet addresses to use crypto-style format (0x...)
UPDATE public.wallets 
SET wallet_address = '0x' || substr(md5(id::text || user_id::text), 1, 40)
WHERE wallet_address IS NULL OR NOT wallet_address LIKE '0x%';

-- Create table for transaction queue to support ACID operations
CREATE TABLE public.transaction_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('send', 'receive', 'swap', 'deposit', 'withdraw')),
  from_currency_id UUID REFERENCES public.currencies(id),
  to_currency_id UUID REFERENCES public.currencies(id),
  amount DECIMAL(20,8) NOT NULL,
  recipient_identifier TEXT, -- email or wallet address
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create swap_pairs table for asset swapping
CREATE TABLE public.swap_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency_id UUID NOT NULL REFERENCES public.currencies(id),
  to_currency_id UUID NOT NULL REFERENCES public.currencies(id),
  exchange_rate DECIMAL(20,8) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(from_currency_id, to_currency_id)
);

-- Create user_preferred_assets table for customizable assets
CREATE TABLE public.user_preferred_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  currency_id UUID NOT NULL REFERENCES public.currencies(id),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, currency_id)
);

-- Insert default swap pairs
INSERT INTO public.swap_pairs (from_currency_id, to_currency_id, exchange_rate) 
SELECT 
  c1.id as from_currency_id,
  c2.id as to_currency_id,
  CASE 
    WHEN c1.code = 'USD' AND c2.code = 'BTC' THEN 0.00001
    WHEN c1.code = 'BTC' AND c2.code = 'USD' THEN 100000
    WHEN c1.code = 'USD' AND c2.code = 'ETH' THEN 0.00025
    WHEN c1.code = 'ETH' AND c2.code = 'USD' THEN 4000
    WHEN c1.code = 'BTC' AND c2.code = 'ETH' THEN 25
    WHEN c1.code = 'ETH' AND c2.code = 'BTC' THEN 0.04
    ELSE 1
  END as exchange_rate
FROM public.currencies c1
CROSS JOIN public.currencies c2
WHERE c1.id != c2.id AND c1.is_active = true AND c2.is_active = true;

-- Enable RLS for new tables
ALTER TABLE public.transaction_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferred_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for transaction_queue
CREATE POLICY "Users can view their own transaction queue" ON public.transaction_queue
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions" ON public.transaction_queue
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS policies for user_preferred_assets
CREATE POLICY "Users can manage their preferred assets" ON public.user_preferred_assets
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_transaction_queue_user_status ON public.transaction_queue(user_id, status);
CREATE INDEX idx_swap_pairs_active ON public.swap_pairs(from_currency_id, to_currency_id) WHERE is_active = true;
CREATE INDEX idx_user_preferred_assets ON public.user_preferred_assets(user_id, is_visible);

-- Function to generate QR code data for receiving
CREATE OR REPLACE FUNCTION public.generate_receive_qr_data(wallet_addr TEXT, amount DECIMAL DEFAULT NULL, currency_code TEXT DEFAULT 'USD')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF amount IS NOT NULL THEN
    RETURN format('{"address":"%s","amount":%s,"currency":"%s"}', wallet_addr, amount, currency_code);
  ELSE
    RETURN format('{"address":"%s","currency":"%s"}', wallet_addr, currency_code);
  END IF;
END;
$$;
