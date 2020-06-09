const docBody = document.querySelector("body");
const carousel = document.querySelector("#carousel");
const carouselWidth = carousel.offsetWidth;
const mainPic = document.querySelector("#main-pic");
const mainPicImg = document.querySelector("#main-pic>img");
const leftArrow = document.querySelector("#left-arrow");
const rightArrow = document.querySelector("#right-arrow");
const stripCont = document.querySelector("#strip-cont");
const expand = document.querySelector("#expand");
const compress = document.querySelector("#compress");
const strip = document.querySelector("#strip");
const picUrls = [];
const thumbSize = 100;
const thumbGap = 4;
const idleTime = 10000;
const swipeTime = 8000;
let thumbArr;
let idleTimer;
let swipeTimer;
let picArrLen;
let pictureIndex;
let stripWidth;
let expandedPic = false;

async function getPictsUrls() {
  const json = await fetch("images/images.json");
  const urls = await json.json();
  urls.forEach((item) => {
    picUrls.push(item.url);
  });
}

getPictsUrls()
  .then(() => {
    picArrLen = picUrls.length;
    // width of the thumbnail strip
    stripWidth = thumbSize * picArrLen + thumbGap * (picArrLen - 1);
    makeStrip();
    pictureIndex = randomIndexNumber();
    updatePicture(pictureIndex);
  })
  .catch((err) => {
    console.error(err);
  });

onload = () => {
  leftArrow.addEventListener("click", nextPicture);
  rightArrow.addEventListener("click", nextPicture);
  expand.addEventListener("click", fullscreenSwitcher);
  compress.addEventListener("click", fullscreenSwitcher);
  compress.classList.toggle("hide");
  startTimer();
};
docBody.onmousemove = () => resetTimers();
docBody.onscroll = () => resetTimers();
docBody.ontouchstart = () => resetTimers();
docBody.onclick = () => resetTimers();

function startTimer() {
  idleTimer = setTimeout(() => {
    pictureIndex = randomIndexNumber();
    updatePicture(pictureIndex);
    swipeTimer = setInterval(() => {
      pictureIndex = randomIndexNumber();
      updatePicture(pictureIndex);
    }, swipeTime);
  }, idleTime);
}

function resetTimers() {
  clearTimeout(idleTimer);
  clearInterval(swipeTimer);
  startTimer();
}

function fullscreenSwitcher() {
  if (!expandedPic) {
    openFullscreen();
    expandedPic = true;
  } else {
    closeFullscreen();
    expandedPic = false;
  }
  // full screen mode
  expand.classList.toggle("hide");
  compress.classList.toggle("hide");
  // carousel.classList.toggle("carousel-expanded");
  // stripCont.classList.toggle("strip-cont-expanded");
  // mainPicImg.classList.toggle("main-pic-img-expanded");
}

/* View in fullscreen */
function openFullscreen() {
  if (mainPic.requestFullscreen) {
    mainPic.requestFullscreen();
  } else if (mainPic.mozRequestFullScreen) {
    /* Firefox */
    mainPic.mozRequestFullScreen();
  } else if (mainPic.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    mainPic.webkitRequestFullscreen();
  } else if (mainPic.msRequestFullscreen) {
    /* IE/Edge */
    mainPic.msRequestFullscreen();
  }
  if ("orientation" in screen) {
    screen.orientation.lock("landscape-primary");
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE/Edge */
    document.msExitFullscreen();
  }
  if ("orientation" in screen) {
    screen.orientation.unlock();
  }
}

function makeStrip() {
  // fill up the thumbnail strip with thumbnail pictures
  // and make a thumbnail picture array
  picUrls.forEach((pic, i) => {
    let thumbDiv = document.createElement("div");
    thumbDiv.classList.add("thumb");
    thumbDiv.setAttribute("id", `thumb_${i}`);
    thumbDiv.style.backgroundImage = `URL(${picUrls[i]})`;
    thumbDiv.addEventListener("click", indexByThumb);
    strip.appendChild(thumbDiv);
  });
  thumbArr = document.querySelectorAll(".thumb");

  // set the width of the thumbnail strip
  strip.style.width = `${stripWidth}px`;
}

function updateStrip() {
  // set the position of the thumbnail strip
  let stripContWidth;
  if (carouselWidth * 0.9 > stripWidth) {
    stripContWidth = stripWidth;
  } else {
    stripContWidth = carouselWidth * 0.9;
  }
  stripCont.style.width = `${stripContWidth}px`;
  let position =
    pictureIndex * (thumbSize + thumbGap) + thumbSize / 2 - stripContWidth / 2;
  let toLeft = position < 0;
  let toRight = position > stripWidth - stripContWidth;
  position = -position;
  if (toLeft) {
    position = 10;
  } else if (toRight) {
    position = stripContWidth - stripWidth - 10;
  }
  strip.style.left = `${position}px`;

  // higligh the actual thumbnail
  thumbArr.forEach((thumb, i) => {
    if (i === pictureIndex) {
      thumb.classList.add("active-thumb");
    } else {
      thumb.classList.remove("active-thumb");
    }
  });
}

function indexByThumb() {
  pictureIndex = parseInt(this.id.slice(6), 10);
  updatePicture(pictureIndex);
}

function nextPicture() {
  if (this.id === "right-arrow") {
    right();
  } else if (this.id === "left-arrow") {
    left();
  }
  updatePicture(pictureIndex);
}

function right() {
  pictureIndex < picArrLen - 1 ? pictureIndex++ : (pictureIndex = 0);
}

function left() {
  pictureIndex > 0 ? pictureIndex-- : (pictureIndex = picArrLen - 1);
}

function updatePicture(ind) {
  mainPic.style.backgroundImage = `URL(${picUrls[ind]})`;
  mainPicImg.setAttribute("src", picUrls[ind]);
  updateStrip();
}

function randomIndexNumber() {
  return Math.floor(Math.random() * picArrLen);
}
