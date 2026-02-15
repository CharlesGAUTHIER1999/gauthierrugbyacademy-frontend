import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const CartContext = createContext(null);

function normalizeCart(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map((it) => ({
            id: Number(it.id),          // cart_item.id
            key: String(it.id),         // stable key

            productId: Number(it.product_id),
            optionId: it.option?.id ?? null,

            name: it.name,
            image: it.image || "/placeholder.jpg",

            quantity: Number(it.quantity || 0),
            price: Number(it.unit_price || 0),
            lineTotal: Number(it.line_total || 0),

            variantTitle: it.variant_title ?? null,
            variantValue: it.variant_value ?? null,
            optionLabel: it.option?.label ?? null,
            size: it.size ?? null,
            deliveryText: it.delivery_text ?? null,
        })),
        count: Number(payload?.count || 0),
        subtotal: Number(payload?.subtotal || 0),
        currency: payload?.currency || "EUR",
    };
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState({
        items: [],
        count: 0,
        subtotal: 0,
        currency: "EUR",
    });

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    async function refetchCart() {
        const token = localStorage.getItem("token");
        if (!token) {
            // pas connecté => panier vide (DB)
            setCart({ items: [], count: 0, subtotal: 0, currency: "EUR" });
            return;
        }

        setLoading(true);
        try {
            const res = await api.get("/cart");
            setCart(normalizeCart(res.data));
        } finally {
            setLoading(false);
        }
    }

    // boot: hydrate depuis DB
    useEffect(() => {
        void refetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function addItem({ productId, optionId = null, quantity = 1 }) {
        await api.post("/cart/items", {
            product_id: productId,
            product_option_id: optionId,
            quantity,
        });
        await refetchCart();
    }

    async function setQty(cartItemId, quantity) {
        await api.patch(`/cart/items/${cartItemId}`, { quantity });
        await refetchCart();
    }

    async function removeItem(cartItemId) {
        await api.delete(`/cart/items/${cartItemId}`);
        await refetchCart();
    }

    /**
     * Clear "optimiste" (front) + refetch (back)
     * - utile après paiement: ton webhook vide la DB, donc refetch => OK
     */
    async function clear() {
        setCart({ items: [], count: 0, subtotal: 0, currency: "EUR" });
        await refetchCart();
    }

    const value = useMemo(
        () => ({
            items: cart.items,
            count: cart.count,
            subtotal: cart.subtotal,
            currency: cart.currency,
            loading,
            isOpen,

            openCart: () => setIsOpen(true),
            closeCart: () => setIsOpen(false),

            refetchCart,
            addItem,
            inc: (item) => setQty(item.id, item.quantity + 1),
            dec: (item) => setQty(item.id, Math.max(1, item.quantity - 1)),
            remove: (item) => removeItem(item.id),
            clear,
        }),
        [cart, loading, isOpen]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
