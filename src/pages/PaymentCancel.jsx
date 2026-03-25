// src/pages/PaymentCancel.jsx
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function PaymentCancel() {
    const location = useLocation();
    const { refetchCart } = useCart();

    const params = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    );

    const redirectStatus = params.get("redirect_status");
    const paymentIntent = params.get("payment_intent");

    const isDev = import.meta.env.DEV;

    useEffect(() => {
        // ✅ resync panier depuis DB (utile si Stripe a redirigé après un abandon)
        void refetchCart();
    }, [refetchCart]);

    return (
        <div className="pay-result">
            <h1>Paiement annulé ❌</h1>
            <p>Aucun montant n’a été débité. Vous pouvez réessayer quand vous voulez.</p>

            {(redirectStatus || (isDev && paymentIntent)) && (
                <div className="pay-result-box">
                    {redirectStatus && (
                        <p>
                            Statut : <strong>{redirectStatus}</strong>
                        </p>
                    )}

                    {/* ✅ PaymentIntent seulement en DEV */}
                    {isDev && paymentIntent && (
                        <p style={{ wordBreak: "break-word" }}>
                            PaymentIntent : <strong>{paymentIntent}</strong>
                        </p>
                    )}
                </div>
            )}

            <div className="pay-result-actions">
                <Link to="/checkout" className="btn">
                    Revenir au paiement
                </Link>
                <Link to="/cart" className="btn btn-outline">
                    Retour panier
                </Link>
            </div>
        </div>
    );
}