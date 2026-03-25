import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import api from "../api/axios";

function makeKey(productId, optionId) {
    return `${productId}:${optionId ?? "none"}`;
}

function cartReducer(state, action) {
    switch (action.type) {
        case "INIT":
            return action.payload ?? { items: [] };

        case "ADD_ITEM": {
            const item = action.payload;
            const key = makeKey(item.productId, item.optionId);

            const existing = state.items.find((i) => i.key === key);

            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.key === key
                            ? { ...i, quantity: i.quantity + item.quantity }
                            : i
                    ),
                };
            }

            return {
                ...state,
                items: [
                    ...state.items,
                    {
                        key,
                        cartItemId: item.cartItemId, // id DB
                        productId: item.productId,
                        optionId: item.optionId ?? null,
                        optionLabel: item.optionLabel ?? null,
                        variantValue: item.variantValue ?? null,
                        name: item.name,
                        price: Number(item.price) || 0,
                        image: item.image || "/placeholder.jpg",
                        quantity: item.quantity ?? 1,
                    },
                ],
            };
        }

        case "SET_QTY": {
            const { key, quantity } = action.payload;
            return {
                ...state,
                items: state.items.map((i) =>
                    i.key === key ? { ...i, quantity } : i
                ),
            };
        }

        case "REMOVE":
            return {
                ...state,
                items: state.items.filter((i) => i.key !== action.payload),
            };

        case "CLEAR":
            return { items: [] };

        default:
            return state;
    }
}

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
    const [state, dispatch] = useReducer(cartReducer, { items: [] });
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
            const raw = localStorage.getItem("cart");
            if (raw) {
                dispatch({
                    type: "INIT",
                    payload: { items: JSON.parse(raw) },
                });
            }
        } catch (e) {
            console.warn("Failed to load cart:", e);
        } finally {
            setHydrated(true);
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
            items: state.items,
            count,
            subtotal,
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