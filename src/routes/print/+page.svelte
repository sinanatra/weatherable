<script>
    import { onMount } from "svelte";
    import PrintViz from "@components/PrintViz.svelte";
    import { writable } from "svelte/store";

    const seed = 42;

    let selectedDate = writable("2024-07-18");
    let selectedHour = writable("14:00:00");
    let repeatPatterns = writable(false);
    let layout = writable("default"); // New layout state

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
        const totalWeight = ranges.reduce(
            (sum, value) => sum + Math.pow(value, 2),
            0,
        );
        const weightedSum = ranges.reduce(
            (sum, value) => sum + value * Math.pow(value, 2),
            0,
        );

        return weightedSum / totalWeight;
    }

    function generateAllCombinations(seed, repeat) {
        const orderedDataArray = [];
        const radioOptions = [
            { mirror: false, curveSmooth: false, outline: false },
            { mirror: false, curveSmooth: false, outline: true },
            { mirror: false, curveSmooth: true, outline: false },
            { mirror: false, curveSmooth: true, outline: true },
            { mirror: true, curveSmooth: false, outline: false },
            { mirror: true, curveSmooth: false, outline: true },
            { mirror: true, curveSmooth: true, outline: false },
            { mirror: true, curveSmooth: true, outline: true },
        ];

        const averageCategories = [
            { min: 0, max: 0.3 },
            { min: 0.3, max: 0.6 },
            { min: 0.6, max: 1.0 },
        ];

        radioOptions.forEach((radioOption, index) => {
            averageCategories.forEach((category) => {
                const randomItem = {
                    range:
                        category.min +
                        (category.max - category.min) * Math.random(),
                    range1:
                        category.min +
                        (category.max - category.min) * Math.random(),
                    range2:
                        category.min +
                        (category.max - category.min) * Math.random(),
                    range3:
                        category.min +
                        (category.max - category.min) * Math.random(),
                    range4:
                        category.min +
                        (category.max - category.min) * Math.random(),
                    radio1: ["NW", "NE", "SW", "SE"][
                        Math.floor(Math.random() * 4)
                    ],
                    radio: radioOption.mirror ? "Yes" : "No",
                    lineThickness: 1,
                    fillThickness: 0.1,
                    curveSmooth: radioOption.curveSmooth,
                    outline: radioOption.outline,
                    mirror: radioOption.mirror,
                };

                const average = calculateAverage(randomItem);
                const seededAverage =
                    (seededRandom(seed) * 0.5 + 0.5) * average;

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

                    closestNumber:
                        index * 3 + averageCategories.indexOf(category) + 1,
                };

                if (repeat) {
                    for (let i = 0; i < 24; i++) {
                        orderedDataArray.push(guessedData);
                    }
                } else {
                    orderedDataArray.push(guessedData);
                }
            });
        });

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

        const repeat = $repeatPatterns;
        data = [...fetchedData];
        guessedDataArray = generateAllCombinations(seed, repeat);
    }

    function printPage() {
        window.print();
    }

    onMount(async () => {
        await updateData();
    });
</script>

<article>
    <div class="head">
        <h2>All Possible Variations for a Specific Hour</h2>

        <section class="controls">
            <label>
                Date:
                <input type="date" bind:value={$selectedDate} />
            </label>
            <label>
                Hour:
                <input type="time" bind:value={$selectedHour} step="3600" />
            </label>
            <label>
                Repeat Patterns:
                <input type="checkbox" bind:checked={$repeatPatterns} />
            </label>
            <label>
                Layout:
                <select bind:value={$layout}>
                    <option value="default">Default</option>
                    <option value="fullWidth">Full Width</option>
                </select>
            </label>
            <button on:click={updateData}>Update</button>
            <button on:click={printPage}>Print</button>
        </section>
    </div>
    <section class="data" class:full-width={$layout === 'fullWidth'} class:square={$layout === 'square'}>
        {#each guessedDataArray as guessedData, index}
            <div class="visualization">
                {#if data.length > 0}
                    <h1>{guessedData.closestNumber}</h1>
                    <PrintViz {data} {guessedData} layout={$layout} />
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

    label {
        color: black;
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
        padding-left: 10px;
    }

    .data {
        display: flex;
        flex-wrap: wrap;
        page-break-inside: avoid;
    }

    .data.full-width .visualization {
        width: 100%; 
    }

  
    /* .data:not(.full-width):not(.square) .visualization {
        width: 33.33%;
    } */

    .visualization {
        display: flex;
        align-items: center;
        justify-content: center;
        color: red;
        /* padding: 5px; */
    }

    h1 {
        font-size: 6px;
        line-height: 1;
        margin-top: 5px;
    }

    .head {
        padding: 10px;
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

        .data {
            page-break-before: always;
        }
    }
</style>
