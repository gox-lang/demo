<script>
    let selected = "Blue";
    const colors = [
        { name: "Blue", value: "#087ebc" },
        { name: "Violet", value: "#7541c8" },
        { name: "Green", value: "#14785e" },
    ];
</script>

<div class="counter demo-widget">
    <span class="eyebrow">MAKE IT YOUR COLOR</span>
    <h3>One idea, three colors.</h3>
    {#each colors as color}{#if selected === color.name}<div
                class={"color-preview palette-" + color.name}
                aria-live="polite"
            >
                {selected}<small>Built with GOX + Svelte</small>
            </div>{/if}{/each}
    <div class="color-options" role="group" aria-label="Card color">
        {#each colors as color}<button
                type="button"
                aria-pressed={selected === color.name}
                onclick={() => (selected = color.name)}
                ><span class={"palette-" + color.name}
                ></span>{color.name}</button
            >{/each}
    </div>
    <span class="status hydration-status"
        ><span class="status-dot"></span>Svelte is ready</span
    >
</div>
