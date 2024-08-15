<script>
    import { onMount } from "svelte";
    import Viz from "@components/Viz.svelte";
    import * as d3 from "d3";

    async function fetchData() {
        const res = await fetch(`/api/last`);
        const json = await res.json();
        return json;
    }

    async function fetchRecentData() {
        const data = await d3.csv("/data/zku_weatherstation_main_hour.csv");
        return data;
    }

    let data = [];
    let guessed = [];

    const baselineState = {
        temp: 0.5,
        uv: 0.5,
        wrain_piezo: 0.5,
        humidity: 0.5,
        windspeed: 0.5,
        len: 0.5,
        curveSmooth: false,
        outline: false,
        mirror: false,
    };

    // Adjust weights for boolean factors
    const booleanWeight = 5;

    function calculateAverage(guessedData) {
        const keys = [
            "temp",
            "uv",
            "wrain_piezo",
            "humidity",
            "windspeed",
            "len",
        ];
        let total = 0;

        keys.forEach((key) => {
            total += guessedData[key];
        });

        // Add weighted contributions of the boolean factors
        total += (guessedData.curveSmooth ? 1 : 0) * booleanWeight;
        total += (guessedData.outline ? 1 : 0) * booleanWeight;
        total += (guessedData.mirror ? 1 : 0) * booleanWeight;

        // Calculate the average by dividing by the number of elements, considering the weight
        return total / (keys.length + 3 * booleanWeight);
    }

    function mapUniqueCombinationToNumber(guessedData) {
        // Define a unique base number for each combination of boolean values
        let booleanBase = 0;
        if (guessedData.curveSmooth) booleanBase += 7; // Assign 7 for curveSmooth true
        if (guessedData.outline) booleanBase += 5; // Assign 5 for outline true
        if (guessedData.mirror) booleanBase += 3; // Assign 3 for mirror true

        // Calculate the numeric average for the remaining values
        const average = calculateAverage(guessedData);

        // Map this combination to a unique number by adding the booleanBase
        return Math.round(average * 5 + booleanBase);
    }

    function getClosestNumber(guessedData) {
        return mapUniqueCombinationToNumber(guessedData);
    }

    let closestNumber = 1;

    $: closestNumber = getClosestNumber(guessedData);

    let guessedData = {
        temp: baselineState.temp,
        uv: baselineState.uv,
        wrain_piezo: baselineState.wrain_piezo,
        humidity: baselineState.humidity,
        windspeed: baselineState.windspeed,
        len: baselineState.len,

        curveSmooth: baselineState.curveSmooth,
        outline: baselineState.outline,
        mirror: baselineState.mirror,

        lineThickness: 1,
        fillThickness: 0.05,

        answer: guessed[0]?.answer,
        id: guessed[0]?._id,
    };

    onMount(async () => {
        guessed = await fetchData();
        data = await fetchRecentData();
    });

    function updateGuessedData(key, value) {
        if (typeof guessedData[key] === "boolean") {
            guessedData[key] = value === "true";
        } else {
            guessedData[key] = parseFloat(value);
        }
    }
</script>

<article>
    {#if guessed.length > 0}
        <section class="data">
            {#if data.length > 0}
                <div>
                    <Viz {data} {guessedData} />
                </div>
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
                        updateGuessedData(
                            "curveSmooth",
                            e.target.checked.toString(),
                        )}
                />
            </label>
            <label>
                Outline:
                <input
                    type="checkbox"
                    checked={guessedData.outline}
                    on:change={(e) =>
                        updateGuessedData(
                            "outline",
                            e.target.checked.toString(),
                        )}
                />
            </label>
            <label>
                Mirror:
                <input
                    type="checkbox"
                    checked={guessedData.mirror}
                    on:change={(e) =>
                        updateGuessedData(
                            "mirror",
                            e.target.checked.toString(),
                        )}
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
            <div>
                <p>The visualization is closest to step: {closestNumber}</p>
            </div>
        </section>
    {/if}
</article>

<style>
    article {
        height: 100vh;
        padding: 40px;
        font-size: 18px;
    }

    label {
        display: flex;
        align-items: center;
        gap: 10px;
        line-height: 18px;
    }
</style>
