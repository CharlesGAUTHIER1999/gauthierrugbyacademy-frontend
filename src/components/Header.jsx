import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import MegaMenu from "./MegaMenu";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../store/auth";

const NAV_ITEMS = [
    { key: "femmes", label: "Femmes" },
    { key: "hommes", label: "Hommes" },
    { key: "nutrition", label: "Nutrition" },
    { key: "equipments", label: "Équipements" },
];

export default function Header() {
    const [openMenu, setOpenMenu] = useState(null);
    const { count, openCart } = useCart();

    const { isAuthenticated, user } = useAuth();
    const profileHref = isAuthenticated ? "/account" : "/login";

    const initials = useMemo(() => {
        const f = user?.firstname?.trim()?.[0];
        const l = user?.lastname?.trim()?.[0];
        return f && l ? `${f}${l}`.toUpperCase() : null;
    }, [user]);

    function closeMenu() {
        setOpenMenu(null);
    }

    return (
        <header className="header">
            <div className="header-inner">
                <Link to="/" className="logo" onClick={closeMenu}>
                    GAUTHIER Fitness
                </Link>

                <nav className="nav">
                    {NAV_ITEMS.map(({ key, label }) => (
                        <div
                            key={key}
                            className="nav-item"
                            onMouseEnter={() => setOpenMenu(key)}
                            onMouseLeave={() => setOpenMenu(null)}
                        >
                            {label}
                            {openMenu === key && <MegaMenu type={key} />}
                        </div>
                    ))}

                    <Link to="/about" className="nav-item" onClick={closeMenu}>
                        À propos
                    </Link>
                </nav>

                <div className="actions">
                    <input
                        type="text"
                        placeholder="Rechercher un produit"
                        className="search"
                    />

                    <Link
                        to={profileHref}
                        className={`icon ${isAuthenticated && initials ? "icon-initials" : ""}`}
                        aria-label="Mon compte"
                        onClick={closeMenu}
                    >
                        {isAuthenticated && initials ? initials : "👤"}
                    </Link>

                    <button
                        type="button"
                        className="cart-icon-btn"
                        onClick={() => {
                            closeMenu();
                            openCart();
                        }}
                        aria-label="Ouvrir le panier"
                    >
                        🛒{count > 0 && <span className="cart-badge">{count}</span>}
                    </button>
                </div>
            </div>
        </header>
    );
}