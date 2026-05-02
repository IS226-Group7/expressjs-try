import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerOverlay({ onScanSuccess, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 20,
      qrbox: { width: 250, height: 250 }, // Square for QR
      aspectRatio: 1.0,
    });

    scanner.render(
      (text) => {
        if (window.navigator.vibrate) window.navigator.vibrate(100);
        onScanSuccess(text);
        scanner.clear();
      },
      () => {} // Ignore frame-by-frame errors
    );

    return () => {
      scanner.clear().catch(() => {}); // Ensure camera releases
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-between p-6">
      <div className="w-full flex justify-between items-center text-white">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Scanner / Active</h2>
        <button onClick={onClose} className="bg-gray-900 border border-gray-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Exit</button>
      </div>
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
        <div id="reader"></div>
      </div>
      <div className="pb-10 text-center">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Center QR code in frame</p>
      </div>
    </div>
  );
}