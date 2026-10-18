import Actions from "@gox/actions";
for (const form of document.querySelectorAll("[data-action-form]")) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const panel = form.closest(".http-playground");
        const status = panel.querySelector('[role="status"]');
        const output = panel.querySelector("[data-action-result]");
        const button = form.querySelector("button");
        button.disabled = true;
        status.textContent = "Running on the server…";
        try {
            const name = new FormData(form).get("name");
            const [value, error] = await Actions[form.dataset.actionForm](
                ...(name === null ? [] : [name]),
            );
            if (error) throw new Error(error.message);
            if (value instanceof Node) output.replaceChildren(value);
            else {
                const pre = document.createElement("pre");
                pre.textContent = JSON.stringify(value, null, 2);
                output.replaceChildren(pre);
            }
            status.textContent = "Response received from Go.";
        } catch (error) {
            status.textContent =
                error.message || "Could not complete the Action.";
            output.replaceChildren();
        } finally {
            button.disabled = false;
        }
    });
}
