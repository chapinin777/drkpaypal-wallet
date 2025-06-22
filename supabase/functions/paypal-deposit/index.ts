
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalDepositRequest {
  amount: number;
  userId: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const getPayPalAccessToken = async (): Promise<string> => {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
};

const createPayPalOrder = async (amount: number, accessToken: string) => {
  const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
          description: 'Wallet Deposit',
        },
      ],
      application_context: {
        return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paypal-deposit-success`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paypal-deposit-cancel`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create PayPal order');
  }

  return await response.json();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, userId }: PayPalDepositRequest = await req.json();

    console.log('Processing PayPal deposit:', { amount, userId });

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!userId) {
      throw new Error('User ID required');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Create PayPal order
    const order = await createPayPalOrder(amount, accessToken);
    
    // Get approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
    
    if (!approvalUrl) {
      throw new Error('Failed to get PayPal approval URL');
    }

    // Store pending transaction in database
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (wallet) {
      await supabase
        .from('transactions')
        .insert({
          amount: amount,
          transaction_type_id: '1', // Deposit type
          status_id: '1', // Pending status
          to_wallet_id: wallet.id,
          description: `PayPal deposit - Order ID: ${order.id}`,
          external_reference: order.id,
          metadata: { paypal_order: order }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        approvalUrl: approvalUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('PayPal deposit error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
