class Kaleidoscope {
    constructor() {
        this.dimensions = window.innerHeight;
        this.paperContents = []; // Start with empty tube
        this.mirrors = 10;
        this.angle = (2 * Math.PI) / this.mirrors;
        this.angleIncrement = Math.PI / 800;
        this.clipPadding = 5;
        this.borderPadding = 20;
        this.randomizer = null;
        this.shaker = false;

        // Placeholders
        this.kaleidoscope = d3.select("#kaleidoscope");
        this.background = null;
        this.canvas = null;
        this.context = null;

        // Set up canvases
        this.setBackground();
    }

    setBackground() {
        // Create canvas contexts
        this.kaleidoscope.style("width", `${this.dimensions}px`);
        this.dummyDimensions = this.dimensions / 24;
        this.dummyCanvas = this.kaleidoscope
            .append("canvas")
            .attr("width", this.dummyDimensions)
            .attr("height", this.dummyDimensions)
            .style("z-index", 0)
            .style("position", "absolute");
        this.background = this.kaleidoscope
            .append("canvas")
            .attr("width", this.dimensions)
            .attr("height", this.dimensions)
            .style("z-index", 1)
            .style("position", "absolute")
            .node()
            .getContext("2d");
        this.canvas = this.kaleidoscope
            .append("canvas")
            .attr("width", this.dimensions)
            .attr("height", this.dimensions)
            .style("z-index", 2)
            .style("position", "relative");
        this.context = this.canvas.node().getContext("2d");
        // Center kaleidoscope
        this.context.translate(this.dimensions / 2, this.dimensions / 2);

        // Draw background
        this.drawBackground();

        // Add event listener
        this.canvas
            .node()
            .addEventListener("mousedown", (event) => this.addNewPaper(event));
    }

    drawBackground() {
        // Draw background
        this.background.beginPath();
        this.background.rect(0, 0, this.dimensions, this.dimensions);
        this.background.fillStyle = "#ffffff";
        this.background.fill();
    }

    clearCanvas() {
        this.context.clearRect(-this.dimensions / 2, -this.dimensions / 2, this.dimensions, this.dimensions);
    }

    clearContents() {
        this.paperContents = [];
    }

    addNewPaper(event) {
        // Get cursor position on canvas and convert from rectangular to polar
        let canvasPosition = this.canvas.node().getBoundingClientRect();
        let x = event.clientX - canvasPosition.left - this.dimensions / 2;
        let y = event.clientY - canvasPosition.top - this.dimensions / 2;
        let radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let radians = (2 * Math.PI + Math.atan(y / x) + (x < 0 ? Math.PI : 0)) % this.angle;
        // Update x and y so that they're on the base slice
        x = radius * Math.cos(radians);
        y = radius * Math.sin(radians);
        // Get other paper attributes
        let shape = $("button.shape.active").val();
        let fill = $("button.fill.active").val();
        let color = $("button.color.active").val();
        let size = $("#range-value-input").val();
        let clipped = $("#check-clipped").prop("checked");
        // Add paper
        this.paperContents.push(
            new Paper(shape, fill, color, size, clipped, x, y, radians)
        );
        this.draw();
        this.randomizer === null ? null : this.randomizer();
    }

    draw() {
        this.clearCanvas();
        for (let i = 1; i <= this.mirrors; i++) {
            this.context.rotate(i * this.angle);

            for (let paper of this.paperContents) {
                // Clip
                if (paper.clipped) {
                    this.context.save();
                    this.context.beginPath();
                    this.context.moveTo(this.clipPadding, this.clipPadding);
                    this.context.lineTo(
                        this.dimensions / 2 -
                            this.clipPadding -
                            this.borderPadding,
                        this.clipPadding
                    );
                    this.context.arc(
                        0,
                        0,
                        this.dimensions / 2 -
                            this.clipPadding -
                            this.borderPadding,
                        0,
                        this.angle
                    );
                    this.context.closePath();
                    this.context.clip();
                }
                paper.draw(this.context, {"canvas": this.dummyCanvas, "dimension": this.dummyDimensions});
                // Unclip
                if (paper.clipped) {
                    this.context.restore();
                }
            }

            this.context.rotate(-i * this.angle);
        }
    }

    shake() {
        this.shaker = this.shaker ? false : true;
        let radius, radians, incrementalRadians;
        let shakeContinuous = () => {
            this.paperContents.forEach((paper) => {
                radius = Math.sqrt(Math.pow(paper.x, 2) + Math.pow(paper.y, 2));
                radians = paper.radians + this.angleIncrement;
                incrementalRadians = Math.asin(paper.size / radius)
                if ((paper.clipped) && (radians - incrementalRadians > this.angle)){
                    radians-= this.angle + 2*incrementalRadians;
                }
                paper.x = radius * Math.cos(radians);
                paper.y = radius * Math.sin(radians);
                paper.radians = radians;
            })
            this.draw();
            if (this.shaker) {
                requestAnimationFrame(shakeContinuous);
            }
        }
        requestAnimationFrame(shakeContinuous);
    }
}

class Paper {
    constructor(shape, fill, color, size, clipped, x, y, radians) {
        this.shape = shape;
        this.fill = fill;
        this.color = color;
        this.size = size;
        this.clipped = clipped;
        this.x = x;
        this.y = y;
        this.radians = radians;
    }

    draw(context, pattern) {
        this.drawPath(context);
        this.fillPath(context, pattern);
    }

    drawPath(context) {
        context.beginPath();
        let x, y;
        if (this.shape === "circle") {
            context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        } else if (this.shape === "star") {
            context.moveTo(this.x, this.y - this.size);
            let rot = (Math.PI / 2) * 3;
            let step = Math.PI / 5;
            for (let i = 0; i < 10; i++) {
                x = this.x + (Math.cos(rot) * this.size) / ((i % 2) + 1);
                y = this.y + (Math.sin(rot) * this.size) / ((i % 2) + 1);
                context.lineTo(x, y);
                rot += step;
            }
            context.lineTo(this.x, this.y - this.size);
        } else if (this.shape === "moon") {
            let diff = 0.1 * this.size;
            context.arc(this.x, this.y, this.size, 0, (6 / 4) * Math.PI);
            context.arc(
                this.x + diff,
                this.y - diff,
                this.size - diff,
                (6 / 4) * Math.PI,
                0,
                true
            );
        }
        context.closePath();
    }

    fillPath(context, patternPack) {
        if (this.fill === "solid") {
            context.fillStyle = this.color;
            context.fill();
        } else if (this.fill === "stroke") {
            context.strokeStyle = this.color;
            context.lineWidth = 0.1 * this.size;
            context.stroke();
        } else {
            let pattern = patternPack.canvas.node();
            let dimension = patternPack.dimension;
            let patternContext = pattern.getContext("2d");
            patternContext.clearRect(0, 0, dimension, dimension);
            if (this.fill === "stripe") {
                let offset = dimension / 20;
                patternContext.strokeStyle = this.color;
                patternContext.lineWidth = dimension / 6;
                patternContext.beginPath();
                patternContext.moveTo(dimension + offset, dimension + offset);
                patternContext.lineTo(-offset, -offset);
                patternContext.moveTo(dimension + offset-dimension, dimension + offset);
                patternContext.lineTo(-offset-dimension, -offset);
                patternContext.moveTo(dimension + offset+dimension, dimension + offset);
                patternContext.lineTo(-offset+dimension, -offset);
                patternContext.stroke();
            } else if (this.fill === "spot") {
                patternContext.strokeStyle = this.color;
                patternContext.fillStyle = this.color;
                patternContext.lineWidth = 0;
                let numCircles = 3;
                let radius = dimension / numCircles / 3;
                for (let i=0; i < dimension / numCircles; i++){
                    for (let j=0; j < dimension / numCircles; j++){
                        patternContext.beginPath();
                        patternContext.arc(i*(3 * radius), j*(3 * radius), radius, 0, 2 * Math.PI)
                        patternContext.closePath();
                        patternContext.fill();
                    }
                }
            }
            context.fillStyle = context.createPattern(pattern, "repeat");
                context.fill();
        }
    }
}
export default Kaleidoscope;
