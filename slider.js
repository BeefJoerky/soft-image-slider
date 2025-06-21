let slider;
let sliderContainer;
let sliderSize;
let sliderContainerSize;
let totalSliderPixelSize;
let sliderPercentage;
let sliderPercentageCounter;

let isDragging = false;
let startX = 0;
var offset = 0;
let curIndex = 0;

const lastElementIndex = 7;
let totalElements = 20;
const numWithUnseen = 8;
const numInView = 5;
const imSize = 80;
const gap = 3;
const imsData = new Map();
const imsInView = [];


Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};


$(function() {
    /*$('#slider-container').on('click', function() {
        alert("klickade");
    });*/
    sliderPercentageCounter = this.getElementById("slider-percentage");
    let percText = this.getElementById("perc-text");
    let percButton = this.getElementById("perc-button");

    percButton.addEventListener('click', () => {
        let percentage = parseInt(percText.value);
        //scrollByDecimal(percentage);
        scrollByPixels(percentage);
    })

    slider = this.getElementById("slider");
    sliderContainer = this.getElementById("slider-container");
    initSlider();
    initImages();

    slider.addEventListener('mousedown', (mouseEvent) => {
        if (isDragging) {
            return;
        }
        isDragging = true;
        startX = mouseEvent.clientX - offset;
    })

    slider.addEventListener('mousemove', (mouseEvent) => {
        if (!isDragging) {
            return;
        }
        offset = mouseEvent.clientX - startX;
        scrollByDrag()
    })

    slider.addEventListener('mouseup', (mouseEvent) => {
        if (!isDragging) {
            return;
        }
        isDragging = false;
    })
});

function getImageNode(index) {
    return imsInView[index].getElementsByTagName("a")[0];
}


// Discrete as in whole image pixel sizes
function calculatePositionInPixels() {
    let unseenOffset = (curIndex * imSize + Math.max((curIndex-1) * gap, 0));    // Clamp with Math.min to remove the case for curIndex=0
    let totalOffset = unseenOffset - offset;

    return totalOffset;
}


function recalculatePercentage() {
    let scrollX = calculatePositionInPixels()
    sliderPercentage = scrollX / totalSliderPixelSize;

    sliderPercentageCounter.innerHTML = sliderPercentage.toPrecision(2);
}


function offsetSlider() {
    slider.style.transform = "translateX(" + offset + "px";
}


// Scroll to percentage given by range from 0 to 1
function scrollByDecimal(scrollDecimal) {
    console.log("Scroll to: " + scrollDecimal);
}


function scrollToIndex(index) {

}


function scrollByPixels(pixels) {
    let curX = calculatePositionInPixels();
    let newX = curX + pixels;

    // Reinitialize images for simplicity
    reinitImages(newX);

    offsetSlider();
}


function scrollByDrag() {
    let scrollX = calculatePositionInPixels();
    

    if (curIndex > totalElements - numWithUnseen) {
        scrollX += imSize;
    }

    // Give endpoints to the slider
    if (scrollX < 0) {
        offset = 0;
        offsetSlider();
        recalculatePercentage();
        return;
    }
    if (scrollX >= totalSliderPixelSize) {
        offset = -3*(imSize+gap);
        offsetSlider();
        recalculatePercentage();
        return; 
    }

    recalculatePercentage();

    if (offset < -2*(imSize + gap)) {
        switchFirst();
    }
    
    else if (offset >= -imSize - gap && curIndex > 0) {
        switchLast();
    }
    
    offsetSlider();
}


function switchFirst() {
    //toggleVisibility(0, true);
    //toggleVisibility(lastElementIndex, false);

    if (curIndex < totalElements - numWithUnseen) {
        slider.appendChild(imsInView[0]);
        startX -= imSize + gap;
        offset = -imSize - gap;
    
        arraymove(imsInView, 0, lastElementIndex)
        getImageNode(lastElementIndex).text = loadData(curIndex + (lastElementIndex+1));
        curIndex += 1;
    }

}


function switchLast() {
    curIndex -= 1;

    //toggleVisibility(lastElementIndex, true);
    //toggleVisibility(0, false);
    

    imsInView[0].before(imsInView[lastElementIndex]);
    startX += imSize + gap;
    offset = -2*(imSize + gap);

    arraymove(imsInView, lastElementIndex, 0);
    getImageNode(0).text = loadData(curIndex);

}


function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}


function initSlider() {
    sliderContainerSize = imSize * numInView + (numInView-1) * gap;
    sliderContainer.style = "width: " + sliderContainerSize + "px";
    
    sliderSize = imSize * numWithUnseen + gap * (numWithUnseen-1);
    slider.style = "width: " + sliderSize + "px";

    totalSliderPixelSize = calculateSliderPixelSize();
}


// The slider size in this regard "begins" at the middle of the slider, at curIndex=0, and ends at the middle of the slider when curIndex = (totalElements-)
function calculateSliderPixelSize() {
    let totSize = imSize * totalElements + gap * (totalElements-2);

    //  let halfViewSize = sliderContainerSize/2    Since this is subtracted from totSize twice, ignore this and subtract sliderContainerSize directly

    let functionalSliderPixelSize = totSize - sliderContainerSize;
    return functionalSliderPixelSize
}


function toggleVisibility(imIndex, isHidden) {
    let hiddenStyle = "visible";
    if (isHidden) {
        hiddenStyle = "hidden"
    }
    imsInView[imIndex].style.visibility = hiddenStyle;
}


function reinitImages(initX) {
    let imSizesLeft = Math.floor(initX / (imSize+gap));
    offset = initX % (imSize + gap);
    console.log(imSizesLeft);


    let lastIndex = curIndex;
    console.log(curIndex);
    curIndex = imSizesLeft;
    
    // The left-most edge case
    if (imSizesLeft < 2) {
        curIndex = 0;
    }

    console.log(curIndex);

    for (i = 0; i < numWithUnseen; i++) {
        getImageNode(i).text = loadData(curIndex + i);
    }

}


function initImages() {

    for (i = 0; i < numWithUnseen; i++) {
        const listElement = document.createElement("li");
        const imElement = document.createElement("a");

        const nodeData = loadData(i);
        const node = document.createTextNode(nodeData);
        
        imElement.appendChild(node);
        listElement.appendChild(imElement)
        slider.appendChild(listElement);

        imsInView.push(listElement);
        if (i > numInView) {
            //toggleVisibility(i, true);
        }
    }
}


function loadData(index) {
    return "Bild " + (index+1);
}