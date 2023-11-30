document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("jsCanvas");
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const saveBtn = document.getElementById("jsSave");
  const modeBtn = document.getElementById("jsMode");
  const colors = document.getElementsByClassName("controls__color");
  const range = document.getElementById("jsRange");

  canvas.width = 700;
  canvas.height = 700;

  const canvasWidthInput = document.getElementById("canvasWidth");
  const canvasHeightInput = document.getElementById("canvasHeight");
  const applySizeBtn = document.getElementById("applySize");
  if (applySizeBtn) {
    applySizeBtn.addEventListener("click", function () {
      const newWidth = parseInt(canvasWidthInput.value, 10);
      const newHeight = parseInt(canvasHeightInput.value, 10);

      if (!isNaN(newWidth) && !isNaN(newHeight)) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 여기에서 추가적으로 캔버스를 재설정하거나 기본 상태를 설정할 수 있습니다.
      } else {
        alert("Please enter valid width and height values.");
      }
    });
  } else {
    console.error("Apply Size Button not found!");
  }

  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2.5;

  // 컬러링
  const imageButtons = document.querySelectorAll("button[data-image-path]");

  function loadImage(imagePath) {
    const img = new Image();
    img.onload = function () {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // 이미지 크기와 캔버스 크기를 비교하여 적절한 크기로 조정
      let imageWidth = img.width;
      let imageHeight = img.height;

      if (imageWidth > canvasWidth || imageHeight > canvasHeight) {
        const aspectRatio = imageWidth / imageHeight;

        if (imageWidth > canvasWidth) {
          imageWidth = canvasWidth;
          imageHeight = canvasWidth / aspectRatio;
        }

        if (imageHeight > canvasHeight) {
          imageHeight = canvasHeight;
          imageWidth = canvasHeight * aspectRatio;
        }
      }

      // 이미지를 중앙에 맞추어 그림
      const x = (canvasWidth - imageWidth) / 2;
      const y = (canvasHeight - imageHeight) / 2;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.drawImage(img, x, y, imageWidth, imageHeight);
    };
    img.onerror = function () {
      console.error("Error loading image");
    };
    img.src = imagePath;
  }

  imageButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const imagePath = this.getAttribute("data-image-path");
      loadImage(imagePath);
    });
  });

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
      ctx.lineCap = "round";
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

  Array.from(colors).forEach((color) =>
    color.addEventListener("click", (event) => {
      ctx.strokeStyle = event.target.style.backgroundColor;
    })
  );

  if (range) {
    range.addEventListener("input", (event) => {
      ctx.lineWidth = event.target.value;
    });
  }

  modeBtn.addEventListener("click", () => {
    filling = !filling;
    modeBtn.innerText = filling ? "Paint" : "Fill";
    modeBtn.innerHTML = filling
      ? '<i class="material-icons">format_paint</i>'
      : '<i class="material-icons">brush</i>';
  });

  saveBtn.addEventListener("click", () => {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "PaintJS[🎨]";
    link.click();
  });

  function hexToRgba(hex, alpha = 1) {
    if (hex.startsWith("#")) {
      hex = hex.slice(1);
    }

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
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
      a: pixelData[3],
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

  //픽셔너리
  const pictionaryWords = [
    "사과",
    "나무",
    "자동차",
    "햇볕",
    "책",
    "시계",
    "컴퓨터",
    "전화",
    "문",
    "의자",
    "고양이",
    "개",
    "꽃",
    "하우스",
    "키",
    "등",
    "달",
    "별",
    "구름",
    "비",
    "눈사람",
    "태양",
    "우산",
    "바나나",
    "포도",
    "딸기",
    "산",
    "강",
    "바다",
    "물고기",
    "새",
    "나비",
    "벌",
    "거미",
    "사자",
    "호랑이",
    "곰",
    "코끼리",
    "기린",
    "캥거루",
  ];
  const startPictionaryBtn = document.getElementById("startPictionary");
  const pictionaryWordDisplay = document.getElementById(
    "pictionaryWordDisplay"
  );
  const timerDisplay = document.getElementById("timer");
  const correctAnswerBtn = document.getElementById("correctAnswer");
  const passBtn = document.getElementById("pass");

  let currentWord = "";
  let isPresenter = true; // 출제자 여부를 나타내는 변수
  let timer = null;

  startPictionaryBtn.addEventListener("click", startPictionaryGame);

  function startPictionaryGame() {
    currentWord =
      pictionaryWords[Math.floor(Math.random() * pictionaryWords.length)];
    if (isPresenter) {
      pictionaryWordDisplay.textContent = currentWord;
      startTimer(5, "출제자 확인 시간: "); // 출제자 확인 타이머 5초
    } else {
      pictionaryWordDisplay.textContent = "정답 준비됨";
      startTimer(30, "문제 풀이 시간: "); // 참가자 문제 풀이 타이머 30초
    }
  }

  function startTimer(duration, label) {
    let timeRemaining = duration;
    timerDisplay.textContent = `${label}${timeRemaining}초`;
    timer = setInterval(function () {
      timeRemaining--;
      timerDisplay.textContent = `${label}${timeRemaining}초`;

      if (timeRemaining <= 0) {
        clearInterval(timer);
        if (isPresenter) {
          pictionaryWordDisplay.textContent = "정답 가려짐";
          startTimer(30, "문제 풀이 시간: "); // 참가자 문제 풀이 타이머 시작
        } else {
          timerDisplay.textContent = "시간 초과!";
          pictionaryWordDisplay.textContent = `선정된 정답: ${currentWord}`;
        }
      }
    }, 1000);
  }

  correctAnswerBtn.addEventListener("click", function () {
    clearInterval(timer);
    timerDisplay.textContent = "정답!";
    pictionaryWordDisplay.textContent = `선정된 정답: ${currentWord}`;
  });

  passBtn.addEventListener("click", function () {
    clearInterval(timer);
    startPictionaryGame();
  });
});
