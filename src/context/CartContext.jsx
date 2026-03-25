import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import api from "../api/axios";

const CartContext = createContext(null);

function normalizeCart(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map((it) => ({
            id: Number(it.id),
            key: String(it.id),

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

    const openCart = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeCart = useCallback(() => {
        setIsOpen(false);
    }, []);

    const refetchCart = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
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
    }, []);

    useEffect(() => {
        void refetchCart();
    }, [refetchCart]);

    const addItem = useCallback(async ({ productId, optionId = null, quantity = 1 }) => {
        await api.post("/cart/items", {
            product_id: productId,
            product_option_id: optionId,
            quantity,
        });

        await refetchCart();
    }, [refetchCart]);

    const setQty = useCallback(async (cartItemId, quantity) => {
        await api.patch(`/cart/items/${cartItemId}`, { quantity });
        await refetchCart();
    }, [refetchCart]);

    const removeItem = useCallback(async (cartItemId) => {
        await api.delete(`/cart/items/${cartItemId}`);
        await refetchCart();
    }, [refetchCart]);

    const clear = useCallback(async () => {
        setCart({ items: [], count: 0, subtotal: 0, currency: "EUR" });
        await refetchCart();
    }, [refetchCart]);

    const value = useMemo(
        () => ({
            items: cart.items,
            count: cart.count,
            subtotal: cart.subtotal,
            currency: cart.currency,
            loading,
            isOpen,

            openCart,
            closeCart,

            refetchCart,
            addItem,
            inc: (item) => setQty(item.id, item.quantity + 1),
            dec: (item) => setQty(item.id, Math.max(1, item.quantity - 1)),
            remove: (item) => removeItem(item.id),
            clear,
        }),
        [
            cart,
            loading,
            isOpen,
            openCart,
            closeCart,
            refetchCart,
            addItem,
            setQty,
            removeItem,
            clear,
        ]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);

    if (!ctx) {
        throw new Error("useCart must be used within CartProvider");
    }

    return ctx;
}