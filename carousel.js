const docBody = document.querySelector("body");
// const carousel = document.querySelector("#carousel");
const mainPic = document.querySelector("#main-pic-cont");
const mainPicImg = document.querySelector("#main-pic-cont>img");
const leftArrow = document.querySelector("#left-arrow");
const rightArrow = document.querySelector("#right-arrow");
const stripCont = document.querySelector("#strip-cont");
const expand = document.querySelector("#expand");
const compress = document.querySelector("#compress");
const strip = document.querySelector("#strip");
const picUrls = [];
const idleTime = 10000;
const swipeTime = 8000;
let thumbArr;
let thumbSize;
let thumbGap;
let idleTimer;
let swipeTimer;
let picArrLen;
let pictureIndex;
let stripContWidth = stripCont.offsetWidth;
let stripWidth;
let expandedPic = false;
let rndSeries;
let counter = 0;

async function getPictsUrls() {
    const json = await fetch("img/images.json");
    const urls = await json.json();
    urls.forEach((item) => {
        picUrls.push(item.url);
    });
}

getPictsUrls()
    .then(() => {
        picArrLen = picUrls.length;
        rndSeries = randomSeries(0, picArrLen - 1);
        makeStrip();
        pictureIndex = rndSeries[counter];
        counter++;
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
        pictureIndex = rndSeries[counter];
        updatePicture(pictureIndex);
        if (counter < picArrLen - 1) {
            counter++;
        } else {
            counter = 0;
        }
        swipeTimer = setInterval(() => {
            pictureIndex = rndSeries[counter];
            updatePicture(pictureIndex);
            if (counter < picArrLen - 1) {
                counter++;
            } else {
                counter = 0;
            }
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
}

/* View in fullscreen */
function openFullscreen() {
    mainPic.style.backgroundSize = "contain";
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
    mainPic.style.backgroundSize = "cover";
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
    // get the thumbnail array
    thumbArr = document.querySelectorAll(".thumb");
    // get the width of the first thumbnail
    thumbSize = thumbArr[0].offsetWidth;
    // get the gap size of the thumbnail strip
    thumbGap = parseFloat(
        getComputedStyle(strip).getPropertyValue("gap").slice(0, -2),
        10
    );
    // get the width of the thumbnail strip
    stripWidth = strip.offsetWidth;
}

function updateStrip() {
    // scroll the strip
    let scrollLeft =
        thumbGap +
        pictureIndex * (thumbSize + thumbGap) +
        thumbSize / 2 -
        stripContWidth / 2;
    stripCont.scroll(scrollLeft, 0);
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

function randomSeries(first, last) {
    let arr = [];
    for (let i = first; i <= last; i++) {
        arr.push(i);
    }
    let newArr = [];
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        newArr.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
    }
    return newArr;
}
