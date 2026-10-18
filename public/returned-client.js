import Actions from "@gox/actions";
import { socket, socketErrorListeners } from "/chat-demo.js";

let socketError = null;
socketErrorListeners.add((error) => {
    if (error.event === "loadClient") socketError = error;
});
for (const form of document.querySelectorAll("[data-return-client]")) {
    const panel = form.closest(".http-playground");
    const status = panel.querySelector("[role=status]");
    const result = panel.querySelector("[data-client-result]");
    const button = form.querySelector("button");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        button.disabled = true;
        status.textContent = "Requesting the component from Go…";
        try {
            let component;
            if (form.dataset.returnClient === "actions") {
                const [value, error] = await Actions.LoadClient(form);
                if (error) throw new Error(error.message);
                component = value;
            } else {
                if (socket.state !== "connected")
                    throw new Error("Wait for WebSocket to connect.");
                socketError = null;
                component = await socket.emit("loadClient", form);
                if (socketError) throw new Error(socketError.message);
            }
            if (!(component instanceof Node))
                throw new Error("No component was received.");
            result.replaceChildren(component);
            status.textContent = "Component received. Try the counter.";
        } catch (error) {
            status.textContent =
                error.message || "Could not load the component.";
        } finally {
            button.disabled = false;
        }
    });
}
