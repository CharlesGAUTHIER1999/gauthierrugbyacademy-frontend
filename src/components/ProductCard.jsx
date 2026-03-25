import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProductCard({ product }) {
    const [hover, setHover] = useState(false);

    const imgSrc =
        hover && product.hover_image
            ? product.hover_image
            : product.main_image || "/placeholder.jpg";

    return (
        <article
            className="product-card"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <Link to={`/products/${product.slug}`} className="product-card-media">
                <img src={imgSrc} alt={product.name} loading="lazy" />
            </Link>

            <div className="product-card-info">
                <p className="product-card-name">{product.name}</p>

                {product?.sizes_preview?.length > 0 && (
                    <p className="product-card-sizes">{product.sizes_preview.join(" • ")}</p>
                )}

                <p className="product-card-price">
                    {Number(product.price_ttc).toFixed(2)} €
                </p>
            </div>
        </article>
    );
}