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
            "https://zku-middleware.vercel.app/api/recent",
        );
        const json = await response.json();
        return json;
    }

    let data = [];
    let guessed = [];

    $: guessedDataArray = guessed.map((item) => {
        const ranges = [
            item.range,
            item.range1,
            item.range2,
            item.range3,
            item.range4,
        ];
        const average = ranges.reduce((a, b) => a + b, 0) / ranges.length;

        return {
            temp: item.range,
            uv: item.range1,
            wrain_piezo: item.range2,
            humidity: item.range3,
            windspeed: item.range4,

            len: average,

            curveSmooth: item.radio1 == "NW" || item.radio1 == "NE",
            outline: item.radio1 == "SW" || item.radio1 == "SE",
            mirror: item.radio == "Yes" || item.radio == "No",

            lineThickness: item.lineThickness || 1,
            fillThickness: item.fillThickness || 0.05,

            answer: item.answer,
            id: item._id,
        };
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
                    <span>
                        {guessedData.answer} / {guessedData.id}
                    </span>
                    <Viz {data} {guessedData} />
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

    span {
        line-height: 1;
    }
</style>
