import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import Footer from "../components/Footer.jsx";
import { Link } from "react-router-dom";
import api from "../api/axios";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutPayment from "../components/CheckoutPayment.jsx";

const COUNTRIES = [{ code: "FR", label: "France" }];
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
    const { items, subtotal } = useCart();

    const [form, setForm] = useState({
        email: "",
        country: "FR",
        firstname: "",
        lastname: "",
        company: "",
        address: "",
        address2: "",
        zip: "",
        city: "",
        phone: "",
        shippingMethod: "standard",
    });

    const [clientSecret, setClientSecret] = useState(null);
    const [loadingIntent, setLoadingIntent] = useState(false);
    const [intentError, setIntentError] = useState(null);

    const shippingCost = useMemo(() => (subtotal >= 50 ? 0 : 3.9), [subtotal]);
    const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

    function update(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));

        if (
            clientSecret &&
            ["address", "zip", "city", "country", "firstname", "lastname"].includes(key)
        ) {
            setClientSecret(null);
        }
    }

    const canCreateIntent = useMemo(() => {
        if (items.length === 0) return false;
        if (!form.email) return false;
        if (!form.firstname || !form.lastname) return false;
        if (!form.address || !form.zip || !form.city || !form.country) return false;
        return true;
    }, [items.length, form]);

    async function createIntent() {
        setLoadingIntent(true);
        setIntentError(null);

        try {
            const payload = {
                shipping: {
                    firstname: form.firstname,
                    lastname: form.lastname,
                    address: form.address,
                    zip: form.zip,
                    city: form.city,
                    country: form.country,
                    phone: form.phone || null,
                },
            };

            const res = await api.post("/payment/intent", payload);
            setClientSecret(String(res.data.client_secret));
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "Erreur lors de la création du paiement.";
            setIntentError(msg);
            setClientSecret(null);
        } finally {
            setLoadingIntent(false);
        }
    }

    const elementsOptions = useMemo(() => {
        if (!clientSecret) return null;
        return {
            clientSecret,
            appearance: { theme: "stripe" },
        };
    }, [clientSecret]);

    return (
        <>
            <div className="checkout">
                <div className="checkout-shell">
                    <section className="checkout-left">
                        <form
                            className="checkout-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!clientSecret) createIntent();
                            }}
                        >
                            <div className="ck-block">
                                <div className="ck-block-head">
                                    <h2>Contact</h2>
                                    <Link to="/login" className="ck-link">
                                        Se connecter
                                    </Link>
                                </div>

                                <div className="ck-field">
                                    <label className="ck-label" htmlFor="email">
                                        Adresse e-mail
                                    </label>
                                    <input
                                        id="email"
                                        className="ck-input"
                                        type="email"
                                        placeholder="Adresse e-mail"
                                        value={form.email}
                                        onChange={(e) => update("email", e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="ck-block">
                                <div className="ck-block-head">
                                    <h2>Livraison</h2>
                                </div>

                                <div className="ck-grid">
                                    <div className="ck-field ck-col-12">
                                        <label className="ck-label" htmlFor="country">
                                            Pays/région
                                        </label>
                                        <select
                                            id="country"
                                            className="ck-input"
                                            value={form.country}
                                            onChange={(e) => update("country", e.target.value)}
                                            required
                                        >
                                            {COUNTRIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ck-field ck-col-6">
                                        <label className="ck-label" htmlFor="firstname">
                                            Prénom
                                        </label>
                                        <input
                                            id="firstname"
                                            className="ck-input"
                                            type="text"
                                            placeholder="Prénom"
                                            value={form.firstname}
                                            onChange={(e) => update("firstname", e.target.value)}
                                            required
                                            autoComplete="given-name"
                                        />
                                    </div>

                                    <div className="ck-field ck-col-6">
                                        <label className="ck-label" htmlFor="lastname">
                                            Nom
                                        </label>
                                        <input
                                            id="lastname"
                                            className="ck-input"
                                            type="text"
                                            placeholder="Nom"
                                            value={form.lastname}
                                            onChange={(e) => update("lastname", e.target.value)}
                                            required
                                            autoComplete="family-name"
                                        />
                                    </div>

                                    <div className="ck-field ck-col-12">
                                        <label className="ck-label" htmlFor="company">
                                            Entreprise (optionnel)
                                        </label>
                                        <input
                                            id="company"
                                            className="ck-input"
                                            type="text"
                                            placeholder="Entreprise (optionnel)"
                                            value={form.company}
                                            onChange={(e) => update("company", e.target.value)}
                                            autoComplete="organization"
                                        />
                                    </div>

                                    <div className="ck-field ck-col-12">
                                        <label className="ck-label" htmlFor="address">
                                            Adresse
                                        </label>
                                        <input
                                            id="address"
                                            className="ck-input"
                                            type="text"
                                            placeholder="Adresse"
                                            value={form.address}
                                            onChange={(e) => update("address", e.target.value)}
                                            required
                                            autoComplete="street-address"
                                        />
                                    </div>

                                    <div className="ck-field ck-col-12">
                                        <label className="ck-label" htmlFor="address2">
                                            Appartement, suite, etc. (optionnel)
                                        </label>
                                        <input
                                            id="address2"
                                            className="ck-input"
                                            type="text"
                                            placeholder="Appartement, suite, etc. (optionnel)"
                                            value={form.address2}
                                            onChange={(e) => update("address2", e.target.value)}
                                        />
                                    </div>

                                    <div className="ck-field ck-col-6">
                                        <label className="ck-label" htmlFor="zip">
                                            Code postal
                                        </label>
                                        <input
                                            id="zip"
                                            className="ck-input"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Code postal"
                                            value={form.zip}
                                            onChange={(e) => update("zip", e.target.value)}
                                            required
                                            autoComplete="postal-code"
                                        />
                                    </div>

                                    <div className="ck-field ck-col-6">
                                        <label className="ck-label" htmlFor="city">
                                            Ville
                                        </label>
                                        <input
                                            id="city"
                                            className="ck-input"
                                            type="text"
                                            placeholder="Ville"
                                            value={form.city}
                                            onChange={(e) => update("city", e.target.value)}
                                            required
                                            autoComplete="address-level2"
                                        />
                                    </div>

                                    <div className="ck-field ck-col-12">
                                        <label className="ck-label" htmlFor="phone">
                                            Téléphone (optionnel)
                                        </label>
                                        <input
                                            id="phone"
                                            className="ck-input"
                                            type="tel"
                                            placeholder="Téléphone (optionnel)"
                                            value={form.phone}
                                            onChange={(e) => update("phone", e.target.value)}
                                            autoComplete="tel"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="ck-block">
                                <div className="ck-block-head">
                                    <h2>Mode d'expédition</h2>
                                </div>

                                <div className="ck-radio-card">
                                    <label className="ck-radio">
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            value="standard"
                                            checked={form.shippingMethod === "standard"}
                                            onChange={(e) => update("shippingMethod", e.target.value)}
                                        />
                                        <span className="ck-radio-label">
                                            Livraison
                                            <span className="ck-radio-price">
                                                {shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(2)} €`}
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="ck-block">
                                <div className="ck-block-head">
                                    <h2>Paiement</h2>
                                </div>

                                <p className="ck-muted">Toutes les transactions sont sécurisées et chiffrées.</p>

                                {intentError && <div className="ck-error">{intentError}</div>}

                                {!clientSecret ? (
                                    <button
                                        className="ck-submit"
                                        type="submit"
                                        disabled={!canCreateIntent || loadingIntent}
                                    >
                                        {loadingIntent ? "Préparation du paiement..." : "Continuer vers le paiement"}
                                    </button>
                                ) : (
                                    elementsOptions && (
                                        <Elements stripe={stripePromise} options={elementsOptions}>
                                            <CheckoutPayment email={form.email} clientSecret={clientSecret} />
                                        </Elements>
                                    )
                                )}

                                {items.length === 0 && (
                                    <p className="ck-muted" style={{ marginTop: 10 }}>
                                        Ton panier est vide.
                                    </p>
                                )}
                            </div>
                        </form>
                    </section>

                    <aside className="checkout-right" aria-label="récapitulatif commande">
                        <div className="ck-summary">
                            <div className="ck-summary-items">
                                {items.map((it) => (
                                    <div key={it.key} className="ck-summary-item">
                                        <div className="ck-summary-img">
                                            <img src={it.image} alt={it.name} />
                                            <span className="ck-summary-qty">{it.quantity}</span>
                                        </div>

                                        <div className="ck-summary-info">
                                            <div className="ck-summary-name">{it.name}</div>
                                            <div className="ck-summary-meta">
                                                {it.variantTitle && it.variantValue ? `${it.variantValue}` : null}
                                                {it.optionLabel ? ` • ${it.optionLabel}` : null}
                                            </div>
                                        </div>

                                        <div className="ck-summary-price">
                                            {(Number(it.price) * Number(it.quantity)).toFixed(2)} €
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="ck-summary-row">
                                <span>Sous-total</span>
                                <span>{Number(subtotal).toFixed(2)} €</span>
                            </div>
                            <div className="ck-summary-row">
                                <span>Expédition</span>
                                <span>{shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(2)} €`}</span>
                            </div>

                            <div className="ck-summary-total">
                                <span>Total</span>
                                <span>{total.toFixed(2)} €</span>
                            </div>

                            <div className="ck-muted" style={{ marginTop: 8 }}>
                                Taxes incluses.
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <Footer />
        </>
    );
}
