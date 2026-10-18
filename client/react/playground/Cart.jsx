import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
const key = "gox-demo-cart-v1";
const money = (cents) =>
    (cents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "EUR",
    });
function read(products) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        return Object.fromEntries(
            Object.entries(data).filter(
                ([id, n]) =>
                    products[id] && Number.isInteger(n) && n > 0 && n <= 99,
            ),
        );
    } catch {
        return {};
    }
}
export default function Cart({ slug, catalog }) {
    const products = JSON.parse(catalog);
    const [cart, setCart] = useState({}),
        [ready, setReady] = useState(false),
        [checkout, setCheckout] = useState(false),
        [message, setMessage] = useState(""),
        [receipt, setReceipt] = useState(null),
        [closing, setClosing] = useState(false);
    useEffect(() => {
        if (!receipt) return;
        const timer = setTimeout(() => setClosing(true), 15000);
        return () => clearTimeout(timer);
    }, [receipt]);
    useEffect(() => {
        if (!closing) return;
        const timer = setTimeout(
            () => {
                setReceipt(null);
                setClosing(false);
            },
            matchMedia("(prefers-reduced-motion: reduce)").matches ? 180 : 220,
        );
        return () => clearTimeout(timer);
    }, [closing]);
    const product = products[slug];
    useEffect(() => {
        setCart(read(products));
        setReady(true);
        const sync = () => setCart(read(products));
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);
    function save(value) {
        setCart(value);
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            setMessage(
                "Your browser cannot save the cart; it will remain available during this visit.",
            );
        }
    }
    function change(id, delta) {
        const next = { ...cart },
            count = (next[id] || 0) + delta;
        if (count <= 0) delete next[id];
        else next[id] = Math.min(99, count);
        save(next);
        setCheckout(false);
    }
    const count = Object.values(cart).reduce((a, b) => a + b, 0),
        total = Object.entries(cart).reduce(
            (sum, [id, n]) => sum + products[id].price * n,
            0,
        );
    function pay(event) {
        event.preventDefault();
        if (!count) return;
        const order = "DEMO-" + Date.now().toString(36).toUpperCase();
        setClosing(false);
        setReceipt({ order, total });
        save({});
        setCheckout(false);
        setMessage(
            `Order ${order} confirmed for ${money(total)}. This is a simulation: you have not been charged and no products will be shipped.`,
        );
    }
    return (
        <div className="shop-purchase">
            {product && (
                <>
                    <strong className="shop-price">
                        {money(product.price)}
                    </strong>
                    <button
                        className="button primary"
                        type="button"
                        disabled={!ready}
                        onClick={() => {
                            change(slug, 1);
                            setMessage(`${product.name} added to cart.`);
                        }}
                    >
                        Add to cart
                    </button>
                </>
            )}
            <details className="shop-cart">
                <summary>
                    <svg
                        className="shop-cart-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 3h2l2.4 12h11.2l2-8H6" />
                        <circle cx="9" cy="20" r="1" />
                        <circle cx="18" cy="20" r="1" />
                    </svg>{" "}
                    Your cart ({count})
                </summary>
                {!count ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        <ul>
                            {Object.entries(cart).map(([id, n]) => (
                                <li key={id}>
                                    <a href={"/products/" + id}>
                                        {products[id].name}
                                    </a>
                                    <span>{money(products[id].price * n)}</span>
                                    <div className="shop-quantity">
                                        <button
                                            type="button"
                                            aria-label={
                                                "Remove one unit of " +
                                                products[id].name
                                            }
                                            onClick={() => change(id, -1)}
                                        >
                                            −
                                        </button>
                                        <span>{n}</span>
                                        <button
                                            type="button"
                                            aria-label={
                                                "Add one unit of " +
                                                products[id].name
                                            }
                                            disabled={n >= 99}
                                            onClick={() => change(id, 1)}
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => change(id, -n)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="shop-total">
                            <strong>Total</strong>
                            <strong>{money(total)}</strong>
                        </p>
                        <p className="shop-checkout-note">
                            No shipping or extra fees: this is a demo purchase.
                        </p>
                        <button
                            type="button"
                            className="button primary"
                            onClick={() => setCheckout(true)}
                        >
                            Continue to checkout →
                        </button>
                    </>
                )}
                {checkout && count > 0 && (
                    <form onSubmit={pay} className="shop-checkout">
                        <h3>Confirm your order</h3>
                        <p>
                            {count} items · {money(total)}
                        </p>
                        <p>No personal or card details are needed.</p>
                        <label>
                            <input type="checkbox" required /> I understand this
                            is a simulated purchase.
                        </label>
                        <button type="submit" className="button primary">
                            Confirm demo purchase
                        </button>
                        <button
                            type="button"
                            className="button subtle"
                            onClick={() => setCheckout(false)}
                        >
                            Back to cart
                        </button>
                    </form>
                )}
            </details>
            <small>
                Demo store · no real charges. Your cart is saved in this
                browser.
            </small>
            {message && <p role={receipt ? undefined : "status"}>{message}</p>}
            {receipt &&
                ReactDOM.createPortal(
                    <aside
                        className={`purchase-toast${closing ? " is-closing" : ""}`}
                        aria-label="Purchase confirmation"
                    >
                        <span
                            className="purchase-toast-check"
                            aria-hidden="true"
                        >
                            ✓
                        </span>
                        <div role="status">
                            <strong>Demo purchase confirmed!</strong>
                            <p>
                                Order {receipt.order} · {money(receipt.total)}
                            </p>
                            <small>
                                No payment was taken. Thank you for trying the
                                demo.
                            </small>
                        </div>
                        <button
                            type="button"
                            aria-label="Dismiss purchase notification"
                            onClick={() => setClosing(true)}
                        >
                            ×
                        </button>
                    </aside>,
                    document.body,
                )}
        </div>
    );
}
