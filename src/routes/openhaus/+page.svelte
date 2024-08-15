<script>
    import { onMount } from "svelte";
    import Viz from "@components/Viz.svelte";

    // Function to fetch data for a specific date
    async function fetchData(date) {
        const encodedDate = encodeURIComponent(date);
        const res = await fetch(`/api/getdate?date=${encodedDate}`);
        const json = await res.json();
        return json;
    }

    // Function to fetch recent data
    async function fetchRecentData() {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/weather/date/?date=2024-07-18&hour=21",
        );
        const json = await response.json();
        return json;
    }

    let data = [];
    let guessed = [];

    const seed = 42;

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

        if (item.mirror) closestNumber += 12; // mirror flag influences range significantly
        if (item.curveSmooth) closestNumber += 6;
        if (item.outline) closestNumber += 3;

        const average = calculateAverage(item);

        if (average < 0.33) closestNumber += 0;
        else if (average < 0.66) closestNumber += 1;
        else closestNumber += 2;

        return closestNumber;
    }

    $: guessedDataArray = guessed.map((item) => {
        const average = calculateAverage(item);
        const seededAverage = seededRandom(seed) * average;

        const guessedData = {
            temp: item.range,
            uv: item.range1,
            wrain_piezo: item.range2,
            humidity: item.range3,
            windspeed: item.range4,

            len: seededAverage,

            curveSmooth: item.radio1 == "NW" || item.radio1 == "NE",
            outline: item.range <= 0.5,
            mirror: item.radio == "Yes",

            lineThickness: item.lineThickness || 1,
            fillThickness: item.fillThickness || 0.05,

            answer: item.answer,
            id: item._id,
        };

        // Assign the closest number using the new logic
        guessedData.closestNumber = getClosestNumber(guessedData);

        return guessedData;
    });

    onMount(async () => {
        guessed = await fetchData("2024-07-18");
        data = await fetchRecentData();
    });

    function updateGuessedData(index, key, value) {
        guessedDataArray[index][key] = parseFloat(value);
    }
</script>

<article>
    <h2>Results from the tattoo session at the ZK/U openhaus</h2>
    {#if guessed.length > 0}
        <section class="data">
            {#each guessedDataArray as guessedData, index}
                {#if data.length > 0}
                    <div>
                        <Viz {data} {guessedData} />
                        <pre>{JSON.stringify(guessedData, undefined, 2)}</pre>
                    </div>
                {/if}
            {/each}
        </section>
    {/if}
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
