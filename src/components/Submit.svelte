<script>
    import { createEventDispatcher } from "svelte";

    let text = "";
    let range = 0;
    let range1 = 0;
    let radio = 0;
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

<section>
    {#if message}
        <div class="message">
            <p>{message}</p>
            <a href="/last" target="_self"
                >Check the latest entries and print it.</a
            >
        </div>
    {:else}
        <div>
            <h2>Question?</h2>
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
        <div>
            <h2>Question?</h2>
            <input
                type="range"
                bind:value={range}
                min="0"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>
        <div>
            <h2>Question?</h2>
            <input
                type="range"
                bind:value={range1}
                min="0"
                max="1"
                step="0.1"
                on:input={handleChange}
            />
        </div>
        <div>
            <h2>Question?</h2>
            <input
                type="radio"
                bind:group={radio}
                value={1}
                on:change={handleChange}
            />1
            <input
                type="radio"
                bind:group={radio}
                value={2}
                on:change={handleChange}
            />2
            <input
                type="radio"
                bind:group={radio}
                value={3}
                on:change={handleChange}
            />3
        </div>
    {/if}
</section>

{#if !message}
    {#if !text || !radio}
        <button disabled>Submit</button>
    {:else}
        <button on:click={handleSubmit}>Submit</button>
    {/if}
{/if}

<style>
    section {
        margin-bottom: 50px;
        width: 100%;
    }

    textarea,
    input[type="range"] {
        width: 100%;
        max-width: 340px;
    }

    a {
        color: black;
    }
</style>
