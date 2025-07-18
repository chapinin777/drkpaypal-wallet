import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const { serviceFeeId } = await req.json();
    
    if (!serviceFeeId) {
      throw new Error('Service fee ID is required');
    }

    // Get the service fee details
    const { data: serviceFee, error: serviceFeeError } = await supabaseClient
      .from('service_fees')
      .select('*')
      .eq('id', serviceFeeId)
      .eq('is_active', true)
      .single();

    if (serviceFeeError || !serviceFee) {
      throw new Error('Invalid service fee plan');
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseClient
      .from('user_plan_subscriptions')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existingSubscription) {
      // Deactivate existing subscription
      await supabaseClient
        .from('user_plan_subscriptions')
        .update({ is_active: false })
        .eq('id', existingSubscription.id);
    }

    // Create new subscription
    const { error: subscriptionError } = await supabaseClient
      .from('user_plan_subscriptions')
      .insert({
        user_id: userData.user.id,
        service_fee_id: serviceFeeId,
        is_active: true,
        next_deposit_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      });

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Process immediate first deposit
    const { data: currencies } = await supabaseClient
      .from('currencies')
      .select('id')
      .eq('code', 'USD')
      .single();

    const { data: statuses } = await supabaseClient
      .from('transaction_statuses')
      .select('id')
      .eq('code', 'completed')
      .single();

    const { data: types } = await supabaseClient
      .from('transaction_types')
      .select('id')
      .eq('code', 'deposit')
      .single();

    // Get or create user's USD wallet
    let { data: wallet } = await supabaseClient
      .from('wallets')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('currency_id', currencies.id)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: walletError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: userData.user.id,
          currency_id: currencies.id,
          wallet_address: `wallet_${userData.user.id.substring(0, 8)}`,
          balance: 0
        })
        .select('id')
        .single();

      if (walletError) throw walletError;
      wallet = newWallet;
    }

    // Add initial deposit to wallet
    await supabaseClient
      .from('wallets')
      .update({ 
        balance: serviceFee.account_balance 
      })
      .eq('id', wallet.id);

    // Create transaction record
    await supabaseClient
      .from('transactions')
      .insert({
        to_wallet_id: wallet.id,
        transaction_type_id: types.id,
        status_id: statuses.id,
        currency_id: currencies.id,
        amount: serviceFee.account_balance,
        net_amount: serviceFee.account_balance,
        fee: 0,
        description: 'Initial deposit from subscription plan',
        metadata: {
          subscription_plan: true,
          plan_fee: serviceFee.fee_amount,
          initial_deposit: true
        }
      });

    // Send notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userData.user.id,
        type: 'deposit',
        title: 'Plan Subscription Activated',
        message: `You've subscribed to the $${serviceFee.fee_amount} plan. Your first deposit of $${serviceFee.account_balance} has been added to your account.`
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed to plan',
        plan: serviceFee,
        next_deposit: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error subscribing to plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});