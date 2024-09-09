<script>
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";

    export let currentInput;
    export let language; 

    $: text = currentInput?.answer ? currentInput.answer : "";
    $: range = currentInput?.range ? currentInput.range : 0.1;
    $: range1 = currentInput?.range1 ? currentInput.range1 : 0.1;
    $: range2 = currentInput?.range2 ? currentInput.range2 : 0.1;
    $: range3 = currentInput?.range3 ? currentInput.range3 : 0.1;
    $: range4 = currentInput?.range4 ? currentInput.range4 : 0.1;

    $: radio = currentInput?.radio ? currentInput.radio : "";
    $: radio1 = currentInput?.radio1 ? currentInput.radio1 : "";

    const dispatch = createEventDispatcher();

    function handleChange() {
        dispatch("change", { answer: text, radio, range, range1 });
    }

    const handleSubmit = async () => {
        if (!text.trim()) {
            alert(
                language === "EN"
                    ? "Text field cannot be empty"
                    : "Textfeld darf nicht leer sein",
            );
            return;
        }

        const postRequest = await fetch("/api/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answer: text,
                radio,
                radio1,
                range,
                range1,
                range2,
                range3,
                range4,
            }),
        });

        const responses = await Promise.all([postRequest]);
        const success = responses.every((response) => response.ok);

        if (success) {
            console.log(
                language === "EN"
                    ? "Data submitted successfully."
                    : "Daten erfolgreich übermittelt.",
            );
            goto(`/last`);
        } else {
            console.error(
                language === "EN"
                    ? "Failed to submit data."
                    : "Datenübermittlung fehlgeschlagen.",
            );
        }
    };

    function mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    function handleDirectionChange(value) {
        radio1 = value;
        handleChange();
    }
</script>

<article>
    <p style="margin-top: 10rem;">
        {#if language === "EN"}
            Scroll down and fill out the questionnaire to get your personal ZK/U
            weather tattoo
        {:else}
        Scrolle nach unten und beantworte Fragebogen, um dein persönliches ZK/U Wetter-Tattoo zu erhalten
        {/if}
    </p>
    <section dir="ltr">
        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "Which mood do you associate with the current weather?"
                    : "Welche Stimmung verbindest du mit dem aktuellen Wetter?"}
            </h2>
            <textarea
                name="answer"
                id="answer"
                bind:value={text}
                maxlength="240"
                lines="1"
                placeholder={language === "EN"
                    ? "write here..."
                    : "hier schreiben..."}
                required
                on:input={handleChange}
            ></textarea>
        </div>

        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "How warm does it feel outside right now?"
                    : "Wie warm fühlt es sich gerade draußen an?"}
            </h2>
            <span>
                -<input
                    type="range"
                    bind:value={range}
                    min="0.1"
                    max="1"
                    step="0.01"
                    on:input={handleChange}
                />+
            </span>
            <span>{parseInt(mapValue(range, 0.1, 1, 0, 40))}°</span>
        </div>

        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "How does the sun's intensity feel today?"
                    : "Wie intensiv fühlt sich die Sonne heute an?"}
            </h2>
            <span>
                -<input
                    type="range"
                    bind:value={range1}
                    min="0.1"
                    max="1"
                    step="0.01"
                    on:input={handleChange}
                />+
            </span>
            <span>{parseInt(mapValue(range1, 0.1, 1, 0, 11))} UV</span>
        </div>

        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "How much rain do you think has fallen over the past week?"
                    : "Was glaubst du, wie viel Regen in der letzten Woche gefallen ist?"}
            </h2>
            <span>
                -<input
                    type="range"
                    bind:value={range2}
                    min="0.1"
                    max="1"
                    step="0.01"
                    on:input={handleChange}
                />+
            </span>
            <span>{parseInt(mapValue(range2, 0.1, 1, 0, 100))} mm/h</span>
        </div>

        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "How humid does the air feel today?"
                    : "Wie feucht fühlt sich die Luft heute an?"}
            </h2>
            <span>
                -<input
                    type="range"
                    bind:value={range3}
                    min="0.1"
                    max="1"
                    step="0.01"
                    on:input={handleChange}
                />+
            </span>
            <span>{parseInt(mapValue(range3, 0.1, 1, 0, 100))}%</span>
        </div>

        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "In which direction do you think the wind is blowing?"
                    : "Was glaubst du, in welche Richtung der Wind gerade weht?"}
            </h2>
            <div class="wind-direction">
                <svg viewBox="0 0 600 600" class="arrows">
                    <defs>
                        <marker
                            id="arrowhead-hover"
                            markerWidth="6"
                            markerHeight="4"
                            refX="4.5"
                            refY="2"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 6 2, 0 4"
                                fill="yellow"
                                style="pointer-events: auto;"
                            />
                        </marker>
                        <marker
                            id="arrowhead"
                            markerWidth="6"
                            markerHeight="4"
                            refX="4.5"
                            refY="2"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 6 2, 0 4"
                                fill="#BCBCBC"
                                style="pointer-events: auto;"
                            />
                        </marker>
                        <marker
                            id="arrowhead-selected"
                            markerWidth="6"
                            markerHeight="4"
                            refX="4.5"
                            refY="2"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 6 2, 0 4"
                                fill="yellow"
                                style="pointer-events: auto;"
                            />
                        </marker>
                    </defs>
                    <line
                        id="arrow-N"
                        x1="250"
                        y1="250"
                        x2="250"
                        y2="50"
                        marker-end={radio1 === "N"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("N")}
                        class:selected={radio1 === "N"}
                    />
                    <line
                        id="arrow-NNE"
                        x1="250"
                        y1="250"
                        x2="325"
                        y2="65"
                        marker-end={radio1 === "NNE"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("NNE")}
                        class:selected={radio1 === "NNE"}
                    />
                    <line
                        id="arrow-NE"
                        x1="250"
                        y1="250"
                        x2="400"
                        y2="100"
                        marker-end={radio1 === "NE"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("NE")}
                        class:selected={radio1 === "NE"}
                    />
                    <line
                        id="arrow-ENE"
                        x1="250"
                        y1="250"
                        x2="450"
                        y2="175"
                        marker-end={radio1 === "ENE"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("ENE")}
                        class:selected={radio1 === "ENE"}
                    />
                    <line
                        id="arrow-E"
                        x1="250"
                        y1="250"
                        x2="460"
                        y2="250"
                        marker-end={radio1 === "E"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("E")}
                        class:selected={radio1 === "E"}
                    />
                    <line
                        id="arrow-ESE"
                        x1="250"
                        y1="250"
                        x2="450"
                        y2="325"
                        marker-end={radio1 === "ESE"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("ESE")}
                        class:selected={radio1 === "ESE"}
                    />
                    <line
                        id="arrow-SE"
                        x1="250"
                        y1="250"
                        x2="410"
                        y2="390"
                        marker-end={radio1 === "SE"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("SE")}
                        class:selected={radio1 === "SE"}
                    />
                    <line
                        id="arrow-SSE"
                        x1="250"
                        y1="250"
                        x2="335"
                        y2="435"
                        marker-end={radio1 === "SSE"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("SSE")}
                        class:selected={radio1 === "SSE"}
                    />
                    <line
                        id="arrow-S"
                        x1="250"
                        y1="250"
                        x2="250"
                        y2="450"
                        marker-end={radio1 === "S"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("S")}
                        class:selected={radio1 === "S"}
                    />
                    <line
                        id="arrow-SSW"
                        x1="250"
                        y1="250"
                        x2="170"
                        y2="437"
                        marker-end={radio1 === "SSW"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("SSW")}
                        class:selected={radio1 === "SSW"}
                    />
                    <line
                        id="arrow-SW"
                        x1="250"
                        y1="250"
                        x2="100"
                        y2="400"
                        marker-end={radio1 === "SW"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("SW")}
                        class:selected={radio1 === "SW"}
                    />
                    <line
                        id="arrow-WSW"
                        x1="250"
                        y1="250"
                        x2="50"
                        y2="325"
                        marker-end={radio1 === "WSW"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("WSW")}
                        class:selected={radio1 === "WSW"}
                    />
                    <line
                        id="arrow-W"
                        x1="250"
                        y1="250"
                        x2="40"
                        y2="250"
                        marker-end={radio1 === "W"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("W")}
                        class:selected={radio1 === "W"}
                    />
                    <line
                        id="arrow-WNW"
                        x1="250"
                        y1="250"
                        x2="50"
                        y2="175"
                        marker-end={radio1 === "WNW"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("WNW")}
                        class:selected={radio1 === "WNW"}
                    />
                    <line
                        id="arrow-NW"
                        x1="250"
                        y1="250"
                        x2="100"
                        y2="100"
                        marker-end={radio1 === "NW"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("NW")}
                        class:selected={radio1 === "NW"}
                    />
                    <line
                        id="arrow-NNW"
                        x1="250"
                        y1="250"
                        x2="165"
                        y2="65"
                        marker-end={radio1 === "NNW"
                            ? "url(#arrowhead-selected)"
                            : "url(#arrowhead)"}
                        on:click={() => handleDirectionChange("NNW")}
                        class:selected={radio1 === "NNW"}
                    />
                </svg>
            </div>
        </div>

        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "How strong do you sense the wind today?"
                    : "Wie kräftig fühlt sich der Wind heute an?"}
            </h2>
            <span>
                -<input
                    type="range"
                    bind:value={range4}
                    min="0.1"
                    max="1"
                    step="0.01"
                    on:input={handleChange}
                />+
            </span>
            <span>{parseInt(mapValue(range4, 0.1, 1, 0, 70))} m/s</span>
        </div>

        <div class="input-group">
            <h2>
                {language === "EN"
                    ? "Were you checking today's weather forecast?"
                    : "Hast du heute die Wettervorhersage überprüft?"}
            </h2>
            <label>
                <input
                    type="radio"
                    bind:group={radio}
                    value={"Yes"}
                    on:change={handleChange}
                />
                {language === "EN" ? "Yes" : "Ja"}
            </label>
            <label>
                <input
                    type="radio"
                    bind:group={radio}
                    value={"No"}
                    on:change={handleChange}
                />
                {language === "EN" ? "No" : "Nein"}
            </label>
        </div>

        {#if !text || !radio || !radio1}
            <button disabled>{language === "EN" ? "Submit" : "Absenden"}</button
            >
        {:else}
            <button on:click={handleSubmit}
                >{language === "EN" ? "Submit" : "Absenden"}</button
            >
        {/if}
    </section>
</article>

<style>
    p {
        text-align: center;
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

    h1,
    h2,
    h3 {
        font-weight: normal;
        margin: 5px;
    }

    span {
        font-size: 40px;
        vertical-align: middle;
    }

    section {
        margin-top: 300px;
        margin-bottom: 50px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    :global(.stick) section {
        scroll-snap-type: y mandatory;
        scroll-snap-align: middle;
    }

    .input-group {
        margin-bottom: 4em;
        width: 90%;
    }

    h2 {
        font-size: 1.25em;
        line-height: 0.95em;
        transform: scaleY(1.2);
        transform-origin: bottom;
        margin-bottom: 30px;
    }

    textarea,
    input[type="range"] {
        width: 80%;
        height: 150px;
        font-size: 1em;
        resize: none;
        font-family: sans-serif;
    }

    textarea {
        background: none;
        box-shadow: none;
        border: 1px solid #565656;
        color: yellow;
        font-size: 0.6em;
        margin: 50px 0;
        padding: 10px;
    }

    input[type="range"] {
        appearance: none;
        background: #565656;
        height: 30px;
        cursor: grab;
        accent-color: red;
    }

    input[type="range"]:active {
        cursor: grabbing;
    }

    input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 30px;
        height: 30px;
        background: yellow;
    }

    input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: yellow;
    }

    input[type="radio"] {
        visibility: hidden;
        display: none;
        width: 0;
    }

    label:has(input[type="radio"]) {
        cursor: pointer;
        margin-right: 20px;
    }

    label:has(input[type="radio"]:checked) {
        color: yellow;
    }

    button {
        display: block;
        margin: 0 auto;
        font-size: 220px;
        cursor: pointer;
        margin-bottom: 200px;
    }

    a {
        color: white;
    }

    .wind-direction {
        position: relative;
        width: 500px;
        height: 500px;
        margin: 100px auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .arrows line {
        cursor: pointer;
        stroke-width: 10;
        stroke: #bcbcbc;
    }

    .arrows line:hover,
    .arrows line.selected {
        stroke: yellow;
    }

    .arrows line:hover {
        stroke: yellow;
        marker-end: url(#arrowhead-hover);
    }

    .arrows text {
        fill: yellow;
        font-size: 20px;
    }
</style>
