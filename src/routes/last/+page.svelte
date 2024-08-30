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

    async function fetchWeatherData(date, hour) {
        const response = await fetch(
            `https://zku-middleware.vercel.app/api/weather/date/?date=2024-07-18&hour=14:00:00`,
        );
        const json = await response.json();
        return json;
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

    let data = [];
    let guessed = [];
    let guessedData = {};

    function updateGuessedData(key, value) {
        guessedData[key] =
            key === "curveSmooth" || key === "outline" || key === "mirror"
                ? value
                : parseFloat(value);

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

            curveSmooth: ["N", "NNE", "NE", "ENE"].includes(guessed[0]?.radio1),
            outline: ["S", "SSW", "SW", "WSW"].includes(guessed[0]?.radio1),
            mirror: guessed[0]?.radio == "Yes",

            lineThickness: guessed[0]?.lineThickness || 1,
            fillThickness: guessed[0]?.fillThickness || 0.1,
        };
    }

    onMount(async () => {
        guessed = await fetchData();
        // data = await fetchWeatherData();
        data = await fetchRecentData();

        guessedData.closestNumber = getClosestNumber(guessedData);
    });

    // $: console.log(guessed[0]);
</script>

<article>
    <div>
        {#if guessed.length > 0}
            <section class="data">
                {#if data.length > 0}
                    <div>
                        <Viz {data} {guessedData} invert={true} />
                    </div>
                {/if}
            </section>

            <p>Reach a tattoo operator and wait for your number:</p>
            <h1>{guessed[0]?.dailyId}</h1>
            <!-- <h1>{guessedData.closestNumber}</h1> -->

            <p class="again">
                <a href="/questionnaire">Start again</a>
            </p>
        {/if}
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
                on:input={(e) => updateGuessedData("humidity", e.target.value)}
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
                on:input={(e) => updateGuessedData("windspeed", e.target.value)}
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
                on:change={(e) => updateGuessedData("mirror", e.target.checked)}
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
    </section> -->
</article>

<style>
    article {
        /* height: 100vh; */
        font-size: 18px;
        color: white;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        align-content: space-around;
        justify-content: center;
    }

    div,
    h1 {
        color: aliceblue;
        align-items: center;
        text-align: center;
        text-shadow: unset;
    }

    label {
        display: flex;
        align-items: center;
        gap: 10px;
        line-height: 18px;
    }

    p {
        display: block;
        font-size: 2vw;
        align-items: center;
    }

    .again {
        margin-top: 100px;
    }
    a {
        color: whitesmoke;
    }
    h1 {
        display: block;
        font-size: 20vw;
        align-items: center;
        color: yellow;
    }

    article {
        font-family:
            Arial Narrow,
            Helvetica,
            sans-serif;
        background-color: black;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
        font-size: 6vw;
        line-height: 1.2em;

        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-font-smoothing: antialiased;
        -o-font-smoothing: antialiased;
    }

    :global(h1, h2, h3) {
        font-weight: normal;
        margin: 5px;

        /* background-color: #565656; */
        /* color: transparent; */
        text-shadow: 0px 2px 3px rgba(255, 255, 255, 0.5);
        /* -webkit-background-clip: text;
        -moz-background-clip: text;
        background-clip: text; */
    }
</style>
