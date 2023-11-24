
document.addEventListener("DOMContentLoaded", function () {
  // Your existing code here

const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");


canvas.width = 700;
canvas.height = 700;

ctx.strokeStyle = "#000000";
ctx.lineWidth = 2.5; /* 라인 굵기 */

let painting = false;

function stopPainting() {
  painting = false;
}

function startPainting() {
  painting = true;
}

function onMouseMove(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  if (!painting) {
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function onMouseDown(event) {
  painting = true;
}

if (canvas) {
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", stopPainting);
}

/* 

*/
function handleColorClick(event) {
  const color = event.target.style.backgroundColor;
  console.log("Selected color:", color);
  ctx.strokeStyle = color;
}


const colors = document.getElementsByClassName("controls__color");

function handleColorClick(event) {
    const color = event.target.style.backgroundColor;
    ctx.strokeStyle = color;
}

Array.from(colors).forEach(color => color.addEventListener("click", handleColorClick));


function handleColorClick(event) {
    const color = event.target.style.backgroundColor;
    ctx.strokeStyle = color;
}

Array.from(colors).forEach(color => color.addEventListener("click", handleColorClick));

const range = document.getElementById("jsRange");

function handleRangeChange(event) {
    const size = event.target.value;
    ctx.lineWidth = size;
}

if (range) {
    range.addEventListener("input", handleRangeChange);
};

const mode = document.getElementById("jsMode");

let filling = false;

function handleModeClick() {
    if (filling === true) {
        filling = false;
        mode.innerText = "fill"
    } else {
        filling = true;
        mode.innerText = "paint";
    }
}

if (mode) {
    mode.addEventListener("click", handleModeClick)
}

});
