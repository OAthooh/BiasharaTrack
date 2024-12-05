import React, { useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';


interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("reader");
      setScanning(true);
      setError(null);

      const qrCodeSuccessCallback = (decodedText: string) => {
        onBarcodeDetected(decodedText);
        html5QrCode.stop();
        setScanning(false);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
        ]
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        undefined
      );
    } catch (err) {
      setError('Failed to start camera. Please ensure you have given camera permissions.');
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div id="reader" className={scanning ? "w-full max-w-[300px] h-[300px]" : "hidden"} />
      
      <button
        onClick={startScanning}
        disabled={scanning}
        className="md:hidden px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {scanning ? 'Scanning...' : 'Scan Barcode'}
      </button>
    </div>
  );
};
