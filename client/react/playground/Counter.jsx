import { useState } from "react";
export default function Counter({ name }) {
    const [count, setCount] = useState(0);
    return (
        <div className="counter demo-widget">
            <span className="eyebrow">HELLO, {name}</span>
            <h3>One click to get started.</h3>
            <p>Local state. Instant interaction.</p>
            <strong className="count" aria-live="polite">
                {count}
            </strong>
            <div className="counter-actions">
                <button
                    className="button subtle"
                    onClick={() => setCount(count - 1)}
                >
                    Subtract −1
                </button>
                <button
                    className="button primary"
                    onClick={() => setCount(count + 1)}
                >
                    Add +1
                </button>
                <button className="button subtle" onClick={() => setCount(0)}>
                    Reset
                </button>
            </div>
            <span className="status hydration-status">
                <span className="status-dot"></span>React is ready
            </span>
        </div>
    );
}
