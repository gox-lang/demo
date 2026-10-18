(() => {
    const system = matchMedia("(prefers-color-scheme: dark)");
    let preference;
    try {
        preference = localStorage.getItem("gox-theme");
    } catch {}
    const apply = (theme) => {
        document.documentElement.dataset.theme = theme;
        document
            .querySelectorAll("[data-theme-label]")
            .forEach(
                (el) => (el.textContent = theme === "dark" ? "Light" : "Dark"),
            );
        document
            .querySelectorAll("[data-theme-toggle]")
            .forEach((el) =>
                el.setAttribute(
                    "aria-label",
                    theme === "dark"
                        ? "Switch to light theme"
                        : "Switch to dark theme",
                ),
            );
    };
    apply(
        preference === "dark" || preference === "light"
            ? preference
            : system.matches
              ? "dark"
              : "light",
    );
    system.addEventListener("change", () => {
        if (!preference) apply(system.matches ? "dark" : "light");
    });
    document.addEventListener("DOMContentLoaded", () => {
        apply(document.documentElement.dataset.theme);
        document.querySelectorAll("[data-theme-toggle]").forEach((button) =>
            button.addEventListener("click", () => {
                preference =
                    document.documentElement.dataset.theme === "dark"
                        ? "light"
                        : "dark";
                apply(preference);
                try {
                    localStorage.setItem("gox-theme", preference);
                } catch {}
            }),
        );
    });
})();
