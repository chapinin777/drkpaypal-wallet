-- Create user plan subscriptions table
CREATE TABLE public.user_plan_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_fee_id UUID NOT NULL REFERENCES service_fees(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_deposit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_plan_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscriptions" ON public.user_plan_subscriptions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" ON public.user_plan_subscriptions
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" ON public.user_plan_subscriptions
FOR UPDATE USING (user_id = auth.uid());

-- Create auto deposit function
CREATE OR REPLACE FUNCTION public.process_auto_deposits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
  usd_currency_id UUID;
  user_wallet_id UUID;
  completed_status_id UUID;
  deposit_type_id UUID;
BEGIN
  -- Get currency and status IDs
  SELECT id INTO usd_currency_id FROM currencies WHERE code = 'USD';
  SELECT id INTO completed_status_id FROM transaction_statuses WHERE code = 'completed';
  SELECT id INTO deposit_type_id FROM transaction_types WHERE code = 'deposit';

  -- Process all active subscriptions that are due
  FOR subscription_record IN 
    SELECT ups.*, sf.account_balance, sf.fee_amount
    FROM user_plan_subscriptions ups
    JOIN service_fees sf ON ups.service_fee_id = sf.id
    WHERE ups.is_active = true 
    AND ups.next_deposit_at <= now()
  LOOP
    -- Get user's USD wallet
    SELECT id INTO user_wallet_id 
    FROM wallets 
    WHERE user_id = subscription_record.user_id 
    AND currency_id = usd_currency_id;

    -- Create wallet if it doesn't exist
    IF user_wallet_id IS NULL THEN
      INSERT INTO wallets (user_id, currency_id, wallet_address, balance)
      VALUES (
        subscription_record.user_id, 
        usd_currency_id, 
        'wallet_' || substr(subscription_record.user_id::text, 1, 8),
        0
      )
      RETURNING id INTO user_wallet_id;
    END IF;

    -- Add balance to wallet
    UPDATE wallets 
    SET 
      balance = balance + subscription_record.account_balance,
      updated_at = now()
    WHERE id = user_wallet_id;

    -- Create transaction record
    INSERT INTO transactions (
      to_wallet_id,
      transaction_type_id,
      status_id,
      currency_id,
      amount,
      net_amount,
      fee,
      description,
      metadata
    ) VALUES (
      user_wallet_id,
      deposit_type_id,
      completed_status_id,
      usd_currency_id,
      subscription_record.account_balance,
      subscription_record.account_balance,
      0,
      'Auto-deposit from subscription plan',
      jsonb_build_object(
        'subscription_id', subscription_record.id,
        'plan_fee', subscription_record.fee_amount,
        'auto_deposit', true
      )
    );

    -- Update next deposit time
    UPDATE user_plan_subscriptions 
    SET 
      next_deposit_at = next_deposit_at + INTERVAL '24 hours',
      updated_at = now()
    WHERE id = subscription_record.id;

    -- Send notification
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      subscription_record.user_id,
      'deposit',
      'Auto-Deposit Completed',
      format('$%s has been automatically deposited to your account.', subscription_record.account_balance)
    );
  END LOOP;
END;
$$;