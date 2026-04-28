'use client';

import { useState } from 'react';
import { Check, Plus, Loader2 } from 'lucide-react';

interface Addon {
  id: string;
  key: string;
  name: string;
  description: string | null;
  price_cents: number;
  billing_type: 'one_time' | 'monthly';
  isActive: boolean;
}

function formatPrice(cents: number, billingType: string) {
  const dollars = (cents / 100).toFixed(0);
  return billingType === 'monthly' ? `$${dollars}/mo` : `$${dollars}`;
}

export function AddonsGrid({ addons }: { addons: Addon[] }) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(
    new Set(addons.filter((a) => a.isActive).map((a) => a.key))
  );
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async (addonKey: string) => {
    setLoadingKey(addonKey);
    setMessage(null);

    try {
      const res = await fetch('/api/client/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonKey }),
      });

      const data = await res.json() as { message?: string; error?: string };

      if (res.ok) {
        setActiveKeys((prev) => new Set([...prev, addonKey]));
        setMessage(data.message ?? 'Add-on requested successfully.');
      } else {
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setMessage('Failed to request add-on. Please try again.');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map((addon) => {
          const isActive = activeKeys.has(addon.key);
          const isLoading = loadingKey === addon.key;

          return (
            <div
              key={addon.key}
              className={`relative bg-white rounded-2xl border p-5 space-y-4 transition-all ${
                isActive
                  ? 'border-green-200 shadow-sm shadow-green-50'
                  : 'border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300'
              }`}
            >
              {/* Active badge */}
              {isActive && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <Check className="w-3 h-3" />
                  Active
                </span>
              )}

              <div className="space-y-1 pr-16">
                <h3 className="font-semibold text-neutral-900 text-sm">{addon.name}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed">{addon.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <span className="text-lg font-bold text-neutral-900">
                    {formatPrice(addon.price_cents, addon.billing_type)}
                  </span>
                  <span className="text-xs text-neutral-400 ml-1">
                    {addon.billing_type === 'monthly' ? 'per month' : 'one-time'}
                  </span>
                </div>

                {!isActive && (
                  <button
                    onClick={() => handleAdd(addon.key)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
