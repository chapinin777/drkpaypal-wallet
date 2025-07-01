
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  address: string;
  amount?: number;
  currency?: string;
}

const QRCodeDisplay = ({ address, amount, currency = 'USD' }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const qrData = amount 
        ? JSON.stringify({ address, amount, currency })
        : JSON.stringify({ address, currency });
      
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#1a1a2e'
        }
      });
    }
  }, [address, amount, currency]);

  return (
    <div className="flex justify-center p-4 glass-light rounded-lg">
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  );
};

export default QRCodeDisplay;
