const form = document.querySelector("#greeting-form");
form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const status = document.querySelector("#form-status");
    button.disabled = true;
    status.textContent = "Querying the server…";
    try {
        const query = new URLSearchParams(new FormData(form));
        const response = await fetch("/hello?" + query);
        if (!response.ok) throw new Error("Could not complete the request.");
        document.querySelector("#greeting-result").innerHTML =
            await response.text();
        document.querySelector("[data-preview-url]").textContent =
            "/hello?" + query;
        status.textContent = "200 OK · HTML received from the server.";
    } catch {
        status.textContent = "Could not connect. Try again.";
    } finally {
        button.disabled = false;
    }
});
document
    .querySelectorAll("[data-copy], [data-copy-target]")
    .forEach((copyButton) =>
        copyButton.addEventListener("click", async (event) => {
            const button = event.currentTarget;
            try {
                await navigator.clipboard.writeText(
                    document.getElementById(
                        button.dataset.copyTarget || "sample-code",
                    ).dataset.source,
                );
                button.textContent = "Copied ✓";
            } catch {
                button.textContent = "Select the code to copy it";
            }
            setTimeout(() => (button.textContent = "Copy code"), 2200);
        }),
    );

function setupTabs(selector) {
    const tabs = [...document.querySelectorAll(selector)];
    function select(tab, focus = false) {
        for (const item of tabs) {
            const selected = item === tab;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
            item.classList.toggle("framework-active", selected);
            const panel = document.getElementById(
                item.getAttribute("aria-controls"),
            );
            panel.classList.remove("server-tab-hidden");
            panel.hidden = !selected;
        }
        if (focus) tab.focus();
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => select(tab));
        tab.addEventListener("keydown", (event) => {
            let next;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            if (event.key === "ArrowLeft")
                next = (index + tabs.length - 1) % tabs.length;
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = tabs.length - 1;
            if (next !== undefined) {
                event.preventDefault();
                select(tabs[next], true);
            }
        });
    });
}
setupTabs("[data-framework]");
setupTabs("[data-http-tab]");
setupTabs("[data-action-tab]");
setupTabs("[data-connected-tab]");

const noteForm = document.querySelector("#note-form");
noteForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = noteForm.querySelector("button");
    const status = document.querySelector("#note-status");
    const result = document.querySelector("#note-result");
    button.disabled = true;
    status.textContent = "Sending note…";
    try {
        const response = await fetch("/notes", {
            method: "POST",
            body: new URLSearchParams(new FormData(noteForm)),
        });
        const html = await response.text();
        if (response.ok || response.status === 422) {
            result.innerHTML = html;
            status.textContent =
                response.status +
                (response.ok
                    ? " OK · HTML received."
                    : " · Check the submitted message.");
        } else {
            result.textContent = "Could not process the note.";
            status.textContent = response.status + " · Server error.";
        }
    } catch {
        result.textContent =
            "Could not connect. Your note is still in the form so you can try again.";
        status.textContent = "Connection error.";
    } finally {
        button.disabled = false;
    }
});
document
    .querySelector("#inspect-options")
    ?.addEventListener("click", async (event) => {
        const button = event.currentTarget;
        const status = document.querySelector("#options-status");
        button.disabled = true;
        status.textContent = "Querying methods…";
        for (const id of [
            "options-code-result",
            "options-allow",
            "options-body",
        ])
            document.getElementById(id).textContent = "—";
        try {
            const response = await fetch("/notes", { method: "OPTIONS" });
            const body = await response.arrayBuffer();
            document.querySelector("#options-code-result").textContent = String(
                response.status,
            );
            document.querySelector("#options-allow").textContent =
                response.headers.get("Allow") || "Not sent";
            document.querySelector("#options-body").textContent =
                body.byteLength + " bytes";
            status.textContent = response.ok
                ? "Query complete. Here is the response data."
                : "The query returned an error.";
        } catch {
            status.textContent = "Could not connect. Try again.";
        } finally {
            button.disabled = false;
        }
    });

// The server renders decorative rows; scrolling only keeps the gutter aligned.
document.querySelectorAll(".http-source pre").forEach((pre) => {
    pre.addEventListener(
        "scroll",
        () => {
            const filler = pre.querySelector(".editor-filler");
            if (filler)
                filler.style.transform = `translateX(${pre.scrollLeft}px)`;
        },
        { passive: true },
    );
});

setupTabs("[data-chat-tab]");

setupTabs("[data-files-tab]");

setupTabs("[data-connection-tab]");
setupTabs("[data-poll-tab]");
setupTabs("[data-returned-tab]");
setupTabs("[data-returncode-actions-tab]");
setupTabs("[data-returncode-socket-tab]");
setupTabs("[data-realtime-tab]");
setupTabs("[data-channels-code-tab]");

setupTabs("[data-navigation-tab]");
