<script>
    let text = "";
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
            <a href="/" target="_self"
                >Check the latest entries and print it.</a
            >
        </div>
    {:else}
        <section>
            <textarea
                name="answer"
                id="answer"
                bind:value={text}
                maxlength="640"
                required
            ></textarea>
        </section>
        <button on:click={handleSubmit}>Submit</button>
    {/if}
</section>

<style>
</style>
