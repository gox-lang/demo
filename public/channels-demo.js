import { socket } from "/chat-demo.js";

const form = document.querySelector("#channel-form");
const messages = document.querySelector("#channel-messages");
const status = document.querySelector("#channel-status");
const feedback = document.querySelector("#channel-feedback");
const select = document.querySelector("#channel-room");
const badge = document.querySelector("#channel-id");
const send = form.querySelector("button");
const openTab = document.querySelector("#channel-open-tab");
const entries = new Map();
const ranks = { sent: 0, received: 1, seen: 2 };
const clock = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
});
let room = null;
let ownID = "";
let pending = false;

function connection(connected, text) {
    status.textContent = text;
    status.dataset.connected = String(connected);
    send.disabled = !connected || pending;
    select.disabled = !connected;
}

function receipt(item, state) {
    if (!(state in ranks) || ranks[state] < ranks[item.state]) return;
    item.state = state;
    item.checks.textContent = state === "sent" ? "✓" : "✓✓";
    item.checks.dataset.state = state;
    const label = {
        sent: "Sent to the server",
        received: "Received in this room",
        seen: "Seen in this room",
    }[state];
    item.checks.title = label;
    item.checks.setAttribute("aria-label", label);
}

function markVisible() {
    if (
        document.visibilityState !== "visible" ||
        !document.hasFocus() ||
        room?.connectionState !== "connected" ||
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
            room.emit("receipt", id, "seen");
        }
    }
}

function joinRoom(key) {
    if (room?.key === key) return;
    const changingRoom = room !== null;
    room?.leave();
    room = null;
    ownID = "";
    pending = false;
    entries.clear();
    feedback.textContent = "";
    if (changingRoom) {
        const empty = document.createElement("li");
        empty.className = "chat-empty";
        empty.textContent = "You are in #" + key + ". Send the first message.";
        messages.replaceChildren(empty);
    }
    badge.textContent = "Chat#" + key;
    badge.dataset.room = key;
    openTab.href = "/?room=" + encodeURIComponent(key) + "#realtime";
    connection(false, "Joining #" + key + "…");

    const current = new socket.Channel("Chat#" + key);
    room = current;
    current.when("connected", async () => {
        if (room !== current) return;
        const id = await current.emit("identity").await();
        if (room !== current || current.connectionState !== "connected") return;
        if (typeof id !== "string") {
            connection(false, "Could not identify the connection.");
            return;
        }
        ownID = id;
        connection(true, "Connected to #" + key);
        markVisible();
    });
    current.when("disconnected", () => {
        if (room === current) {
            pending = false;
            connection(false, "Reconnecting to #" + key + "…");
        }
    });
    current.when("rejected", () => {
        if (room !== current) return;
        connection(false, "Could not join this room.");
        select.disabled = false;
    });
    current.when("error", (error) => {
        if (room !== current) return;
        pending = false;
        feedback.textContent = error.message;
        send.disabled = current.connectionState !== "connected" || !ownID;
    });
    current.on("rejected", (target, reason) => {
        if (room !== current || target !== ownID) return;
        pending = false;
        send.disabled = false;
        feedback.textContent = reason;
    });
    current.on("receipt", (target, id, state) => {
        if (room !== current || target !== ownID) return;
        const item = entries.get(id);
        if (item?.own) receipt(item, state);
    });
    current.on("message", (id, sender, name, message, stamp) => {
        if (room !== current || entries.has(id)) return;
        messages.querySelector(".chat-empty")?.remove();
        const own = sender === ownID;
        const entry = document.createElement("li");
        entry.className = own ? "chat-bubble chat-own" : "chat-bubble";
        const author = document.createElement("strong");
        author.textContent = own ? "You" : name;
        const body = document.createElement("p");
        body.textContent = message;
        const meta = document.createElement("div");
        meta.className = "chat-meta";
        const time = document.createElement("time");
        time.dateTime = stamp;
        time.textContent = clock.format(new Date(stamp));
        meta.append(time);
        const checks = document.createElement("span");
        checks.className = "chat-checks";
        const item = {
            element: entry,
            own,
            checks,
            state: "sent",
            seen: false,
        };
        if (own) {
            meta.append(checks);
            receipt(item, "sent");
            pending = false;
            send.disabled = false;
            if (form.elements.message.value.trim() === message)
                form.elements.message.value = "";
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
        if (!own) current.emit("receipt", id, "received");
        requestAnimationFrame(markVisible);
    });
}

select.addEventListener("change", () => joinRoom(select.value));
form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (room?.connectionState !== "connected" || !ownID || pending) return;
    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message) {
        feedback.textContent = "Check the name and message.";
        return;
    }
    pending = true;
    send.disabled = true;
    feedback.textContent = "";
    room.emit("message", name, message);
});
messages.addEventListener("scroll", markVisible, { passive: true });
window.addEventListener("scroll", markVisible, { passive: true });
window.addEventListener("resize", markVisible);
window.addEventListener("focus", markVisible);
document.addEventListener("visibilitychange", markVisible);
new MutationObserver(markVisible).observe(
    document.querySelector("#realtime-channels"),
    { attributes: true, attributeFilter: ["hidden"] },
);
joinRoom(select.value);
