import { useEffect, useRef, useState } from "react";
import { Socket } from "@gox/websocket";

export default function LivePoll() {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [votes, setVotes] = useState({ Go: 0, React: 0 });
    const [message, setMessage] = useState("Connecting…");

    useEffect(() => {
        const socket = new Socket();
        socketRef.current = socket;
        socket.when("connect", () => {
            setConnected(true);
            setMessage("Connected. Each submission adds one vote.");
            socket.emit("pollSnapshot");
        });
        socket.when("disconnect", () => {
            setConnected(false);
            setMessage("Disconnected. Waiting to reconnect…");
        });
        socket.when("error", (error) => setMessage(error.message));
        socket.on("pollRejected", (reason) => setMessage(reason));
        socket.on("pollUpdated", (result) => setVotes(result));
        return () => {
            socketRef.current = null;
            socket.disconnect();
        };
    }, []);

    function submit(event) {
        event.preventDefault();
        socketRef.current.emit("castVote", event.currentTarget);
        setMessage("Vote sent. The server will update the tally.");
    }

    const total = votes.Go + votes.React;
    return (
        <div className="live-poll">
            <form onSubmit={submit}>
                <label htmlFor="poll-choice">
                    What would you like to explore first?
                </label>
                <select id="poll-choice" name="choice" defaultValue="Go">
                    <option value="Go">Go on the server</option>
                    <option value="React">React in the browser</option>
                </select>
                <button className="button primary" disabled={!connected}>
                    Submit vote →
                </button>
            </form>
            <p className="http-status" role="status">
                {message}
            </p>
            <div className="poll-results" aria-live="polite">
                <span className="eyebrow">LIVE RESULTS</span>
                {["Go", "React"].map((option) => {
                    const percent = total
                        ? Math.round((votes[option] * 100) / total)
                        : 0;
                    return (
                        <div className="poll-option" key={option}>
                            <div>
                                <strong>{option}</strong>
                                <span>
                                    {votes[option]}{" "}
                                    {votes[option] === 1 ? "vote" : "votes"} ·{" "}
                                    {percent}%
                                </span>
                            </div>
                            <progress
                                max="100"
                                value={percent}
                                aria-label={option + ": " + percent + "%"}
                            />
                        </div>
                    );
                })}
                <p>
                    {total} {total === 1 ? "vote" : "votes"} in this server
                    session.
                </p>
            </div>
            <a
                className="button subtle"
                href="/#connected"
                target="_blank"
                rel="noopener"
            >
                Open another tab ↗
            </a>
        </div>
    );
}
