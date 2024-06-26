<script>
    let text = "";
    let range = 0;
    let radio = 0;

    let message = "";

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
            <a href="/" target="_self">Check the latest entries and print it.</a
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
                required
            ></textarea>
        </div>
        <div>
            <h2>Question?</h2>
            <input type="range" name="" id="" bind:value={range} />
        </div>
        <div>
            <h2>Question?</h2>
            <input type="radio" bind:group={radio} value={1} />1
            <input type="radio" bind:group={radio} value={2} />2
            <input type="radio" bind:group={radio} value={3} />3
        </div>
    {/if}
</section>
<button on:click={handleSubmit}>Submit</button>

<style>
    section {
        margin-bottom: 50px;
    }
</style>
