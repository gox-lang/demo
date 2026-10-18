<script setup>
import { ref, computed } from "vue";
const query = ref("");
const technologies = ["Go", "React", "Preact", "Solid", "Vue", "Svelte"];
const filtered = computed(() =>
    technologies.filter((name) =>
        name.toLowerCase().includes(query.value.trim().toLowerCase()),
    ),
);
</script>
<template>
    <div class="counter demo-widget">
        <span class="eyebrow">FIND YOUR TECHNOLOGY</span>
        <h3>Less noise. More focus.</h3>
        <label
            >Search technologies<input v-model="query" placeholder="Try “re”"
        /></label>
        <div class="technology-list" aria-live="polite">
            <span v-for="name in filtered" :key="name">{{ name }}</span>
            <p v-if="!filtered.length">No matches found.</p>
        </div>
        <span class="status hydration-status"
            ><span class="status-dot"></span>Vue is ready</span
        >
    </div>
</template>
