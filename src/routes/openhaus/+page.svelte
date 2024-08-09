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

    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }
    const seed = 42;

    $: guessedDataArray = guessed.map((item) => {
        const ranges = [
            item.range,
            item.range1,
            item.range2,
            item.range3,
            item.range4,
        ];

        const average = ranges.reduce((a, b) => a + b, 0) / ranges.length;
        const seededAverage = seededRandom(seed) * average;

        return {
            temp: item.range,
            uv: item.range1,
            wrain_piezo: item.range2,
            humidity: item.range3,
            windspeed: item.range4,

            len: seededAverage,

            curveSmooth: item.radio1 == "NW" || item.radio1 == "NE",

            outline: average <= 0.5 ? true : false,

            mirror: item.radio == "Yes" || item.radio == "No",

            lineThickness: item.lineThickness || 0.2,
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
                    <div>
                        <Viz {data} {guessedData} />
                        <pre>{JSON.stringify(guessedData, undefined, 2)}</pre>
                    </div>
                    <!-- <section class="controls">
                        <label>
                            Temp:
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={guessedData.temp}
                                on:input={(e) =>
                                    updateGuessedData("temp", e.target.value)}
                            />
                            <span>{guessedData.temp}</span>
                        </label>
                        <label>
                            uv:
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={guessedData.uv}
                                on:input={(e) =>
                                    updateGuessedData("uv", e.target.value)}
                            />
                            <span>{guessedData.uv}</span>
                        </label>
                        <label>
                            weekRain:
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={guessedData.wrain_piezo}
                                on:input={(e) =>
                                    updateGuessedData(
                                        "wrain_piezo",
                                        e.target.value,
                                    )}
                            />
                            <span>{guessedData.wrain_piezo}</span>
                        </label>
                        <label>
                            Humidity:
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={guessedData.humidity}
                                on:input={(e) =>
                                    updateGuessedData(
                                        "humidity",
                                        e.target.value,
                                    )}
                            />
                            <span>{guessedData.humidity}</span>
                        </label>
                        <label>
                            windspeed:
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={guessedData.windspeed}
                                on:input={(e) =>
                                    updateGuessedData(
                                        "windspeed",
                                        e.target.value,
                                    )}
                            />
                            <span>{guessedData.windspeed}</span>
                        </label>
                        <label>
                            Data length:
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={guessedData.len}
                                on:input={(e) =>
                                    updateGuessedData("len", e.target.value)}
                            />
                            <span>{guessedData.len}</span>
                        </label>
                        <label>
                            Curve Smooth:
                            <input
                                type="checkbox"
                                checked={guessedData.curveSmooth}
                                on:change={(e) =>
                                    (guessedData.curveSmooth =
                                        e.target.checked)}
                            />
                        </label>
                        <label>
                            Outline:
                            <input
                                type="checkbox"
                                checked={guessedData.outline}
                                on:change={(e) =>
                                    (guessedData.outline = e.target.checked)}
                            />
                        </label>
                        <label>
                            Mirror:
                            <input
                                type="checkbox"
                                checked={guessedData.mirror}
                                on:change={(e) =>
                                    (guessedData.mirror = e.target.checked)}
                            />
                        </label>
                        <hr />
                        <label>
                            Line:
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={guessedData.lineThickness}
                                on:input={(e) =>
                                    updateGuessedData(
                                        "lineThickness",
                                        e.target.value,
                                    )}
                            />
                            <span>{guessedData.lineThickness}</span>
                        </label>
                        <label>
                            Offset:
                            <input
                                type="range"
                                min="0"
                                max="0.5"
                                step="0.05"
                                value={guessedData.fillThickness}
                                on:input={(e) =>
                                    updateGuessedData(
                                        "fillThickness",
                                        e.target.value,
                                    )}
                            />
                            <span>{guessedData.fillThickness}</span>
                        </label>
                    </section> -->
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
