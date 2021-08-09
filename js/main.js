import Kaleidoscope from "./kaleidoscope.js";

$("document").ready(() => {
    const kaleidoscope = new Kaleidoscope();
    // Loop through the buttons and add the active class to the current/clicked button
    let shapeButtons = document.getElementsByClassName("shape");
    for (let i = 0; i < shapeButtons.length; i++) {
        shapeButtons[i].addEventListener("click", function () {
            let current = $("button.shape.active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }
    let fillButtons = document.getElementsByClassName("fill");
    for (let i = 0; i < fillButtons.length; i++) {
        fillButtons[i].addEventListener("click", function () {
            let current = $("button.fill.active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }
    let colorButtons = document.getElementsByClassName("color");
    for (let i = 0; i < colorButtons.length; i++) {
        colorButtons[i].addEventListener("click", function () {
            let current = $("button.color.active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }
    document.getElementById("clear").addEventListener("click", function () {
        kaleidoscope.clearCanvas();
        kaleidoscope.clearContents();
    })
    document.getElementById("shake").addEventListener("click", function () {
        if (document.getElementById("shake").className.includes("active")) {
            this.className = this.className.replace(" active", "");
        } else {
            this.className += " active";
        }
        kaleidoscope.shake();
    })
    document.getElementById("randomize").addEventListener("click", function () {
        if (document.getElementById("randomize").className.includes("active")) {
            this.className = this.className.replace(" active", "");
            kaleidoscope.randomizer = null;
        } else {
            this.className += " active";
            randomize();
            kaleidoscope.randomizer = randomize;  // Set randomizer function
        }
    })
    let randomize = () => {
        // Randomize shape
        for (let i = 0; i < shapeButtons.length; i++) {
                shapeButtons[i].className = shapeButtons[i].className.replace(" active", "");
        }
        let newShapeIndex = Math.floor(shapeButtons.length * Math.random());
        shapeButtons[newShapeIndex].className += " active";
        // Randomize fill
        for (let i = 0; i < fillButtons.length; i++) {
            fillButtons[i].className = fillButtons[i].className.replace(" active", "");
        }
        let newFillIndex = Math.floor(fillButtons.length * Math.random());
        fillButtons[newFillIndex].className += " active";
        // Randomize color
        for (let i = 0; i < colorButtons.length; i++) {
            colorButtons[i].className = colorButtons[i].className.replace(" active", "");
        }
        let newColorIndex = Math.floor(colorButtons.length * Math.random());
        colorButtons[newColorIndex].className += " active";
        // Randomize size
        let newSizeValue = 1 + Math.floor(80 * Math.random());
        document.getElementById("range-value-input").value = newSizeValue;
        document.getElementById("range-value").innerHTML = newSizeValue
        // Randomize clip
        document.getElementById("check-clipped").checked = Math.random() < 0.5 ? true : false;

    }
});