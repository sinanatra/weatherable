<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";
    import * as d3 from "d3";

    let dailyIdInput = "";
    let tattooed = false;
    let documentData = null;
    let error = null;
    let data = [];
    let guessedData = {};
    let averages = {};

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

    async function fetchDocumentById(dailyId) {
        const response = await fetch(`/api/getTattoo?dailyId=${dailyId}`);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            return null;
        }
    }

    async function submitTattooed() {
        error = null;
        try {
            await submitTattooedStatus(dailyIdInput, tattooed);
        } catch (err) {
            error = err.message;
        }
    }

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
        alert("Updated");
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

            curveSmooth: [
                "N",
                "NNE",
                "NE",
                "ENE",
                "E",
                "ESE",
                "SE",
                "SSE",
            ].includes(document?.radio1),
            outline: [
                "S",
                "SSW",
                "SW",
                "WSW",
                "W",
                "NW",
                "WNW",
                "NNW",
            ].includes(document?.radio1),

            mirror: document?.radio == "Yes",

            lineThickness: document?.lineThickness || 1,
            fillThickness: document?.fillThickness || 0.1,
        };
    }

    function calculateRealAverages(data) {
        const averages = {};
        const keys = ["temp", "uv", "wrain_piezo", "humidity", "windspeed"];
        keys.forEach((key) => {
            averages[key] =
                data.reduce((sum, item) => sum + item[key], 0) / data.length;
        });
        return averages;
    }

    async function fetchRecentData() {
        try {
            const response = await fetch(
                "https://zku-middleware.vercel.app/api/recent",
            );

            if (!response.ok) {
                throw new Error("API response was not ok");
            }

            const json = await response.json();
            return json;
        } catch (error) {
            console.error("API request failed, falling back to CSV:", error);
            try {
                const csvData = await d3.csv(
                    "/data/zku_weatherstation_main_hour.csv",
                );
                return csvData;
            } catch (csvError) {
                console.error("Failed to load CSV file as fallback:", csvError);
                return null;
            }
        }
    }

    function mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    onMount(async () => {
        data = await fetchRecentData();
        averages = calculateRealAverages(data);
    });

    $: tattoo = guessedData ? getClosestNumber(guessedData) : null;
</script>

<article>
    <header>
        <h1>Tattoo maintenance</h1>
    </header>
    <section class="input-section">
        <div>
            <label>
                Enter ID:
                <input type="number" bind:value={dailyIdInput} required />
            </label>
            <br />
            <button on:click={fetchDocument}>Get Tattoo</button>
        </div>
    </section>

    <section class="viz-section">
        {#if error}
            <p style="color: red;">{error}</p>
        {/if}

        {#if documentData}
            <section class="data">
                {#if data.length > 0}
                    <div>
                        <h2>{tattoo}</h2>
                        <Viz {data} {guessedData} invert={true} />
                    </div>
                {/if}
            </section>

            <div class="comparison">
                <ul class="comparison-list">
                    <li
                        style="border-bottom: 1px solid; padding-bottom:10px;  margin-bottom:10px"
                    >
                        <span>Comparison</span>
                        <span>Guessed</span>
                        <span>Accurate</span>
                    </li>
                    <li>
                        <span class="label">Temp:</span>
                        <span class="guessed"
                            >{parseInt(
                                mapValue(guessedData?.temp, 0.1, 1, 0, 40),
                            )}°</span
                        >
                        <span class="real"> {averages.temp.toFixed(2)}°</span>
                    </li>
                    <li>
                        <span class="label">UV:</span>
                        <span class="guessed"
                            >{parseInt(
                                mapValue(guessedData?.uv, 0.1, 1, 0, 11),
                            )}</span
                        >
                        <span class="real"> {averages.uv.toFixed(2)} UV</span>
                    </li>
                    <li>
                        <span class="label">Rain:</span>
                        <span class="guessed"
                            >{parseInt(
                                mapValue(
                                    guessedData?.wrain_piezo,
                                    0.1,
                                    1,
                                    0,
                                    100,
                                ),
                            )} mm/h</span
                        >
                        <span class="real">
                            {averages.wrain_piezo.toFixed(2)} mm/h</span
                        >
                    </li>
                    <li>
                        <span class="label">Humidity:</span>
                        <span class="guessed"
                            >{parseInt(
                                mapValue(guessedData?.humidity, 0.1, 1, 0, 100),
                            )} %</span
                        >
                        <span class="real">
                            {averages.humidity.toFixed(2)} %</span
                        >
                    </li>
                    <li>
                        <span class="label">Wind:</span>
                        <span class="guessed"
                            >{parseInt(
                                mapValue(guessedData?.windspeed, 0.1, 1, 0, 70),
                            )} m/s</span
                        >
                        <span class="real">
                            {averages.windspeed.toFixed(2)} m/s</span
                        >
                    </li>
                </ul>
            </div>

            <div class="tattoed">
                <label>
                    <input type="checkbox" bind:checked={tattooed} />
                    Mark as Tattooed
                </label>
                <br />
                <button on:click={submitTattooed}>Update</button>
            </div>
        {/if}
    </section>
</article>

<style>
    header {
        background-color: white;
        color: black;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px dashed white;
        padding: 5px;
    }
    article {
        width: 100vw;
        height: 100vh;
        overflow-x: hidden;
    }

    article > * {
        padding: 10px;
    }

    h1 {
        text-shadow: unset;
        font-weight: 400;
        font-size: 3rem;
    }

    .data > div {
        position: relative;
        display: flex;
        justify-content: center;
    }

    h2 {
        position: absolute;
        top: 0;
        margin: 0 auto;
        font-size: 10rem;
        color: yellow;
    }

    p {
        text-shadow: unset;
    }

    .input-section {
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
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

    .comparison-list {
        list-style-type: none;
        padding: 0;
        gap: 10px;
        width: 100%;
    }

    .comparison-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: right;
    }

    .label,
    li > span {
        font-weight: bold;
        flex: 1;
    }

    .guessed {
        flex: 1;
        text-align: right;
        color: #ff8c00; /* orange for guessed */
    }

    .real {
        flex: 1;
        text-align: right;
        color: #4682b4; /* blue for real */
    }
</style>
