import { useMemo, useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function CheckoutPayment({ email, clientSecret }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { refetchCart, clear, closeCart } = useCart();

    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState(null);

    const returnUrl = useMemo(() => `${window.location.origin}/payment-success`, []);

    async function afterSuccess(paymentIntentId) {
        // Le webhook vide le panier DB, mais on garde l’UI clean
        try {
            await refetchCart();
            await clear();
            closeCart?.();
        } catch {
            await clear().catch(() => {});
        }

        const qs = new URLSearchParams();
        if (paymentIntentId) qs.set("payment_intent", paymentIntentId);
        qs.set("redirect_status", "succeeded");

        navigate(`/payment-success?${qs.toString()}`, { replace: true });
    }

    async function confirm() {
        if (!stripe || !elements) return;

        setIsPaying(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message || "Vérifie les informations de paiement.");
                setIsPaying(false);
                return;
            }

            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    receipt_email: email || undefined,
                    return_url: returnUrl,
                },
                redirect: "if_required",
            });

            if (confirmError) {
                setError(confirmError.message || "Paiement impossible.");
                setIsPaying(false);
                return;
            }

            // Pas de redirect requis => on est ici
            if (paymentIntent?.status === "succeeded") {
                setIsPaying(false);
                await afterSuccess(paymentIntent.id);
                return;
            }

            // Parfois paymentIntent est null -> retrieve via clientSecret
            if (clientSecret) {
                const { paymentIntent: pi } = await stripe.retrievePaymentIntent(clientSecret);
                if (pi?.status === "succeeded") {
                    setIsPaying(false);
                    await afterSuccess(pi.id);
                    return;
                }
            }

            setIsPaying(false);
        } catch (e) {
            setError(e?.message || "Erreur inattendue pendant le paiement.");
            setIsPaying(false);
        }
    }

    return (
        <div className="ck-payment-box">
            <div className="ck-payment-head">
                <div className="ck-payment-title">Paiement</div>
                <div className="ck-payment-sub">
                    Toutes les transactions sont sécurisées et chiffrées.
                </div>
            </div>

            <div className="ck-payment-element">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>

            {error && (
                <div className="ck-error" role="alert" style={{ marginTop: 10 }}>
                    {error}
                </div>
            )}

            <button
                type="button"
                className="ck-submit"
                onClick={confirm}
                disabled={!stripe || !elements || isPaying}
                style={{ marginTop: 12 }}
            >
                {isPaying ? "Paiement en cours..." : "Payer maintenant"}
            </button>

            <div className="ck-muted" style={{ marginTop: 10 }}>
                Apple Pay / Google Pay s’affichent seulement si l’appareil et la config Stripe le permettent.
            </div>
        </div>
    );
}