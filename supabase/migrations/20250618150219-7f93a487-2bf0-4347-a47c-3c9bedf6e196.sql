
-- Create users profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'United States',
  postal_code TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  kyc_level INTEGER DEFAULT 1 CHECK (kyc_level BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create currencies table
CREATE TABLE public.currencies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  currency_id UUID NOT NULL REFERENCES public.currencies(id),
  balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  available_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  pending_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  wallet_address TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE(user_id, currency_id)
);

-- Create transaction_types table
CREATE TABLE public.transaction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (id)
);

-- Create transaction_statuses table
CREATE TABLE public.transaction_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_final BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  transaction_hash TEXT UNIQUE,
  from_wallet_id UUID REFERENCES public.wallets(id),
  to_wallet_id UUID REFERENCES public.wallets(id),
  transaction_type_id UUID NOT NULL REFERENCES public.transaction_types(id),
  status_id UUID NOT NULL REFERENCES public.transaction_statuses(id),
  amount DECIMAL(20,8) NOT NULL,
  fee DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  net_amount DECIMAL(20,8) NOT NULL,
  currency_id UUID NOT NULL REFERENCES public.currencies(id),
  reference_number TEXT UNIQUE,
  description TEXT,
  external_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
);

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bank_account', 'credit_card', 'debit_card', 'paypal', 'crypto')),
  provider TEXT NOT NULL,
  account_number TEXT,
  routing_number TEXT,
  card_last_four TEXT,
  card_type TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  holder_name TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT NOT NULL,
  nickname TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE(user_id, contact_user_id)
);

-- Create transaction_logs table for audit trail
CREATE TABLE public.transaction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  old_status_id UUID REFERENCES public.transaction_statuses(id),
  new_status_id UUID NOT NULL REFERENCES public.transaction_statuses(id),
  changed_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('transaction', 'security', 'system', 'promotion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
);

-- Insert default currencies
INSERT INTO public.currencies (code, name, symbol, decimals) VALUES
('USD', 'US Dollar', '$', 2),
('EUR', 'Euro', '€', 2),
('GBP', 'British Pound', '£', 2),
('BTC', 'Bitcoin', '₿', 8),
('ETH', 'Ethereum', 'Ξ', 8);

-- Insert transaction types
INSERT INTO public.transaction_types (code, name, description) VALUES
('send', 'Send Money', 'Transfer money to another user'),
('receive', 'Receive Money', 'Receive money from another user'),
('deposit', 'Deposit', 'Add money to wallet from external source'),
('withdraw', 'Withdrawal', 'Transfer money from wallet to external account'),
('fee', 'Fee', 'Transaction fee'),
('refund', 'Refund', 'Refund of a previous transaction');

-- Insert transaction statuses
INSERT INTO public.transaction_statuses (code, name, description, is_final) VALUES
('pending', 'Pending', 'Transaction is being processed', false),
('processing', 'Processing', 'Transaction is in progress', false),
('completed', 'Completed', 'Transaction completed successfully', true),
('failed', 'Failed', 'Transaction failed', true),
('cancelled', 'Cancelled', 'Transaction was cancelled', true),
('refunded', 'Refunded', 'Transaction was refunded', true);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for wallets
CREATE POLICY "Users can view their own wallets" ON public.wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own wallets" ON public.wallets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wallets" ON public.wallets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.wallets w1 WHERE w1.id = from_wallet_id AND w1.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM public.wallets w2 WHERE w2.id = to_wallet_id AND w2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transactions from their wallets" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wallets w WHERE w.id = from_wallet_id AND w.user_id = auth.uid()
    )
  );

-- Create RLS policies for payment methods
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create RLS policies for contacts
CREATE POLICY "Users can manage their own contacts" ON public.contacts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create RLS policies for transaction logs
CREATE POLICY "Users can view logs for their transactions" ON public.transaction_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      JOIN public.wallets w ON (w.id = t.from_wallet_id OR w.id = t.to_wallet_id)
      WHERE t.id = transaction_id AND w.user_id = auth.uid()
    )
  );

-- Create RLS policies for notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  usd_currency_id UUID;
BEGIN
  -- Insert user profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Get USD currency ID
  SELECT id INTO usd_currency_id FROM public.currencies WHERE code = 'USD';

  -- Create default USD wallet
  INSERT INTO public.wallets (user_id, currency_id, wallet_address)
  VALUES (
    NEW.id,
    usd_currency_id,
    'wallet_' || substr(NEW.id::text, 1, 8)
  );

  -- Send welcome notification
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    NEW.id,
    'system',
    'Welcome to PayPal Wallet!',
    'Your account has been created successfully. Start by adding funds to your wallet.'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status_id = (SELECT id FROM public.transaction_statuses WHERE code = 'completed') THEN
    -- Update sender wallet (subtract amount + fee)
    IF NEW.from_wallet_id IS NOT NULL THEN
      UPDATE public.wallets 
      SET 
        balance = balance - (NEW.amount + NEW.fee),
        available_balance = available_balance - (NEW.amount + NEW.fee),
        updated_at = NOW()
      WHERE id = NEW.from_wallet_id;
    END IF;

    -- Update receiver wallet (add amount)
    IF NEW.to_wallet_id IS NOT NULL THEN
      UPDATE public.wallets 
      SET 
        balance = balance + NEW.amount,
        available_balance = available_balance + NEW.amount,
        updated_at = NOW()
      WHERE id = NEW.to_wallet_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for wallet balance updates
CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Create indexes for better performance
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_transactions_from_wallet ON public.transactions(from_wallet_id);
CREATE INDEX idx_transactions_to_wallet ON public.transactions(to_wallet_id);
CREATE INDEX idx_transactions_status ON public.transactions(status_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
