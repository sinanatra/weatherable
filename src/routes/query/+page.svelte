<script>
    import { goto } from "$app/navigation";
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let dailyIdInput = "";
    let tattooed = false;
    let documentData = null;
    let error = null;
    let data = [];

    async function fetchDocument(dailyId) {
        const response = await fetch(`/api/getTattoo?dailyId=${dailyId}`);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            return null;
        }
    }

    async function submitTattooed(dailyId) {
        const response = await fetch(`/api/getTattoo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dailyId,
                tattooed: true,
            }),
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Failed to update the document.");
        }
    }

    async function handleSubmit() {
        error = null;
        documentData = null;
        try {
            const doc = await fetchDocument(dailyIdInput);
            if (doc) {
                documentData = doc;
                if (tattooed) {
                    await submitTattooed(dailyIdInput);
                    // goto("/check-tattoo?success=true");
                }
            } else {
                error = "No document found for the provided ID.";
            }
        } catch (err) {
            error = err.message;
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

        const average = calculateAverage(guessedData); // Correctly access the properties

        if (average < 0.33) closestNumber += 0;
        else if (average < 0.66) closestNumber += 1;
        else closestNumber += 2;

        return closestNumber;
    }

    let guessedData = {};

    $: if (documentData) {
        const average = calculateAverage(documentData); // documentData is an object, not an array
        const seededAverage = seededRandom(seed) * average;

        guessedData = {
            temp: documentData?.range,
            uv: documentData?.range1,
            wrain_piezo: documentData?.range2,
            humidity: documentData?.range3,
            windspeed: documentData?.range4,

            len: seededAverage || 0.5,

            curveSmooth:
                documentData?.radio1 == "NW" || documentData?.radio1 == "NE",
            outline:
                documentData?.radio1 == "SW" || documentData?.radio1 == "SE",
            mirror: documentData?.radio == "Yes",

            lineThickness: documentData?.lineThickness || 1,
            fillThickness: documentData?.fillThickness || 0.1,
        };
    }

    $: tattoo = guessedData ? getClosestNumber(guessedData) : null;

    async function fetchRecentData() {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/recent",
        );
        const json = await response.json();
        let datum = json;
        return datum;
    }

    onMount(async () => {
        data = await fetchRecentData();
    });
</script>

<article>
    <h1>Tattoo Mantainance</h1>

    <form on:submit|preventDefault={handleSubmit}>
        <label>
            Enter Daily ID:
            <input type="number" bind:value={dailyIdInput} required />
        </label>
        <br />
        <label>
            <input type="checkbox" bind:checked={tattooed} />
            Mark as Tattooed
        </label>
        <br />
        <button type="submit">Submit</button>
    </form>

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

        <pre>{JSON.stringify(documentData, null, 2)}</pre>
    {/if}
</article>

<style>
   
    article {
        width: 100vw;
        height: 100vh;
        font-family:
            Arial Narrow,
            Helvetica,
            sans-serif;
        background-color: black;
        color: rgba(255, 255, 255, 0.5);
        font-size: 24px;
    }

    input[type="number"] {
        width: 100px;
    }
    button {
        margin-top: 1em;
    }
</style>
