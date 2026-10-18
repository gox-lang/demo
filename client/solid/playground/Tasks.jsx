import { createSignal, For } from "solid-js";
export default function Tasks() {
    const [done, setDone] = createSignal([]);
    const tasks = ["Explore GOX", "Try a component", "Create my project"];
    const toggle = (index) =>
        setDone((previous) =>
            previous.includes(index)
                ? previous.filter((item) => item !== index)
                : [...previous, index],
        );
    return (
        <div class="counter demo-widget">
            <span class="eyebrow">STEP BY STEP</span>
            <h3>Your first adventure.</h3>
            <div class="task-list">
                <For each={tasks}>
                    {(task, index) => (
                        <label
                            classList={{ completed: done().includes(index()) }}
                        >
                            <input
                                type="checkbox"
                                checked={done().includes(index())}
                                onChange={() => toggle(index())}
                            />
                            <span>{task}</span>
                        </label>
                    )}
                </For>
            </div>
            <progress
                max="3"
                value={done().length}
                aria-label="Completed tasks"
            />
            <p aria-live="polite">{done().length} of 3 completed</p>
            <span class="status hydration-status">
                <span class="status-dot"></span>Solid is ready
            </span>
        </div>
    );
}
