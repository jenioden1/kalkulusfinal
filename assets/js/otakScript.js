const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");
const zoomInButton = document.getElementById("zoomInButton");
const zoomOutButton = document.getElementById("zoomOutButton");
const resultElement = document.getElementById("result");
const extremePointElement = document.getElementById("extremePoint");
const canvas = document.getElementById("quadraticChart");
const ctx = canvas.getContext("2d");
const historyElement = document.getElementById("history");

let initialDistance = 0;
let currentDistance = 0;
let isPinching = false;

let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let offsetX = 0;
let offsetY = 0;
let touchStartDistance = 0;
let touchEndDistance = 0;

canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    touchStartDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  } else if (e.touches.length === 1) {
    isPanning = true;
    panStartX = e.touches[0].clientX;
    panStartY = e.touches[0].clientY;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (isPinching && e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    touchEndDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    // Calculate zoom factor based on distance change
    const zoomFactor = touchEndDistance / touchStartDistance;

    // Update canvas zoom factor
    zoom *= zoomFactor;

    // Reset initial value
    touchStartDistance = touchEndDistance;

    // Redraw the canvas with the new zoom factor
    drawQuadraticChart();
  } else if (isPanning && e.touches.length === 1) {
    const panEndX = e.touches[0].clientX;
    const panEndY = e.touches[0].clientY;
    offsetX += panEndX - panStartX;
    offsetY += panEndY - panStartY;
    panStartX = panEndX;
    panStartY = panEndY;

    drawQuadraticChart();
  }
});

canvas.addEventListener("touchend", () => {
  isPinching = false;
  isPanning = false;
});

let zoom = 1;
let a, b, c; // Variables to store the values of a, b, c
let roots = []; // Variables to store roots

function calculateQuadratic() {
  a = parseFloat(document.getElementById("a").value);
  b = parseFloat(document.getElementById("b").value);
  c = parseFloat(document.getElementById("c").value);

  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    resultElement.textContent = "Harap masukkan nilai a, b, dan c yang valid.";
    zoomInButton.disabled = true;
    zoomOutButton.disabled = true;
    canvas.style.pointerEvents = "none"; // Menonaktifkan interaksi dengan canvas
    return;
  }

  historyElement.innerHTML = "";

  const discriminant = b ** 2 - 4 * a * c;

  if (discriminant > 0) {
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const result = `Akar-akar persamaan: x1 = ${root1.toFixed(
      2
    )} dan x2 = ${root2.toFixed(2)}`;
    resultElement.textContent = result;
    const extremeX = -b / (2 * a);
    const extremeY = a * extremeX * extremeX + b * extremeX + c;
    const extremeResult = `Titik Ekstremum: x = ${extremeX.toFixed(
      2
    )}, y = ${extremeY.toFixed(2)}`;
    extremePointElement.textContent = extremeResult;
    roots = [root1, root2];
    drawQuadraticChart();
    addToHistory(a, b, c, result, extremeResult);
    zoomInButton.disabled = false;
    zoomOutButton.disabled = false;
    canvas.style.pointerEvents = "auto"; // Mengaktifkan kembali interaksi dengan canvas
  } else if (discriminant === 0) {
    const root = -b / (2 * a);
    const result = `Satu akar ganda: x = ${root.toFixed(2)}`;
    resultElement.textContent = result;
    const extremeX = -b / (2 * a);
    const extremeY = a * extremeX * extremeX + b * extremeX + c;
    const extremeResult = `Titik Ekstremum: x = ${extremeX.toFixed(
      2
    )}, y = ${extremeY.toFixed(2)}`;
    extremePointElement.textContent = extremeResult;
    roots = [root];
    drawQuadraticChart();
    addToHistory(a, b, c, result, extremeResult);
    zoomInButton.disabled = false;
    zoomOutButton.disabled = false;
    canvas.style.pointerEvents = "auto"; // Mengaktifkan kembali interaksi dengan canvas
  } else {
    const result = "Persamaan tidak memiliki akar real.";
    resultElement.textContent = result;
    extremePointElement.textContent = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    addToHistory(a, b, c, result, "");
    roots = [];
    zoomInButton.disabled = true;
    zoomOutButton.disabled = true;
    canvas.style.pointerEvents = "none"; // Menonaktifkan interaksi dengan canvas
  }
}

calculateButton.addEventListener("click", calculateQuadratic);

resetButton.addEventListener("click", function () {
  document.getElementById("a").value = "";
  document.getElementById("b").value = "";
  document.getElementById("c").value = "";
  resultElement.textContent = "";
  extremePointElement.textContent = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  historyElement.innerHTML = "";
  a = b = c = undefined; // Reset values of a, b, c
  roots = []; // Reset roots
  zoomInButton.disabled = false;
  zoomOutButton.disabled = false;
  canvas.style.pointerEvents = "auto"; // Mengaktifkan kembali interaksi dengan canvas
});

zoomInButton.addEventListener("click", function () {
  zoom *= 1.5; // Zoom factor
  drawQuadraticChart();
});

zoomOutButton.addEventListener("click", function () {
  zoom /= 1.5; // Zoom factor
  drawQuadraticChart();
});

function drawQuadraticChart() {
  if (
    typeof a === "undefined" ||
    typeof b === "undefined" ||
    typeof c === "undefined"
  ) {
    return; // Do not draw if values of a, b, or c have not been input
  }

  const data = [];
  for (let x = -100; x <= 100; x += 0.1) {
    const y = a * x * x + b * x + c;
    data.push({ x, y });
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.font = "12px Arial";

  for (let i = -100; i <= 100; i++) {
    ctx.fillText(
      i,
      i * 20 * zoom + canvas.width / 2 - 5,
      canvas.height / 2 + 15
    );
  }

  for (let i = -100; i <= 100; i++) {
    ctx.fillText(
      i,
      canvas.width / 2 + 10,
      -i * 20 * zoom + canvas.height / 2 + 5
    );
  }

  // Add vertical dashed lines at the extreme point
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "red";
  const extremeX = -b / (2 * a);
  ctx.beginPath();
  ctx.moveTo(extremeX * 20 * zoom + canvas.width / 2, 0);
  ctx.lineTo(extremeX * 20 * zoom + canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "red"; // Red color for the extreme point
  const extremeY = a * extremeX * extremeX + b * extremeX + c;
  ctx.beginPath();
  ctx.arc(
    extremeX * 20 * zoom + canvas.width / 2,
    -extremeY * 20 * zoom + canvas.height / 2,
    6,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "black"; // Back to black color

  ctx.fillStyle = "black";
  ctx.beginPath();
  for (const root of roots) {
    ctx.arc(
      root * 20 * zoom + canvas.width / 2,
      canvas.height / 2,
      6,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;

  for (let i = 0; i < data.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(
      data[i].x * 20 * zoom + canvas.width / 2,
      -data[i].y * 20 * zoom + canvas.height / 2
    );
    ctx.lineTo(
      data[i + 1].x * 20 * zoom + canvas.width / 2,
      -data[i + 1].y * 20 * zoom + canvas.height / 2
    );
    ctx.stroke();
  }
}

function addToHistory(a, b, c, result, extremeResult) {
  const historyItem = document.createElement("li");
  historyItem.innerHTML = `Persamaan: ${a}x^2 + ${b}x + ${c}<br>Hasil ${result}<br>${extremeResult}`;
  historyElement.appendChild(historyItem);
  resultElement.textContent = "";
  extremePointElement.textContent = "";
}
