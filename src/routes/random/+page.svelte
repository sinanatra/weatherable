<script>
    import { onMount } from "svelte";
    import Viz from "@components/Viz.svelte";
    import { writable } from "svelte/store";

    const seed = 42;
    let selectedDate = writable("2024-07-18");
    let selectedHour = writable("14");

    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function calculateAverage(item) {
        const ranges = [
            item.range,
            item.range1,
            item.range2,
            item.range3,
            item.range4,
        ];
        return ranges.reduce((a, b) => a + b, 0) / ranges.length;
    }

    function getClosestNumber(item) {
        let closestNumber = 1;

        if (item.mirror) closestNumber += 12;
        if (item.curveSmooth) closestNumber += 6;
        if (item.outline) closestNumber += 3;

        const average = calculateAverage(item);

        if (average < 0.33) closestNumber += 0;
        else if (average < 0.66) closestNumber += 1;
        else closestNumber += 2;

        return closestNumber;
    }

    function generateGuessedDataForAllClosestNumbers(seed) {
        const orderedDataArray = [];
        const maxClosestNumber = 24;

        for (let i = 1; i <= maxClosestNumber; i++) {
            const mirror = i > 12;
            const curveSmooth = i % 12 > 6;
            const outline = i % 6 > 3;

            let averageCategory;
            if (i % 3 === 1) {
                averageCategory = 0.1;
            } else if (i % 3 === 2) {
                averageCategory = 0.5;
            } else {
                averageCategory = 0.8;
            }

            const randomItem = {
                range: averageCategory * Math.random(),
                range1: averageCategory * Math.random(),
                range2: averageCategory * Math.random(),
                range3: averageCategory * Math.random(),
                range4: averageCategory * Math.random(),
                radio1: ["NW", "NE", "SW", "SE"][Math.floor(Math.random() * 4)],
                radio: mirror ? "Yes" : "No",
                lineThickness: 1,
                fillThickness: 0.05,
                curveSmooth,
                outline,
                mirror,
            };

            const average = calculateAverage(randomItem);
            const seededAverage = seededRandom(seed) * average;

            const guessedData = {
                temp: randomItem.range,
                uv: randomItem.range1,
                wrain_piezo: randomItem.range2,
                humidity: randomItem.range3,
                windspeed: randomItem.range4,

                len: seededAverage,

                curveSmooth: randomItem.curveSmooth,
                outline: randomItem.outline,
                mirror: randomItem.mirror,

                lineThickness: randomItem.lineThickness,
                fillThickness: randomItem.fillThickness,

                closestNumber: i, // Directly assign the expected closestNumber
            };

            orderedDataArray.push(guessedData);
        }

        return orderedDataArray;
    }

    let data = [];
    let guessedDataArray = [];

    async function fetchWeatherData(date, hour) {
        const response = await fetch(
            `https://zku-middleware.vercel.app/api/weather/date/?date=${date}&hour=${hour}`,
        );
        const json = await response.json();
        return json;
    }

    async function updateData() {
        const date = $selectedDate;
        const hour = $selectedHour;
        data = await fetchWeatherData(date, hour);
        guessedDataArray = generateGuessedDataForAllClosestNumbers(seed);
    }

    onMount(async () => {
        await updateData(); // Fetch initial data
    });
</script>

<article>
    <h2>Possible Visualizations to Print</h2>

    <section class="controls">
        <label>
            Date:
            <input type="date" bind:value={$selectedDate} />
        </label>
        <label>
            Hour:
            <input type="time" bind:value={$selectedHour} step="3600" />
        </label>
        <button on:click={updateData}>Update</button>
    </section>

    <section class="data">
        {#each guessedDataArray as guessedData, index}
            <div>
                {#if data.length > 0}
                    <Viz {data} {guessedData} />
                    <pre>{JSON.stringify(guessedData, undefined, 2)}</pre>
                {/if}
            </div>
        {/each}
    </section>
</article>

<style>
    h2 {
        font-size: 3em;
        text-align: center;
    }
    article {
        height: 100vh;
        padding: 40px;
        font-size: 18px;
    }

    .controls {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        justify-content: center;
        align-content: center;
        align-items: center;
    }

    .data {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    div {
        display: flex;
    }

    span,
    pre {
        line-height: 1;
        font-size: 0.7em;
    }
</style>
