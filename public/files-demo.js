import Actions from "@gox/actions";
import { socket, socketErrorListeners } from "/chat-demo.js";

const urls = new Map();
let transferError = null;
socketErrorListeners.add((error) => {
    if (error.event === "roundTripFile") transferError = error;
});
for (const form of document.querySelectorAll("[data-file-transfer]")) {
    const panel = form.closest(".http-playground");
    const status = panel.querySelector("[role=status]");
    const result = panel.querySelector("[data-file-result]");
    const button = form.querySelector("button");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const file = form.elements.file.files[0];
        if (!file || file.size > 1048576) {
            status.textContent = "Choose a file up to 1 MiB.";
            return;
        }
        if (urls.has(form)) URL.revokeObjectURL(urls.get(form));
        urls.delete(form);
        result.replaceChildren();
        button.disabled = true;
        status.textContent = "Sending the file and waiting for it to return…";
        try {
            let received;
            if (form.dataset.fileTransfer === "action") {
                const [value, err] = await Actions.RoundTripFile(form);
                if (err) throw new Error(err.message);
                received = value;
            } else {
                if (socket.state !== "connected") {
                    throw new Error("Wait for WebSocket to connect.");
                }
                transferError = null;
                received = await socket.emit("roundTripFile", form);
                if (transferError) throw new Error(transferError.message);
            }
            if (!(received instanceof File)) {
                throw new Error("No valid file was received.");
            }
            const url = URL.createObjectURL(received);
            urls.set(form, url);
            const name = document.createElement("strong");
            name.textContent = received.name;
            const details = document.createElement("p");
            details.textContent =
                received.size + " bytes · " + (received.type || "No MIME type");
            const download = document.createElement("a");
            download.className = "button primary";
            download.href = url;
            download.download = received.name;
            download.textContent = "Download file ↓";
            result.append(name, details, download);
            status.textContent = "File received. You can download it now.";
        } catch (error) {
            status.textContent =
                error.message || "The transfer failed. Try again.";
        } finally {
            button.disabled = false;
        }
    });
}
