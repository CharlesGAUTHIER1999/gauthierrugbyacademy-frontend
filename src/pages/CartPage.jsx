import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
    const navigate = useNavigate();
    const { items, subtotal, inc, dec, remove } = useCart();

    const shippingCost = useMemo(() => (subtotal >= 50 ? 0 : 3.9), [subtotal]);
    const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

    if (items.length === 0) {
        return (
            <div className="p-6">
                <h1>Votre panier</h1>
                <p>Votre panier est vide.</p>
                <Link to="/products">Continuer vos achats</Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1>Votre panier</h1>

            {items.map((it) => (
                <div key={it.key} className="cart-row">
                    <img src={it.image} alt={it.name} />

                    <div>
                        <strong>{it.name}</strong>
                        {it.variantValue && <div>{it.variantValue}</div>}
                        {it.optionLabel && <div>{it.optionLabel}</div>}
                    </div>

                    <div>
                        <button onClick={() => dec(it)}>–</button>
                        <span>{it.quantity}</span>
                        <button onClick={() => inc(it)}>+</button>
                    </div>

                    <div>{(it.price * it.quantity).toFixed(2)} €</div>

                    <button onClick={() => remove(it)}>Supprimer</button>
                </div>
            ))}

            <hr />

            <div>Sous-total : {subtotal.toFixed(2)} €</div>
            <div>Livraison : {shippingCost === 0 ? "Gratuite" : `${shippingCost} €`}</div>
            <strong>Total : {total.toFixed(2)} €</strong>

            <button onClick={() => navigate("/checkout")}>
                Passer au paiement
            </button>
        </div>
    );
}
