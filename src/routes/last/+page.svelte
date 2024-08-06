<script>
    import { onMount } from "svelte";
    import Viz from "@components/Viz.svelte";

    async function fetchData() {
        const res = await fetch(`/api/last`);
        const json = await res.json();
        return json;
    }

    async function fetchRecentData() {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/recent",
        );
        const json = await response.json();
        return json; //.slice(0, json.length / 2);
    }

    let data = [];
    let guessed = [];

    // $: console.log(guessed[0]);

    $: guessedData = {
        temp: guessed[0]?.range,
        uv: guessed[0]?.range1,
        wrain_piezo: guessed[0]?.range2,
        humidity: guessed[0]?.range3,
        windspeed: guessed[0]?.range4,

        len: guessed[0]?.range1, //fix

        curveSmooth: true
            ? guessed[0]?.radio1 == "NW" || guessed[0]?.radio1 == "NE"
            : false,

        outline: true
            ? guessed[0]?.radio1 == "SW" || guessed[0]?.radio1 == "SE"
            : false,
        mirror: true
            ? guessed[0]?.radio == "Yes" || guessed[0]?.radio == "No"
            : false,
    };

    // $: guessedData = {
    //     temp: 0.4,
    //     uv: 0.5,
    //     weekRain: 0.4,
    //     humidity: 0.5,
    //     rainChance: 0.9,
    //     curveSmooth: false,
    //     outline: false,
    // };

    onMount(async () => {
        guessed = await fetchData();
        data = await fetchRecentData();
    });

    function updateGuessedData(key, value) {
        guessedData[key] = parseFloat(value);
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
                        (guessedData.curveSmooth = e.target.checked)}
                />
            </label>
            <label>
                Outline:
                <input
                    type="checkbox"
                    checked={guessedData.outline}
                    on:change={(e) => (guessedData.outline = e.target.checked)}
                />
            </label>
            <label>
                Mirror:
                <input
                    type="checkbox"
                    checked={guessedData.mirror}
                    on:change={(e) => (guessedData.mirror = e.target.checked)}
                />
            </label>
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
