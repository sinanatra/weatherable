<script>
    import { onMount, onDestroy } from "svelte";
    import * as d3 from "d3";

    export let data;
    export let guessedData;

    data = data.slice(0, 50);

    let canvas;
    let context;
    let width = 800;
    let height = 200;
    let margin = { top: 30, right: 10, bottom: 0, left: 10 };

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

        if (guessedData.outline) {
            for (let i = 3; i < Math.ceil(data.length / 3); i++) {
                let slicedData = data.slice(0, i);
                tribalVis(slicedData, "temp");
                tribalVis(slicedData, "baromabs");
                tribalVis(slicedData, "feelslike");
                tribalVis(slicedData, "windspeed");
                tribalVis(slicedData, "humidity");
            }
        } else {
            for (let i = 3; i < data.length; i++) {
                let slicedData = data.slice(0, i);
                tribalVis(slicedData, "temp");
                tribalVis(slicedData, "baromabs");
                tribalVis(slicedData, "feelslike");
                tribalVis(slicedData, "windspeed");
                tribalVis(slicedData, "humidity");
            }
        }
    });

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
                        d[dim] - guessedData[dim] / (i * 0.5 + 1) + 0.2,
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
            context.lineWidth = 0.5;
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
</script>

<canvas bind:this={canvas} width="800" height="200"></canvas>

<style>
    canvas {
        background-color: white;
    }
</style>
