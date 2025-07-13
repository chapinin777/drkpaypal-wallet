
-- Create the execute_swap_transaction function for atomic swap operations
CREATE OR REPLACE FUNCTION public.execute_swap_transaction(
  p_user_id UUID,
  p_from_currency_id UUID,
  p_to_currency_id UUID,
  p_from_amount NUMERIC,
  p_to_amount NUMERIC,
  p_exchange_rate NUMERIC,
  p_transaction_type_id UUID,
  p_status_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_wallet_id UUID;
  v_to_wallet_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Get wallet IDs
  SELECT id INTO v_from_wallet_id 
  FROM wallets 
  WHERE user_id = p_user_id AND currency_id = p_from_currency_id;
  
  SELECT id INTO v_to_wallet_id 
  FROM wallets 
  WHERE user_id = p_user_id AND currency_id = p_to_currency_id;
  
  -- Create to_wallet if it doesn't exist
  IF v_to_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, currency_id, wallet_address)
    VALUES (p_user_id, p_to_currency_id, 'wallet_' || substr(p_user_id::text, 1, 8))
    RETURNING id INTO v_to_wallet_id;
  END IF;
  
  -- Check sufficient balance
  IF (SELECT balance FROM wallets WHERE id = v_from_wallet_id) < p_from_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Update from wallet (subtract)
  UPDATE wallets 
  SET 
    balance = balance - p_from_amount,
    available_balance = available_balance - p_from_amount,
    updated_at = NOW()
  WHERE id = v_from_wallet_id;
  
  -- Update to wallet (add)
  UPDATE wallets 
  SET 
    balance = balance + p_to_amount,
    available_balance = available_balance + p_to_amount,
    updated_at = NOW()
  WHERE id = v_to_wallet_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    from_wallet_id,
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
    v_from_wallet_id,
    v_to_wallet_id,
    p_transaction_type_id,
    p_status_id,
    p_from_currency_id,
    p_from_amount,
    p_to_amount,
    0,
    'Currency swap transaction',
    jsonb_build_object(
      'exchange_rate', p_exchange_rate,
      'from_currency_id', p_from_currency_id,
      'to_currency_id', p_to_currency_id,
      'swap_type', 'internal'
    )
  );
END;
$$;
