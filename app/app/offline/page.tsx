'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-gray-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          It looks like you&apos;ve lost your internet connection.
          Some features may not be available until you&apos;re back online.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="
              w-full flex items-center justify-center gap-2
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              text-white font-medium
              px-6 py-4 rounded-lg
              transition-colors
              min-h-[48px] touch-target
            "
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="
              w-full flex items-center justify-center gap-2
              bg-white hover:bg-gray-50 active:bg-gray-100
              text-gray-700 font-medium
              px-6 py-4 rounded-lg
              border border-gray-300
              transition-colors
              min-h-[48px] touch-target
            "
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Helpful Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
          <h2 className="font-medium text-blue-900 mb-2">
            What you can do offline:
          </h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• View previously loaded pages</li>
            <li>• Access cached dashboard data</li>
            <li>• Review saved scenarios</li>
          </ul>
        </div>

        {/* Status */}
        <p className="mt-6 text-xs text-gray-500">
          We&apos;ll automatically reconnect when your network is available.
        </p>
      </div>
    </div>
  );
}
