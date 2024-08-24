<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let dailyIdInput = "";
    let tattooed = false;
    let documentData = null;
    let error = null;
    let data = [];
    let guessedData = {};

    // Fetch document data based on the dailyId
    async function fetchDocument() {
        error = null;
        try {
            documentData = await fetchDocumentById(dailyIdInput);
            if (documentData) {
                tattooed = documentData.tattooed || false;
                prepareGuessedData(documentData);
            } else {
                error = "No document found for the provided ID.";
                documentData = null;
                tattooed = false;
            }
        } catch (err) {
            error = err.message;
        }
    }

    // Helper function to fetch a document by ID
    async function fetchDocumentById(dailyId) {
        const response = await fetch(`/api/getTattoo?dailyId=${dailyId}`);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            return null;
        }
    }

    // Submit the tattooed status to the server
    async function submitTattooed() {
        error = null;
        try {
            await submitTattooedStatus(dailyIdInput, tattooed);
        } catch (err) {
            error = err.message;
        }
    }

    // Helper function to submit the tattooed status
    async function submitTattooedStatus(dailyId, tattooedStatus) {
        const response = await fetch(`/api/getTattoo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dailyId,
                tattooed: tattooedStatus,
            }),
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Failed to update the document.");
        }
    }

    const seed = 42;

    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function calculateAverage(item) {
        const ranges = [
            item.temp,
            item.uv,
            item.wrain_piezo,
            item.humidity,
            item.windspeed,
        ];
        return ranges.reduce((a, b) => a + b, 0) / ranges.length;
    }

    function getClosestNumber(guessedData) {
        let closestNumber = 1;

        if (guessedData.mirror) closestNumber += 12;
        if (guessedData.curveSmooth) closestNumber += 6;
        if (guessedData.outline) closestNumber += 3;

        const average = calculateAverage(guessedData);

        if (average < 0.33) closestNumber += 0;
        else if (average < 0.66) closestNumber += 1;
        else closestNumber += 2;

        return closestNumber;
    }

    function prepareGuessedData(document) {
        const average = calculateAverage(document);
        const seededAverage = seededRandom(seed) * average;

        guessedData = {
            temp: document?.range,
            uv: document?.range1,
            wrain_piezo: document?.range2,
            humidity: document?.range3,
            windspeed: document?.range4,

            len: seededAverage || 0.5,

            curveSmooth: document?.radio1 == "NW" || document?.radio1 == "NE",
            outline: document?.radio1 == "SW" || document?.radio1 == "SE",
            mirror: document?.radio == "Yes",

            lineThickness: document?.lineThickness || 1,
            fillThickness: document?.fillThickness || 0.1,
        };
    }

    async function fetchRecentData() {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/recent",
        );
        const json = await response.json();
        return json;
    }

    onMount(async () => {
        data = await fetchRecentData();
    });

    $: tattoo = guessedData ? getClosestNumber(guessedData) : null;
</script>

<article>
    <section class="input-section">
        <div>
            <label>
                Enter ID:
                <input type="number" bind:value={dailyIdInput} required />
            </label>
            <br />
            <button on:click={fetchDocument}>Get Tattoo</button>
        </div>
        <div>
            <label>
                <input type="checkbox" bind:checked={tattooed} />
                Mark as Tattooed
            </label>
            <br />
            <button on:click={submitTattooed}>Update</button>
        </div>
    </section>

    <section class="viz-section">
        {#if error}
            <p style="color: red;">{error}</p>
        {/if}

        {#if documentData}
            <h1>{tattoo}</h1>

            <section class="data">
                {#if data.length > 0}
                    <div>
                        <Viz {data} {guessedData} />
                    </div>
                {/if}
            </section>

            <pre>{JSON.stringify(guessedData, null, 2)}</pre>
        {/if}
    </section>
</article>

<style>
    article {
        width: 100vw;
        height: 100vh;
        padding: 10px;
    }

    .input-section {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        max-width: 640px;
    }

    input[type="number"] {
        width: 100px;
    }

    button {
        margin-top: 1em;
    }

    .viz-section {
        margin-top: 20px;
    }
</style>
