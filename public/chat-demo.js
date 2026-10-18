import { Socket } from "@gox/websocket";

export const socket = new Socket();
export const socketErrorListeners = new Set();
const form = document.querySelector("#chat-form");
const messages = document.querySelector("#chat-messages");
const status = document.querySelector("#chat-status");
const feedback = document.querySelector("#chat-feedback");
const send = form.querySelector("button");
let pending = false;

function connection(connected, text) {
    status.textContent = text;
    status.dataset.connected = String(connected);
    send.disabled = !connected || pending;
}
socket.when("connect", (reconnected) => {
    socket.emit("chatJoin");
    connection(true, reconnected ? "Connection restored" : "Connected");
});
socket.when("disconnect", (details) => {
    connection(false, details.willReconnect ? "Reconnecting…" : "Disconnected");
});
socket.when("error", (error) => {
    for (const listener of socketErrorListeners) listener(error);
    if (error.event !== "roundTripFile" && error.event !== "loadClient") {
        feedback.textContent = error.message || "Could not connect.";
    }
});
socket.on("chatRejected", (message) => {
    feedback.textContent = message;
});
let ownID = "";
const entries = new Map();
const receiptRanks = { sent: 0, received: 1, seen: 2 };
const clock = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
});
socket.on("chatIdentity", (id) => {
    ownID = id;
});
function acknowledge(id, state) {
    socket.emit("chatReceipt", id, state).catch((error) => {
        feedback.textContent = error.message || "Could not confirm receipt.";
    });
}
function markVisible() {
    if (
        document.visibilityState !== "visible" ||
        !document.hasFocus() ||
        socket.state !== "connected" ||
        !messages.getClientRects().length
    )
        return;
    const area = messages.getBoundingClientRect();
    for (const [id, item] of entries) {
        if (item.own || item.seen) continue;
        const rect = item.element.getBoundingClientRect();
        if (
            rect.top >= Math.max(area.top, 0) &&
            rect.bottom <= Math.min(area.bottom, innerHeight)
        ) {
            item.seen = true;
            acknowledge(id, "seen");
        }
    }
}
function receipt(item, state) {
    if (receiptRanks[state] < receiptRanks[item.state]) return;
    item.state = state;
    item.checks.textContent = state === "sent" ? "✓" : "✓✓";
    item.checks.dataset.state = state;
    const label = {
        sent: "Sent to the server",
        received: "Received in another tab",
        seen: "Seen in another tab",
    }[state];
    item.checks.title = label;
    item.checks.setAttribute("aria-label", label);
}
socket.on("chatReceipt", (id, state) => {
    const item = entries.get(id);
    if (item?.own && state in receiptRanks) receipt(item, state);
});
socket.on("chatMessage", (id, sender, name, message, stamp) => {
    if (entries.has(id)) return;
    messages.querySelector(".chat-empty")?.remove();
    const own = sender === ownID;
    const entry = document.createElement("li");
    entry.className = own ? "chat-bubble chat-own" : "chat-bubble";
    const author = document.createElement("strong");
    const body = document.createElement("p");
    const meta = document.createElement("div");
    meta.className = "chat-meta";
    const time = document.createElement("time");
    time.dateTime = stamp;
    time.textContent = clock.format(new Date(stamp));
    author.textContent = own ? "You" : name;
    body.textContent = message;
    meta.append(time);
    const checks = document.createElement("span");
    checks.className = "chat-checks";
    const item = { element: entry, own, checks, state: "sent", seen: false };
    if (own) {
        meta.append(checks);
        receipt(item, "sent");
    }
    entry.append(author, body, meta);
    entries.set(id, item);
    messages.append(entry);
    while (entries.size > 50) {
        const first = entries.keys().next().value;
        entries.get(first).element.remove();
        entries.delete(first);
    }
    messages.scrollTop = messages.scrollHeight;
    if (!own) acknowledge(id, "received");
    requestAnimationFrame(markVisible);
});
messages.addEventListener("scroll", markVisible, { passive: true });
window.addEventListener("scroll", markVisible, { passive: true });
window.addEventListener("resize", markVisible);
window.addEventListener("focus", markVisible);
document.addEventListener("visibilitychange", markVisible);
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (socket.state !== "connected" || pending) return;
    const input = form.elements.message;
    const name = form.elements.name.value.trim();
    const message = input.value.trim();
    if (!name || !message) {
        feedback.textContent = "Check the name and message.";
        return;
    }
    pending = true;
    send.disabled = true;
    feedback.textContent = "";
    try {
        await socket.emit("chatMessage", name, message);
        if (input.value.trim() === message) input.value = "";
    } catch (error) {
        feedback.textContent = error.message || "Could not send. Try again.";
    } finally {
        pending = false;
        send.disabled = socket.state !== "connected";
    }
});

new MutationObserver(markVisible).observe(
    document.querySelector("#realtime-global"),
    { attributes: true, attributeFilter: ["hidden"] },
);
