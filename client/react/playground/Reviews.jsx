import { useEffect, useState } from "react";
const stars = (n) => (
    <span
        className="rating-stars"
        role="img"
        aria-label={`${n} out of 5 stars`}
    >
        {[1, 2, 3, 4, 5].map((i) => (
            <span
                key={i}
                aria-hidden="true"
                className={i <= n ? "rating-star is-filled" : "rating-star"}
            >
                ★
            </span>
        ))}
    </span>
);
export default function Reviews({ slug, seed, compact = false }) {
    const key = "gox-demo-reviews-v1-" + slug;
    const initial = [
        { id: "lucia", author: "Lucía", rating: 5, body: seed },
        {
            id: "marcos",
            author: "Marcos",
            rating: 4,
            body: "A lovely addition to my workspace. I would choose it again.",
        },
    ];
    const [own, setOwn] = useState([]),
        [ready, setReady] = useState(false),
        [status, setStatus] = useState(""),
        [rating, setRating] = useState(0);
    function read() {
        try {
            const v = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(v)
                ? v
                      .filter(
                          (r) =>
                              r &&
                              typeof r.author === "string" &&
                              typeof r.body === "string" &&
                              Number.isInteger(r.rating) &&
                              r.rating >= 0 &&
                              r.rating <= 5,
                      )
                      .slice(0, 100)
                : [];
        } catch {
            return [];
        }
    }
    useEffect(() => {
        setOwn(read());
        setReady(true);
        const sync = () => setOwn(read());
        window.addEventListener("storage", sync);
        window.addEventListener("gox:reviews", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("gox:reviews", sync);
        };
    }, [key]);
    const reviews = [...own, ...initial],
        average = (
            reviews.reduce((n, r) => n + r.rating, 0) / reviews.length
        ).toLocaleString("en-US", { maximumFractionDigits: 1 });
    function submit(e) {
        e.preventDefault();
        const form = e.currentTarget,
            data = new FormData(form),
            author = String(data.get("author")).trim(),
            body = String(data.get("body")).trim(),
            rating = Number(data.get("rating"));
        if (!author || !body) {
            setStatus("Enter your name and a comment.");
            return;
        }
        const next = [
            {
                id: crypto.randomUUID(),
                author: author.slice(0, 50),
                body: body.slice(0, 1000),
                rating,
            },
            ...own,
        ].slice(0, 100);
        setOwn(next);
        try {
            localStorage.setItem(key, JSON.stringify(next));
            setStatus("Thank you. Your review has been saved in this browser.");
        } catch {
            setStatus(
                "Your review is shown here but could not be saved in the browser.",
            );
        }
        form.reset();
        setRating(0);
        window.dispatchEvent(new Event("gox:reviews"));
    }
    if (compact)
        return (
            <a className="shop-stars" href="#reviews">
                {stars(Math.round(Number(average.replace(",", "."))))}{" "}
                <span>
                    {average} · {reviews.length} reviews
                </span>
            </a>
        );
    return (
        <section className="shop-reviews">
            <h2>What people are saying.</h2>
            <p className="shop-stars">
                {stars(Math.round(Number(average.replace(",", "."))))} ·{" "}
                {average} out of 5 · {reviews.length} reviews
            </p>
            <p>Sample reviews. Your comments are saved only in this browser.</p>
            {reviews.map((r) => (
                <article key={r.id}>
                    <strong>
                        {r.author} ·{" "}
                        <span aria-label={r.rating + " out of 5"}>
                            {stars(r.rating)}
                        </span>
                    </strong>
                    <p>{r.body}</p>
                </article>
            ))}
            <form onSubmit={submit}>
                <h3>Leave a review</h3>
                <label>
                    Your name
                    <input name="author" required maxLength={50} />
                </label>
                <fieldset className="rating-picker">
                    <legend>Rating</legend>
                    <input type="hidden" name="rating" value={rating} />
                    <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                                aria-pressed={rating === n}
                                className={
                                    n <= rating
                                        ? "rating-star is-filled"
                                        : "rating-star"
                                }
                                onClick={() => setRating(n)}
                            >
                                ★
                            </button>
                        ))}
                        <button
                            type="button"
                            className="rating-reset"
                            onClick={() => setRating(0)}
                            aria-label="Rate zero stars"
                        >
                            0 stars
                        </button>
                    </div>
                    <span className="rating-value" aria-live="polite">
                        {rating} out of 5
                    </span>
                </fieldset>
                <label>
                    Your comment
                    <textarea name="body" required maxLength={1000} />
                </label>
                <button className="button primary" disabled={!ready}>
                    Post review
                </button>
                <p role="status">{status}</p>
            </form>
        </section>
    );
}
