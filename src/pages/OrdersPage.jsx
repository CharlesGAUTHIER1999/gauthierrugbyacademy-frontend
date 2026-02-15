import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatPriceEUR, formatDateFR, statusLabel } from "../utils/orderUtils";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await api.get("/orders");
                if (!mounted) return;
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                if (!mounted) return;
                setErr(e?.response?.data?.message || "Impossible de charger vos commandes.");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="pay-result">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h1>Mes commandes</h1>
                <Link className="ck-link" to="/account">Retour compte</Link>
            </div>

            <div className="pay-result-box">
                {loading ? (
                    <p className="ck-muted">Chargement…</p>
                ) : err ? (
                    <div className="ck-error">{err}</div>
                ) : orders.length === 0 ? (
                    <p className="ck-muted">Vous n’avez encore passé aucune commande.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                            <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                                <th style={{ padding: "10px 8px" }}>Référence</th>
                                <th style={{ padding: "10px 8px" }}>Date</th>
                                <th style={{ padding: "10px 8px" }}>Statut</th>
                                <th style={{ padding: "10px 8px", textAlign: "right" }}>Total</th>
                                <th style={{ padding: "10px 8px", textAlign: "right" }}></th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((o) => (
                                <tr key={o.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                                    <td style={{ padding: "12px 8px", fontWeight: 650 }}>#{o.id}</td>
                                    <td style={{ padding: "12px 8px" }}>{formatDateFR(o.created_at)}</td>
                                    <td style={{ padding: "12px 8px" }}>{statusLabel(o.order_status)}</td>
                                    <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 650 }}>
                                        {formatPriceEUR(o.total_ttc)}
                                    </td>
                                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                                        <Link className="ck-link" to={`/account/orders/${o.id}`}>
                                            Détails
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
