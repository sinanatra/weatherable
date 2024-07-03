<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";

    export let data;
    export let guessedData;

    let canvas;
    let context;
    let width = 800;
    let height = 200;
    let margin = { top: 40, right: 10, bottom: 20, left: 10 };

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

        for (let i = diff; i < data.length; i++) {
            let slicedData = data.slice(0, i);
            tribalVis(slicedData, "temp");
            tribalVis(slicedData, "baromabs");
            tribalVis(slicedData, "feelslike");
            tribalVis(slicedData, "windspeed");
            tribalVis(slicedData, "humidity");
        }
        // if (guessedData.outline) {
        //     for (let i = diff; i < Math.ceil(data.length / 3 ); i++) {
        //         let slicedData = data.slice(0, i);
        //         tribalVis(slicedData, "temp");
        //         tribalVis(slicedData, "baromabs");
        //         tribalVis(slicedData, "feelslike");
        //         tribalVis(slicedData, "windspeed");
        //         tribalVis(slicedData, "humidity");
        //     }
        // } else {
        //     for (let i = diff; i < data.length; i++) {
        //         let slicedData = data.slice(0, i);
        //         tribalVis(slicedData, "temp");
        //         tribalVis(slicedData, "baromabs");
        //         tribalVis(slicedData, "feelslike");
        //         tribalVis(slicedData, "windspeed");
        //         tribalVis(slicedData, "humidity");
        //     }
        // }
    }

    function tribalVis(data, dim) {
        let yExtent = d3.extent(data, (d) => +d[dim]);

        if (yExtent[0] === yExtent[1]) {
            return;
        } else {
            yExtent[0] = +yExtent[0] - +guessedData[dim];
        }

        const xScale = d3
            .scaleLinear()
            .domain([0, data.length - 1])
            .range([margin.left, width - margin.right]);

        const yScale = d3
            .scaleLinear()
            .domain(yExtent)
            .range([height - margin.bottom, margin.top]);

        const area = d3
            .area()
            .x((d, i) => xScale(i))
            .y0((d) => yScale(d[dim]))
            .y1((d, i) => {
                if (i !== 0 && i !== data.length - 1) {
                    return yScale(
                        d[dim] - guessedData[dim] / (i * 0.5 + 1) + 0.1,
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
            context.lineWidth = 1;
            context.strokeStyle = "black";
            context.stroke();
            context.fillStyle = "rgba(255,255,255,0)";
            context.fill();
        } else {
            context.beginPath();
            area(data);
            context.lineWidth = 2;
            context.strokeStyle = "white";
            context.stroke();
            context.fillStyle = "black";
            context.fill();
        }
    }

    function mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
</script>

<canvas bind:this={canvas} width="800" height="200"></canvas>

<style>
    canvas {
        background-color: white;
    }
</style>
