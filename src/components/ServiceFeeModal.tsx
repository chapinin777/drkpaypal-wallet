import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ServiceFeeModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const ServiceFeeModal = ({ onClose, onConfirm }: ServiceFeeModalProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const usdtAddress = "TBMWwcYaAf4m8ug5GbHwwAV-DaskwQX1RWL"; // TRC20 Address
  const binanceID = "713568475"; // Binance Pay ID

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-slate-800 border-slate-600 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
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
        
        <CardContent className="space-y-6">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-white font-semibold mb-2">Why is this fee required?</h3>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>• Network gas fees for blockchain transactions</li>
              <li>• Security verification and KYC processing</li>
              <li>• Anti-fraud protection measures</li>
              <li>• Infrastructure and maintenance costs</li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-blue-500/30">
              <h3 className="text-white text-lg font-semibold mb-2">Send 20 USDT (TRC20)</h3>
              <p className="text-gray-300 text-sm mb-4">
                Send exactly 20 USDT via <strong>Binance Pay</strong> or to the address below to activate withdrawals:
              </p>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-600 space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">USDT TRC20 Address:</p>
                  <div className="flex items-center justify-between">
                    <code className="text-blue-400 text-sm font-mono break-all">{usdtAddress}</code>
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

                <div>
                  <p className="text-gray-400 text-xs mb-1">Binance Pay ID:</p>
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 text-sm font-mono break-all">{binanceID}</code>
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
              </div>

              <div className="text-xs text-gray-500 pt-2">
                ⚠️ Only send USDT on the TRC20 network. Other networks may result in permanent loss.
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-300 text-sm">
              <strong>Important:</strong> This is a one-time setup fee. Once verified, future withdrawals will only incur network charges.
            </p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-11 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 h-11 blue-gradient hover:scale-105 transition-all duration-300 text-white font-semibold"
            >
              I've Sent Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceFeeModal;
