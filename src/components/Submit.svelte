<script>
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";

    export let currentInput;

    $: text = currentInput?.answer ? currentInput.answer : "";
    $: range = currentInput?.range ? currentInput.range : 0.1;
    $: range1 = currentInput?.range1 ? currentInput.range1 : 0.1;
    $: range2 = currentInput?.range2 ? currentInput.range2 : 0.1;
    $: range3 = currentInput?.range3 ? currentInput.range3 : 0.1;
    $: range4 = currentInput?.range4 ? currentInput.range4 : 0.1;
    // $: range5 = currentInput?.range5 ? currentInput.range5 : 0.1;

    $: radio = currentInput?.radio ? currentInput.radio : "NW";
    $: radio1 = currentInput?.radio1 ? currentInput.radio1 : "yes";

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
                radio1,
                range,
                range1,
                range2,
                range3,
                range4,
                // range5,
            }),
        });

        const responses = await Promise.all([postRequest]);
        const success = responses.every((response) => response.ok);

        if (success) {
            console.log("Data submitted successfully.");
            goto(`/haus`);
        } else {
            console.error("Failed to submit data.");
        }
    };
</script>

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
        <h2>How warm is it outside right now?</h2>
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
        <h2>What is today's UV factor?</h2>
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
        <h2>How much rain has fallen in the past week?</h2>
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
        <h2>How humid is it today?</h2>
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
        <h2>What was the average wind speed this week? </h2>
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
        <h2>Were you checking today's weather forecast?</h2>
        <label>
            <input
                type="radio"
                bind:group={radio}
                value={"Yes"}
                on:change={handleChange}
            />
            Yes
        </label>
        <label>
            <input
                type="radio"
                bind:group={radio}
                value={"No"}
                on:change={handleChange}
            />
            No
        </label>
    </div>
    <div class="input-group">
        <h2>In which direction is the wind blowing?</h2>
        <label>
            <input
                type="radio"
                bind:group={radio}
                value={"NW"}
                on:change={handleChange}
            />
            NW
        </label>
        <label>
            <input
                type="radio"
                bind:group={radio}
                value={"NE"}
                on:change={handleChange}
            />
            NE
        </label>
        <label>
            <input
                type="radio"
                bind:group={radio}
                value={"SW"}
                on:change={handleChange}
            />
            SW
        </label>
        <label>
            <input
                type="radio"
                bind:group={radio}
                value={"SE"}
                on:change={handleChange}
            />
            SE
        </label>
    </div>
</section>

{#if !text || !radio}
    <button disabled>Submit</button>
{:else}
    <button on:click={handleSubmit}>Submit</button>
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
        accent-color: red;
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
        display: none;
        width: 0;
      
    }

    label:has(input[type="radio"]) {
        cursor: pointer;
        margin-right: 20px;
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
