document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("jsCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const saveBtn = document.getElementById("jsSave");
  const modeBtn = document.getElementById("jsMode");
  const colors = document.getElementsByClassName("controls__color");
  const range = document.getElementById("jsRange");

  canvas.width = 700;
  canvas.height = 700;

  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2.5;

  let painting = false;
  let filling = false;

  function startPainting() {
    painting = true;
  }

  function stopPainting() {
    painting = false;
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
    if (filling) {
      const x = event.offsetX;
      const y = event.offsetY;
      const fillColor = hexToRgba(ctx.strokeStyle);
      floodFill(x, y, fillColor);
    } else {
      startPainting();
    }
  }

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", stopPainting);

  Array.from(colors).forEach(color =>
    color.addEventListener("click", event => {
      ctx.strokeStyle = event.target.style.backgroundColor;
    })
  );

  if (range) {
    range.addEventListener("input", event => {
      ctx.lineWidth = event.target.value;
    });
  }

  modeBtn.addEventListener("click", () => {
    filling = !filling;
    modeBtn.innerText = filling ? "Paint" : "Fill";
  });

  saveBtn.addEventListener("click", () => {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "PaintJS[🎨]";
    link.click();
  });

  function hexToRgba(hex, alpha = 1) {
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }

    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return { r, g, b, a: alpha * 255 };
  }

  function getPixelColor(x, y) {
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    return {
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2],
      a: pixelData[3]
    };
  }

  function colorsMatch(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }

  function floodFill(startX, startY, fillColor) {
    const targetColor = getPixelColor(startX, startY);
    if (colorsMatch(targetColor, fillColor)) {
      return;
    }

    const pixelQueue = [{ x: startX, y: startY }];
    while (pixelQueue.length > 0) {
      const { x, y } = pixelQueue.shift();
      const currentColor = getPixelColor(x, y);

      if (!colorsMatch(currentColor, targetColor)) {
        continue;
      }

      setPixelColor(x, y, fillColor);

      addPixelToQueue(x - 1, y, pixelQueue);
      addPixelToQueue(x + 1, y, pixelQueue);
      addPixelToQueue(x, y - 1, pixelQueue);
      addPixelToQueue(x, y + 1, pixelQueue);
    }
  }

  function addPixelToQueue(x, y, queue) {
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      queue.push({ x, y });
    }
  }

  function setPixelColor(x, y, color) {
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.fillRect(x, y, 1, 1);
  }
});
