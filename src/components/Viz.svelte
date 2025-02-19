<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";

    export let data;
    export let guessedData;
    export let invert;

    let canvas;
    let context;
    let width = 1180; //10cm
    let height = 236; // 2cm

    let margin = { top: 20, right: 10, bottom: 0, left: 10 };

    onMount(() => {
        context = canvas.getContext("2d");
        if (window.devicePixelRatio > 1) {
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;

            canvas.width = canvasWidth * window.devicePixelRatio;
            canvas.height = canvasHeight * window.devicePixelRatio;
            canvas.style.width = canvasWidth + "px";
            canvas.style.height = canvasHeight + "px";

            context.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    });

    $: if (context && guessedData) {
        drawVisualization();
    }

    function drawVisualization() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        let diff = mapValue(guessedData.len, 0, 1, data.length - 1, 5);

        if (guessedData.outline) {
            diff = mapValue(guessedData.len, 0, 5, data.length, 5);
        }

        let fullData = [];

        for (let i = diff; i < data.length; i++) {
            let slicedData = data.slice(0, i);
            if (guessedData.mirror) {
                fullData = [...slicedData, ...mirrorData(slicedData)];
            } else {
                fullData = slicedData;
            }
            tribalVis(fullData, "temp");
            tribalVis(fullData, "uv");
            tribalVis(fullData, "wrain_piezo");
            tribalVis(fullData, "windspeed");
            tribalVis(fullData, "humidity");
        }
    }

    function mirrorData(data) {
        return data.slice(1, -1).reverse();
    }

    function tribalVis(data, dim) {
        let yExtent = d3.extent(data, (d) => +d[dim]);

        if (yExtent[0] === yExtent[1]) {
            return;
        } else {
            yExtent[0] =
                +yExtent[0] - +guessedData[dim] + guessedData.fillThickness;
        }

        const xScale = d3
            .scaleLinear()
            .domain([0, data.length - 1])
            .range([margin.left, width - margin.right]);

        const yScale = d3
            .scaleLinear()
            .domain([yExtent[0] - 0.1, yExtent[1] + 0.1])
            .range([height - margin.bottom, margin.top]);

        const area = d3
            .area()
            .x((d, i) => xScale(i))
            .y0((d) => yScale(d[dim]))
            .y1((d, i) => {
                if (i !== 0 && i !== data.length - 1) {
                    return yScale(
                        d[dim] -
                            guessedData[dim] * (1 / (i * 0.3 + 1)) +
                            guessedData.fillThickness * 2,
                    );
                } else {
                    return yScale(d[dim]);
                }
            })
            .context(context);

        if (guessedData.curveSmooth) {
            area.curve(d3.curveBasis);
        } else {
            area.curve(d3.curveBumpY);
        }

        if (guessedData.outline) {
            context.beginPath();
            area(data);
            context.lineWidth = guessedData.lineThickness + 10;
            context.strokeStyle = invert ? "white" : "black";
            context.lineWidth = guessedData.lineThickness;
            context.strokeStyle = invert ? "white" : "black";
            context.stroke();
            context.fillStyle = "rgba(255,255,255,0)";
            context.fill();
        } else {
            context.beginPath();
            area(data);
            context.lineWidth = guessedData.lineThickness + 1;
            context.strokeStyle = invert ? "black" : "white";
            context.stroke();
            context.fillStyle = invert ? "white" : "black";
            context.fill();
        }
    }

    function mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
</script>

<canvas
    bind:this={canvas}
    {width}
    {height}
    style="background-color:{invert ? 'black' : 'white'};"
></canvas>
