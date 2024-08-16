<script>
    import { onMount } from "svelte";
    import Viz from "@components/Viz.svelte";

    async function fetchData() {
        const res = await fetch("/api/last");
        const json = await res.json();
        return json;
    }

    async function fetchRecentData() {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/recent",
        );
        const json = await response.json();
        let datum = json;
        return datum;
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

        if (guessedData.mirror) closestNumber += 12; // mirror flag influences range significantly
        if (guessedData.curveSmooth) closestNumber += 6;
        if (guessedData.outline) closestNumber += 3;

        // Adjust based on the average of the ranges
        const average = calculateAverage(guessedData);

        if (average < 0.33) closestNumber += 0;
        else if (average < 0.66) closestNumber += 1;
        else closestNumber += 2;

        return closestNumber;
    }

    let data = [];
    let guessed = [];
    let guessedData = {};

    function updateGuessedData(key, value) {
        guessedData[key] =
            key === "curveSmooth" || key === "outline" || key === "mirror"
                ? value
                : parseFloat(value);

        // Recalculate average and closestNumber
        guessedData.closestNumber = getClosestNumber(guessedData);
    }

    $: if (guessed.length > 0) {
        const average = calculateAverage(guessed[0]);
        const seededAverage = seededRandom(seed) * average;

        guessedData = {
            temp: guessed[0]?.range,
            uv: guessed[0]?.range1,
            wrain_piezo: guessed[0]?.range2,
            humidity: guessed[0]?.range3,
            windspeed: guessed[0]?.range4,

            len: seededAverage || 0.5,

            curveSmooth:
                guessed[0]?.radio1 == "NW" || guessed[0]?.radio1 == "NE",
            outline: guessed[0]?.radio1 == "SW" || guessed[0]?.radio1 == "SE",
            mirror: guessed[0]?.radio == "Yes",

            lineThickness: guessed[0]?.lineThickness || 1,
            fillThickness: guessed[0]?.fillThickness || 0.05,
        };

        // guessedData.closestNumber = getClosestNumber(guessedData);
    }

    onMount(async () => {
        guessed = await fetchData();
        data = await fetchRecentData();
        guessedData.closestNumber = getClosestNumber(guessedData);
    });
</script>

<article>
    {#if guessed.length > 0}
        {#if guessedData?.closestNumber}
            <h1>
                {guessedData.closestNumber}
            </h1>
        {/if}
        <section class="data">
            {#if data.length > 0}
                <Viz {data} {guessedData} />
            {/if}
        </section>
        <section class="controls">
            <label>
                Temp:
                <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={guessedData.temp}
                    on:input={(e) => updateGuessedData("temp", e.target.value)}
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
                    on:input={(e) => updateGuessedData("uv", e.target.value)}
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
                        updateGuessedData("wrain_piezo", e.target.value)}
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
                        updateGuessedData("humidity", e.target.value)}
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
                        updateGuessedData("windspeed", e.target.value)}
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
                    on:input={(e) => updateGuessedData("len", e.target.value)}
                />
                <span>{guessedData.len}</span>
            </label>
            <label>
                Curve Smooth:
                <input
                    type="checkbox"
                    checked={guessedData.curveSmooth}
                    on:change={(e) =>
                        updateGuessedData("curveSmooth", e.target.checked)}
                />
            </label>
            <label>
                Outline:
                <input
                    type="checkbox"
                    checked={guessedData.outline}
                    on:change={(e) =>
                        updateGuessedData("outline", e.target.checked)}
                />
            </label>
            <label>
                Mirror:
                <input
                    type="checkbox"
                    checked={guessedData.mirror}
                    on:change={(e) =>
                        updateGuessedData("mirror", e.target.checked)}
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
                        updateGuessedData("lineThickness", e.target.value)}
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
                        updateGuessedData("fillThickness", e.target.value)}
                />
                <span>{guessedData.fillThickness}</span>
            </label>
        </section>
    {/if}
</article>

<style>
    p,
    h1 {
        line-height: 1;
    }
    article {
        height: 100vh;
        padding: 40px;
        font-size: 18px;
    }

    label {
        display: flex;
        /* align-items center; */
        gap: 10px;
        line-height: 18px;
    }
</style>
