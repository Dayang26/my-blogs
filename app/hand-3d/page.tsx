'use client';

import { useEffect } from 'react';

export default function Hand3DRedirect() {
  useEffect(() => {
    window.location.href = '/labs/hand-tracking';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-sm">Redirecting...</p>
      <meta httpEquiv="refresh" content="0;url=/labs/hand-tracking" />
    </div>
  );
}