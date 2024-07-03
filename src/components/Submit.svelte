<script>
    import { createEventDispatcher } from "svelte";

    export let currentInput;

    $: text = currentInput?.answer ? currentInput.answer : "";
    $: range = currentInput?.range ? currentInput.range : 0;
    $: range1 = currentInput?.range1 ? currentInput.range1 : 0;
    $: range2 = currentInput?.range2 ? currentInput.range2 : 0;
    $: range3 = currentInput?.range3 ? currentInput.range3 : 0;
    $: range4 = currentInput?.range4 ? currentInput.range4 : 0;
    $: range5 = currentInput?.range5 ? currentInput.range5 : 0;

    $: radio = currentInput?.radio ? currentInput.radio : 0;
    let message = "";

    const dispatch = createEventDispatcher();

    function handleChange() {
        dispatch("change", { answer: text, radio, range, range1 });
    }

    const handleSubmit = async () => {
        if (!text.trim()) {
            alert("Text field cannot be empty");
            return;
        }

        const postRequest = await fetch("/api/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answer: text,
                radio,
                range,
                range1,
                range2,
                range3,
                range4,
                range5,
            }),
        });

        const responses = await Promise.all([postRequest]);
        const success = responses.every((response) => response.ok);

        if (success) {
            console.log("Data submitted successfully.");
            message = "Data submitted successfully.";
        } else {
            console.error("Failed to submit data.");
            message = "Failed to submit data.";
        }
    };
</script>

{#if message}
    <div class="message">
        <a href="/last" target="_self">Check the latest tattoo.</a>
    </div>
{:else}
    <section>
        <div class="input-group">
            <h2>How could you describe the current weather in one sentence?</h2>
            <textarea
                name="answer"
                id="answer"
                bind:value={text}
                maxlength="640"
                lines="4"
                required
                on:input={handleChange}
            ></textarea>
        </div>

        <div class="input-group">
            <h2>How much rain has fallen in the past day?</h2>
            <input
                type="range"
                bind:value={range}
                min="0.1"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>
        <div class="input-group">
            <h2>How humid is today?</h2>
            <input
                type="range"
                bind:value={range1}
                min="0.1"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>

        <div class="input-group">
            <h2>How hot is today?</h2>
            <input
                type="range"
                bind:value={range2}
                min="0.1"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>

        <div class="input-group">
            <h2>How fast is the wind at the current moment?</h2>
            <input
                type="range"
                bind:value={range3}
                min="0.1"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>

        <div class="input-group">
            <h2>BAROM?</h2>
            <input
                type="range"
                bind:value={range4}
                min="0.1"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>

        <div class="input-group">
            <h2>feelslike?</h2>
            <input
                type="range"
                bind:value={range5}
                min="0.1"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>

       
        <div class="input-group">
            <h2>In which Direction is the wind blowing?</h2>
            <label>
                <input
                    type="radio"
                    bind:group={radio}
                    value={"N"}
                    on:change={handleChange}
                />
                N
            </label>
            <label>
                <input
                    type="radio"
                    bind:group={radio}
                    value={"E"}
                    on:change={handleChange}
                />
                E
            </label>
            <label>
                <input
                    type="radio"
                    bind:group={radio}
                    value={"S"}
                    on:change={handleChange}
                />
                S
            </label>
            <label>
                <input
                    type="radio"
                    bind:group={radio}
                    value={"W"}
                    on:change={handleChange}
                />
                W
            </label>
        </div>
    </section>
{/if}

{#if !message}
    {#if !text || !radio}
        <button disabled>Submit</button>
    {:else}
        <button on:click={handleSubmit}>Submit</button>
    {/if}
{/if}

<style>
    section {
        margin-top: 300px;
        margin-bottom: 50px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .input-group {
        margin-bottom: 4em;
        width: 90%;
    }

    h2 {
        font-size: 1.5em;
        transform: scaleY(1.2);
        transform-origin: bottom;
        margin-bottom: 30px;
    }

    textarea,
    input[type="range"] {
        width: 100%;
        height: 350px;
        font-size: 1em;
        resize: none;
        font-family: sans-serif;
    }

    textarea {
        background: none;
        box-shadow: none;
        border: 1px solid #565656;
        color: #565656;
    }

    input[type="range"] {
        appearance: none;
        background: #565656;
        height: 20px;
        cursor: grab;
    }

    input[type="range"]:active {
        cursor: grabbing;
    }

    input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        background: blue;
    }

    input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: blue;
    }

    input[type="radio"] {
        visibility: hidden;
    }

    label:has(input[type="radio"]) {
        cursor: pointer;
    }

    label:has(input[type="radio"]:checked) {
        color: blue;
    }

    button {
        font-size: 1.5em;
        margin-bottom: 3em;
        cursor: pointer;
    }

    a {
        color: white;
    }
</style>
