import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        // Logic when a QR is found
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        // Standard scanning noise, we can ignore
      }
    );

    return () => scanner.clear();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Scan Asset QR</h2>
      <div id="reader" className="overflow-hidden rounded-xl border-2 border-dashed border-gray-300"></div>
    </div>
  );
};

export default Scanner;