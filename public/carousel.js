const demoCarousel = document.querySelector("#demo-carousel");
if (demoCarousel) {
    const previous = document.querySelector("[data-carousel-prev]");
    const next = document.querySelector("[data-carousel-next]");
    const cards = [...demoCarousel.children].filter(
        (card) => card.dataset.carouselCopy !== "true",
    );
    const reduced = () =>
        matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inset = () => parseFloat(getComputedStyle(demoCarousel).paddingLeft);
    const gap = () => parseFloat(getComputedStyle(demoCarousel).gap);
    const ordered = () =>
        [...cards].sort(
            (a, b) => Number(a.style.order) - Number(b.style.order),
        );
    const left = (card) => card.offsetLeft - inset();
    let motion = 0;
    let morphing = false;
    let anchor = cards[0];
    let destination = null;
    cards.forEach(
        (card, index) =>
            (card.style.order = index === cards.length - 1 ? -1 : index),
    );
    demoCarousel.classList.add("is-interactive", "is-ready");
    const setWidth = () =>
        demoCarousel.style.setProperty(
            "--expanded-card-width",
            `${demoCarousel.clientWidth - inset() * 2}px`,
        );
    setWidth();
    demoCarousel.scrollLeft = left(anchor);

    function normalize() {
        if (motion || morphing) return;
        const sequence = ordered();
        const first = sequence[0],
            last = sequence.at(-1);
        if (demoCarousel.scrollLeft < (first.offsetWidth + gap()) * 0.5) {
            const width = last.offsetWidth + gap();
            const position = demoCarousel.scrollLeft;
            last.style.order = Number(first.style.order) - 1;
            demoCarousel.scrollLeft = position + width;
        } else if (
            demoCarousel.scrollWidth -
                demoCarousel.clientWidth -
                demoCarousel.scrollLeft <
            (last.offsetWidth + gap()) * 0.5
        ) {
            const width = first.offsetWidth + gap();
            const position = demoCarousel.scrollLeft;
            first.style.order = Number(last.style.order) + 1;
            demoCarousel.scrollLeft = position - width;
        }
    }
    function update() {
        normalize();
        const start = demoCarousel.scrollLeft + inset();
        const end =
            demoCarousel.scrollLeft + demoCarousel.clientWidth - inset();
        for (const card of cards) {
            const visible =
                Math.max(
                    0,
                    Math.min(card.offsetLeft + card.offsetWidth, end) -
                        Math.max(card.offsetLeft, start),
                ) / card.offsetWidth;
            card.style.setProperty(
                "--card-scale",
                String(0.9 + 0.1 * Math.min(1, visible)),
            );
        }
    }
    function stop() {
        cancelAnimationFrame(motion);
        motion = 0;
        destination = null;
        update();
    }
    function travel(card) {
        stop();
        anchor = card;
        destination = card;
        const from = demoCarousel.scrollLeft;
        const to = left(card);
        const began = performance.now();
        const duration = reduced() ? 160 : 500;
        function step(now) {
            const progress = Math.min((now - began) / duration, 1);
            const eased =
                progress < 0.5
                    ? 4 * progress ** 3
                    : 1 - (-2 * progress + 2) ** 3 / 2;
            demoCarousel.scrollLeft = from + (to - from) * eased;
            if (progress < 1) motion = requestAnimationFrame(step);
            else {
                motion = 0;
                destination = null;
                update();
            }
        }
        motion = requestAnimationFrame(step);
    }
    function move(direction) {
        if (morphing) return;
        const origin = destination
            ? left(destination)
            : demoCarousel.scrollLeft;
        const sequence = ordered();
        const card =
            direction > 0
                ? sequence.find((card) => left(card) > origin + 2)
                : sequence.reverse().find((card) => left(card) < origin - 2);
        if (card) travel(card);
    }
    async function toggle(card, expand) {
        if (morphing || card.classList.contains("is-expanded") === expand)
            return;
        stop();
        morphing = true;
        anchor = card;
        const width = card.offsetWidth,
            height = card.offsetHeight;
        const fromScroll = demoCarousel.scrollLeft;
        const relative = card.offsetLeft - fromScroll;
        card.classList.toggle("is-expanded", expand);
        card.querySelector(".demo-expand").setAttribute(
            "aria-expanded",
            String(expand),
        );
        const finalWidth = card.offsetWidth,
            finalHeight = card.offsetHeight;
        card.style.flexBasis = `${width}px`;
        card.style.height = `${height}px`;
        demoCarousel.scrollLeft = card.offsetLeft - relative;
        // Animate the same card's box; its server-rendered content stays mounted.
        const duration = reduced() ? 160 : 380;
        const began = performance.now();
        await new Promise((resolve) => {
            function step(now) {
                const t = Math.min((now - began) / duration, 1);
                const eased = 1 - (1 - t) ** 3;
                card.style.flexBasis = `${width + (finalWidth - width) * eased}px`;
                card.style.height = `${height + (finalHeight - height) * eased}px`;
                demoCarousel.scrollLeft =
                    card.offsetLeft - (relative + (inset() - relative) * eased);
                update();
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            }
            requestAnimationFrame(step);
        });
        card.style.removeProperty("flex-basis");
        card.style.removeProperty("height");
        demoCarousel.scrollLeft = left(card);
        morphing = false;
        update();
        card.querySelector(expand ? ".demo-collapse" : ".demo-expand").focus({
            preventScroll: true,
        });
        if (expand) {
            const controls = document
                .querySelector(".demo-carousel-controls")
                .getBoundingClientRect();
            if (
                controls.top < 16 ||
                card.getBoundingClientRect().bottom > innerHeight
            ) {
                window.scrollBy({
                    top: controls.top - 24,
                    behavior: "instant",
                });
            }
        }
    }
    cards.forEach((card) => {
        card.querySelector(".demo-expand").addEventListener("click", () =>
            toggle(card, true),
        );
        card.querySelector(".demo-collapse").addEventListener("click", () =>
            toggle(card, false),
        );
    });
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    demoCarousel.addEventListener("scroll", update, { passive: true });
    demoCarousel.addEventListener(
        "pointerdown",
        () => {
            if (!morphing) stop();
        },
        { passive: true },
    );
    demoCarousel.addEventListener(
        "wheel",
        () => {
            if (!morphing) stop();
        },
        { passive: true },
    );
    demoCarousel.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            const card = event.target.closest(".demo-card.is-expanded");
            if (card) {
                event.preventDefault();
                toggle(card, false);
            }
        }
        if (
            event.target === demoCarousel &&
            ["ArrowRight", "ArrowLeft"].includes(event.key)
        ) {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
        }
    });
    let lastWidth = demoCarousel.clientWidth;
    new ResizeObserver(() => {
        if (demoCarousel.clientWidth !== lastWidth) {
            lastWidth = demoCarousel.clientWidth;
            stop();
            setWidth();
            demoCarousel.scrollLeft = left(anchor);
        }
        update();
    }).observe(demoCarousel);
    function openHash() {
        const id = location.hash.slice(1);
        const target = document.getElementById(id);
        const card = target?.closest('.demo-card[data-carousel-copy="false"]');
        if (card) {
            if (!card.classList.contains("is-expanded")) toggle(card, true);
            else travel(card);
            document
                .querySelector("#explore")
                .scrollIntoView({ block: "start" });
        }
    }
    window.addEventListener("hashchange", openHash);
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((link) =>
        link.addEventListener("click", () => {
            const hash = new URL(link.href).hash;
            if (hash === location.hash) openHash();
        }),
    );
    update();
    openHash();
}
