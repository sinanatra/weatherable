<script>
    import { onMount } from "svelte";
    import PrintViz from "@components/PrintViz.svelte";
    import { writable } from "svelte/store";

    const seed = 42;
    let selectedDate = writable("2024-07-18");
    let selectedHour = writable("14:00:00");

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
        const fetchedData = await fetchWeatherData(date, hour);

        // Update `data` and `guessedDataArray` with new references
        data = [...fetchedData];
        guessedDataArray = generateGuessedDataForAllClosestNumbers(seed);
    }

    function printPage() {
        window.print();
    }

    onMount(async () => {
        await updateData(); // Fetch initial data
    });
</script>

<article>
    <div class="head">
        <h2>24 tribals for a specific hour</h2>

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
            <button on:click={printPage}>Print</button>
        </section>
    </div>
    <section class="data">
        {#each guessedDataArray as guessedData, index}
            <div class="visualization">
                {#if data.length > 0}
                    <PrintViz {data} {guessedData} />
                    <h1>{guessedData.closestNumber}</h1>
                {/if}
            </div>
        {/each}
    </section>
</article>

<style>
    @page {
        size: A4;
        margin: 0;
    }

    body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        max-width: 210mm; /* Ensure content fits within A4 page width */
    }

    h2 {
        font-size: 1.5em;
        line-height: 1.5;
        background-color: none;
        color: black;
        text-shadow: none;
    }

    article {
        background-color: white;

        font-size: 12px;
        max-width: 21cm;
        margin: 0 auto;
    }

    .controls {
        display: flex;
        gap: 5px;
        margin-bottom: 20px;
        line-height: 1;
    }

    .data {
        display: flex;
        flex-wrap: wrap;
    }

    .visualization {
        display: flex;
        /* flex-direction: column; */
        align-items: center;
        justify-content: center;
    }

    h1 {
        color: black;
        font-size: 6px;
        line-height: 1;
        margin-top: 5px;
    }

    @media print {
        .head {
            display: none;
        }

        h1 {
            color: black;
            font-size: 6px;
        }

        article {
            font-size: 10px;
        }
    }
</style>
