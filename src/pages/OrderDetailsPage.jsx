import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { formatPriceEUR, formatDateTimeFR, statusLabel } from "../utils/orderUtils";

export default function OrderDetailsPage() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                if (!mounted) return;
                setOrder(res.data || null);
            } catch (e) {
                if (!mounted) return;
                setErr(e?.response?.data?.message || "Impossible de charger la commande.");
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    const shipment = order?.shipment;
    const payment = order?.payment;

    const items = useMemo(() => {
        const raw = order?.items || [];
        return Array.isArray(raw) ? raw : [];
    }, [order]);

    return (
        <div className="pay-result">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h1>Détails de la commande</h1>
                <Link className="ck-link" to="/account/orders">Retour</Link>
            </div>

            <div className="pay-result-box">
                {loading ? (
                    <p className="ck-muted">Chargement…</p>
                ) : err ? (
                    <div className="ck-error">{err}</div>
                ) : !order ? (
                    <p className="ck-muted">Commande introuvable.</p>
                ) : (
                    <>
                        <div className="ck-muted" style={{ marginBottom: 14 }}>
                            Référence <strong>#{order.id}</strong> — placée le{" "}
                            <strong>{formatDateTimeFR(order.created_at)}</strong> — statut{" "}
                            <strong>{statusLabel(order.order_status)}</strong>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                                <div style={{ fontWeight: 650, marginBottom: 8 }}>Adresse de livraison</div>
                                <div className="ck-muted" style={{ lineHeight: 1.5 }}>
                                    <div>{shipment?.firstname} {shipment?.lastname}</div>
                                    <div>{shipment?.address}</div>
                                    <div>{shipment?.zip} {shipment?.city}</div>
                                    <div>{shipment?.country}</div>
                                </div>
                            </div>

                            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                                <div style={{ fontWeight: 650, marginBottom: 8 }}>Adresse de facturation</div>
                                <div className="ck-muted" style={{ lineHeight: 1.5 }}>
                                    <div>{shipment?.firstname} {shipment?.lastname}</div>
                                    <div>{shipment?.address}</div>
                                    <div>{shipment?.zip} {shipment?.city}</div>
                                    <div>{shipment?.country}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 12 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                                <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                                    <th style={{ padding: "10px 12px" }}>Produit</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Prix</th>
                                    <th style={{ padding: "10px 12px", textAlign: "center" }}>Quantité</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((it) => {
                                    const name = it?.product?.name || "Produit";
                                    const qty = Number(it?.quantity || 0);
                                    const unit = Number(it?.unit_price || 0);
                                    const line = Number(it?.total || unit * qty);
                                    const optLabel = it?.option?.label ? ` • ${it.option.label}` : "";

                                    return (
                                        <tr key={it.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                                            <td style={{ padding: "12px" }}>
                                                <div style={{ fontWeight: 650 }}>{name}{optLabel}</div>
                                                {it?.product?.slug && (
                                                    <div className="ck-muted" style={{ marginTop: 4 }}>
                                                        <Link className="ck-link" to={`/products/${it.product.slug}`}>
                                                            Voir le produit
                                                        </Link>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right", fontWeight: 650 }}>
                                                {formatPriceEUR(unit)}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "center" }}>{qty}</td>
                                            <td style={{ padding: "12px", textAlign: "right", fontWeight: 650 }}>
                                                {formatPriceEUR(line)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                                <div style={{ fontWeight: 650, marginBottom: 10 }}>Détails de la commande</div>
                                <div style={{ display: "grid", gap: 8 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <span className="ck-muted">Transporteur</span>
                                        <span style={{ fontWeight: 650 }}>{shipment?.carrier || "—"}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <span className="ck-muted">Paiement</span>
                                        <span style={{ fontWeight: 650 }}>{payment?.provider || "stripe"}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <span className="ck-muted">Statut paiement</span>
                                        <span style={{ fontWeight: 650 }}>{payment?.status || order.payment_status}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                                <div style={{ fontWeight: 650, marginBottom: 10 }}>Total</div>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <span className="ck-muted">Total TTC</span>
                                    <span style={{ fontWeight: 750, fontSize: 18 }}>
                                        {formatPriceEUR(order.total_ttc)}
                                    </span>
                                </div>
                                <div className="ck-muted" style={{ marginTop: 8 }}>Taxes incluses.</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}