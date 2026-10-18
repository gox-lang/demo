import { useState } from "preact/hooks";
export default function Greeting({ name = "GOX" }) {
    const [value, setValue] = useState(name);
    return (
        <div className="counter demo-widget">
            <span className="eyebrow">LIVE GREETING</span>
            <h3 aria-live="polite">Hello, {value.trim() || "visitor"}.</h3>
            <label>
                Your name
                <input
                    value={value}
                    onInput={(e) => setValue(e.currentTarget.value)}
                    maxLength={40}
                />
            </label>
            <p>Every letter changes the greeting.</p>
            <span className="status hydration-status">
                <span className="status-dot"></span>Preact is ready
            </span>
        </div>
    );
}
