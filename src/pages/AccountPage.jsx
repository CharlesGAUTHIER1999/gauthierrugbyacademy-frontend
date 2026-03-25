import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { formatPriceEUR, formatDateFR, statusLabel } from "../utils/orderUtils";

export default function AccountPage() {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await api.get("/orders");
                if (!mounted) return;
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch {
                if (!mounted) return;
                setOrders([]);
            } finally {
                setLoadingOrders(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const latest = orders.slice(0, 3);

    return (
        <div className="pay-result">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h1>Compte</h1>
                <button className="ck-link" type="button" onClick={logout}>
                    Déconnexion
                </button>
            </div>

            <div className="pay-result-box" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                        <h2 style={{ fontSize: 18, margin: 0 }}>Historique des commandes</h2>
                        <Link className="ck-link" to="/account/orders">
                            Voir tout
                        </Link>
                    </div>

                    {loadingOrders ? (
                        <p className="ck-muted" style={{ marginTop: 6 }}>Chargement…</p>
                    ) : orders.length === 0 ? (
                        <p className="ck-muted" style={{ marginTop: 6 }}>
                            Vous n’avez encore passé aucune commande.
                        </p>
                    ) : (
                        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                            {latest.map((o) => (
                                <Link
                                    key={o.id}
                                    to={`/account/orders/${o.id}`}
                                    style={{
                                        textDecoration: "none",
                                        border: "1px solid #eee",
                                        borderRadius: 12,
                                        padding: 12,
                                        color: "#111",
                                        display: "grid",
                                        gap: 6,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <div style={{ fontWeight: 650 }}>Commande #{o.id}</div>
                                        <div style={{ fontWeight: 650 }}>{formatPriceEUR(o.total_ttc)}</div>
                                    </div>
                                    <div className="ck-muted" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <span>{formatDateFR(o.created_at)}</span>
                                        <span>{statusLabel(o.order_status)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{ fontSize: 18, margin: 0 }}>Détails du compte</h2>
                    <div className="ck-muted" style={{ marginTop: 6 }}>
                        {user?.country || "France"}
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <Link className="ck-link" to="/account/addresses">
                            Voir les adresses (1)
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
