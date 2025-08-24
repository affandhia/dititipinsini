'use client';

import { Loader2, Zap, Globe, Calculator } from 'lucide-react';

interface LoadingScreenProps {
  error?: Error | null;
}

export function LoadingScreen({ error }: LoadingScreenProps) {
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-md space-y-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {'Oops! Something went wrong'}
            </h2>
            <p className="mb-4 text-gray-600">
              {
                "We couldn't load the application. Please try refreshing the page."
              }
            </p>
            <p className="rounded bg-gray-100 p-2 font-mono text-sm text-gray-500">
              {error.message}
            </p>
          </div>
          <button
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            {'Refresh Page'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-8 p-8 text-center">
        {/* Logo Area */}
        <div className="relative">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <Calculator className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 opacity-20 blur"></div>
        </div>

        {/* App Title */}
        <div className="space-y-2">
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
            {'Cross-Border Calculator'}
          </h1>
          <p className="text-lg text-gray-600">
            {'Professional personal shopper cost calculator'}
          </p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="font-medium text-gray-700">
              {'Loading application...'}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-3 text-sm">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">{'Loading translations'}</span>
            </div>

            {/* Progress Bar */}
            <div className="mx-auto w-64">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mx-auto grid max-w-md grid-cols-3 gap-4 text-center text-sm text-gray-500">
          <div className="space-y-2">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Calculator className="h-4 w-4 text-blue-600" />
            </div>
            <span>{'Multi-currency'}</span>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <Zap className="h-4 w-4 text-indigo-600" />
            </div>
            <span>{'Real-time rates'}</span>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
              <Globe className="h-4 w-4 text-purple-600" />
            </div>
            <span>{'Global support'}</span>
          </div>
        </div>

        {/* Loading Tips */}
        <div className="mx-auto max-w-sm text-xs text-gray-400">
          <p>
            {
              '💡 Tip: You can bookmark this page for quick access to your calculations'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
