<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let documents = [];
    let error = null;
    let data = [];

    async function fetchNonTattooedDocuments() {
        try {
            const response = await fetch("/api/getNonTattooed");
            if (response.ok) {
                const newDocuments = await response.json();

                if (
                    JSON.stringify(newDocuments) !== JSON.stringify(documents)
                ) {
                    documents = newDocuments;
                }
            } else {
                error = "Failed to load non-tattooed documents.";
            }
        } catch (err) {
            error = err.message;
        }
    }

    async function fetchRecentData() {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/recent",
        );
        const json = await response.json();
        return json;
    }

    function startPolling() {
        fetchNonTattooedDocuments();
        setInterval(fetchNonTattooedDocuments, 600000);
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

    function prepareGuessedData(document) {
        const seed = 42;
        const seededRandom = (seed) => {
            let x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const average = calculateAverage(document);
        const seededAverage = seededRandom(seed) * average;

        return {
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

    onMount(async () => {
        data = await fetchRecentData();
        startPolling();
    });
</script>

<header>
    <h1>Next tattoos</h1>
    <p>3 minutes waiting on average...</p>
</header>
<article>
    {#if error}
        <p style="color: red;">{error}</p>
    {/if}

    {#if documents.length > 0}
        {#each documents as doc}
            {#if data.length > 0}
                <section class="data">
                    <h2>{doc.dailyId}</h2>
                    <div>
                        <Viz {data} guessedData={prepareGuessedData(doc)} invert={true} />
                    </div>
                </section>
            {/if}
        {/each}
    {/if}
</article>

<style>
    article {
        padding: 10px;
    }

    header {
        background-color: white;
        color: black;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px dashed white;
        padding: 5px;
    }

    header p {
        color: gray;
        font-size: 16px;
        margin: 0;
        padding: 0;
    }

    h1 {
        text-align: center;
        font-weight: 400;
        font-size: 1em;
        margin: 0px;
        padding: 0;
    }

    section {
        position: relative;
        display: flex;
        justify-content: center;
    }

    h2 {
        position: absolute;
        top: 0;
        margin: 0 auto;
        font-size: 13rem;
        color: yellow;
    }
</style>
