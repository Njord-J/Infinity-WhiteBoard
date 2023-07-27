const canvas = document.getElementById("gridCanvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const images = [];
const cellSize = 15;
let offsetX = 0;
let offsetY = 0;
let selectedImageIndex = -1;
let imageOffsetX = 0;
let imageOffsetY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function loadImages() {
  const promises = images.map((image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = image.url;
      img.onload = () => {
        image.imgElement = img;
        resolve();
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  });

  return Promise.all(promises);
}

function drawGridAndImages() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const startColumn = Math.floor(offsetX / cellSize);
  const endColumn = startColumn + Math.ceil(canvas.width / cellSize) + 1;
  const startRow = Math.floor(offsetY / cellSize);
  const endRow = startRow + Math.ceil(canvas.height / cellSize) + 1;

  context.fillStyle = "rgba(82, 94, 77, 0.5)";

  for (let x = startColumn; x < endColumn; x++) {
    for (let y = startRow; y < endRow; y++) {
      const posX = x * cellSize - offsetX;
      const posY = y * cellSize - offsetY;

      context.fillRect(posX, posY, 2, 2);
    }
  }

  images.forEach((image) => {
    const posX = image.x - offsetX;
    const posY = image.y - offsetY;

    context.drawImage(image.imgElement, posX, posY, image.width, image.height);
  });
}

async function init() {
  await loadImages();
  drawGridAndImages();
}

function handleResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawGridAndImages();
}

function handleMouseMove(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  if (isDragging) {
    if (selectedImageIndex !== -1) {
      const selectedImage = images[selectedImageIndex];
      selectedImage.x = mouseX - imageOffsetX;
      selectedImage.y = mouseY - imageOffsetY;
    } else {
      offsetX += -(mouseX - lastMouseX);
      offsetY += -(mouseY - lastMouseY);
    }

    drawGridAndImages();
  }

  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function handleMouseDown(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  selectedImageIndex = -1;

  for (let i = images.length - 1; i >= 0; i--) {
    const image = images[i];
    const imageStartX = image.x - offsetX;
    const imageStartY = image.y - offsetY;
    const imageEndX = imageStartX + image.width;
    const imageEndY = imageStartY + image.height;

    if (
      mouseX >= imageStartX &&
      mouseX <= imageEndX &&
      mouseY >= imageStartY &&
      mouseY <= imageEndY
    ) {
      selectedImageIndex = i;
      imageOffsetX = mouseX - image.x;
      imageOffsetY = mouseY - image.y;
      break;
    }
  }

  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function handleMouseUp() {
  isDragging = false;
  selectedImageIndex = -1;
}

function handleDrop(event) {
  event.preventDefault();
  const mouseX = event.clientX - canvas.offsetLeft + offsetX;
  const mouseY = event.clientY - canvas.offsetTop + offsetY;

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const image = {
          x: mouseX - img.width / 2,
          y: mouseY - img.height / 2,
          width: img.width,
          height: img.height,
          url: img.src,
          imgElement: img,
        };
        images.push(image);
        drawGridAndImages();
      };
    };
    reader.readAsDataURL(file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const mouseX = canvas.width / 2 - img.width / 2;
      const mouseY = canvas.height / 2 - img.height / 2;

      const image = {
        x: mouseX,
        y: mouseY,
        width: img.width,
        height: img.height,
        url: img.src,
        imgElement: img,
      };
      images.push(image);
      drawGridAndImages();
    };
  };
  reader.readAsDataURL(file);
}

function openImageUpload() {
  const imageUpload = document.getElementById("imageUpload");
  imageUpload.click();
}

init();

window.addEventListener("resize", handleResize);
document.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);
document.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("drop", handleDrop);
canvas.addEventListener("dragover", handleDragOver);
document
  .getElementById("imageUpload")
  .addEventListener("change", handleImageUpload);
