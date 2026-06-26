"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

/**
 * MOTO card entry. The CardElement is a Stripe-hosted iframe — the raw card
 * number never touches our code or server. On submit we confirm the SetupIntent,
 * then hand the resulting payment_method id to /api/admin/attach-payment to start
 * the subscription.
 */
function CardForm({
  clientId,
  clientSecret,
  planId,
  onDone,
}: {
  clientId: string;
  clientSecret: string;
  planId?: string;
  onDone: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    setLoading(true);
    setError(null);
    try {
      const result = await stripe.confirmCardSetup(clientSecret, { payment_method: { card } });
      if (result.error) throw new Error(result.error.message ?? "Card setup failed");
      const pmId = result.setupIntent?.payment_method;
      if (!pmId || typeof pmId !== "string") throw new Error("No payment method returned");

      const res = await fetch("/api/admin/attach-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, paymentMethodId: pmId, planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start subscription");
      setDone(true);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Card error");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
        <CheckCircle className="w-4 h-4" /> Card saved and subscription started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="px-3 py-3 border border-neutral-200 rounded-xl bg-white">
        <CardElement options={{ style: { base: { fontSize: "15px", color: "#171717" } } }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={submit}
        disabled={loading || !stripe}
        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        Save card & start subscription
      </button>
      <p className="text-xs text-neutral-400">
        Card details are entered into Stripe&apos;s secure field — they never touch this server.
      </p>
    </div>
  );
}

export function AdminCardEntry(props: {
  clientId: string;
  clientSecret: string;
  publishableKey: string;
  planId?: string;
  onDone: () => void;
}) {
  const stripePromise = loadStripe(props.publishableKey);
  return (
    <Elements stripe={stripePromise}>
      <CardForm clientId={props.clientId} clientSecret={props.clientSecret} planId={props.planId} onDone={props.onDone} />
    </Elements>
  );
}
