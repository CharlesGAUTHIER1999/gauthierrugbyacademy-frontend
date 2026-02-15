import { useMemo, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
    const navigate = useNavigate();
    const { isOpen, closeCart, items, subtotal, inc, dec, remove } = useCart();

    const drawerRef = useRef(null);
    const closeBtnRef = useRef(null);

    const FREE_SHIPPING_THRESHOLD = 70;

    const freeShip = useMemo(() => {
        const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
        const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
        const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;
        return { remaining, progress, isFree };
    }, [subtotal]);

    return (
        <>
            <div
                className={`cart-overlay ${isOpen ? "is-open" : ""}`}
                onClick={closeCart}
            />

            <aside
                ref={drawerRef}
                className={`cart-drawer ${isOpen ? "is-open" : ""}`}
                aria-hidden={!isOpen}
            >
                <div className="cart-drawer-header">
                    <h3>Votre panier</h3>
                    <button ref={closeBtnRef} className="cart-close" onClick={closeCart} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <div className="cart-free-ship">
                    <div className="cart-free-ship-row">
                        <span className="cart-free-ship-icon" aria-hidden="true">
                            {freeShip.isFree ? "✓" : "🚚"}
                        </span>

                        {freeShip.isFree ? (
                            <p className="cart-free-ship-text">Vous avez obtenu la livraison gratuite !</p>
                        ) : (
                            <p className="cart-free-ship-text">
                                Plus que <strong>{freeShip.remaining.toFixed(2)} €</strong> pour la livraison gratuite
                            </p>
                        )}
                    </div>

                    <div className="cart-free-ship-bar" role="progressbar">
                        <div
                            className="cart-free-ship-bar-fill"
                            style={{ width: `${freeShip.progress}%` }}
                        />
                    </div>
                </div>

                <div className="cart-drawer-body">
                    {items.length === 0 ? (
                        <p className="cart-empty">Ton panier est vide.</p>
                    ) : (
                        <ul className="cart-list">
                            {items.map((it) => (
                                <li key={it.key} className="cart-item">
                                    <img className="cart-item-img" src={it.image} alt={it.name} />

                                    <div className="cart-item-main">
                                        <div className="cart-item-top">
                                            <div className="cart-item-title">{it.name}</div>
                                            <div className="cart-item-price">
                                                {(Number(it.price) * Number(it.quantity)).toFixed(2)} €
                                            </div>
                                        </div>

                                        <div className="cart-item-meta">
                                            {it.variantValue && it.variantTitle && (
                                                <div className="cart-item-meta-line">
                                                    {it.variantTitle} : {it.variantValue}
                                                </div>
                                            )}
                                            {it.optionLabel && (
                                                <div className="cart-item-meta-line">
                                                    Option : {it.optionLabel}
                                                </div>
                                            )}
                                        </div>

                                        <div className="cart-item-actions">
                                            <div className="qty">
                                                <button type="button" onClick={() => dec(it)} aria-label="Réduire">
                                                    –
                                                </button>
                                                <span>{it.quantity}</span>
                                                <button type="button" onClick={() => inc(it)} aria-label="Augmenter">
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                className="cart-remove"
                                                type="button"
                                                onClick={() => remove(it)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="cart-drawer-footer">
                    <div className="cart-subtotal">
                        <span>Sous-total</span>
                        <strong>{Number(subtotal).toFixed(2)} €</strong>
                    </div>

                    <button
                        className="cart-cta"
                        disabled={items.length === 0}
                        onClick={() => {
                            closeCart();
                            navigate("/checkout");
                        }}
                    >
                        Procéder au paiement
                    </button>
                </div>
            </aside>
        </>
    );
}
