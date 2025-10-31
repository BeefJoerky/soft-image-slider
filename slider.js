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
    let unseenOffset = (curIndex * imSize + Math.max((curIndex) * gap, 0));    // Clamp with Math.min to remove the case for curIndex=0
    let totalOffset = unseenOffset - offset;

    return totalOffset;
}


function recalculatePercentage() {
    let scrollX = calculatePositionInPixels()
    sliderPercentage = scrollX / totalSliderPixelSize;

    sliderPercentageCounter.innerHTML = sliderPercentage.toPrecision(2);
}


function offsetSlider() {
    console.log("Offsetting slider to: " + offset + "px")
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
    newX = Math.max(newX, 0);
    //let minX = totalSliderPixelSize - (imSize+gap) * numInView;
    newX = Math.min(newX, totalSliderPixelSize);
    console.log("Pixels: ", pixels, "NewX: ", newX)

    // Reinitialize images for simplicity
    //reinitImages(newX);

    // Check if an image should be moved
    // Multiple images could be moved if pixels is big
    let moveImages = checkUnseenImages(curX, newX);
    console.log(moveImages)

    
    
    //let first = moveImages[0];
    //let last = moveImages[moveImages.length-1];
    //console.log(last)
    // If the entire new set of images is outside of current view
    if (moveImages > numWithUnseen) {
        
        //let diff = first < 0 ? first : last - numWithUnseen + 1;
        if (pixels > 0) {
            curIndex += moveImages
        }
        else {
            curIndex -= moveImages
        }
        curIndex = curIndex.clamp(0, totalElements-numWithUnseen);
        console.log(curIndex)
        
        
    }

    if (moveImages == 0) {
        offset = -newX % (imSize+gap)
        offsetSlider();
        return
    }
    
    // Slide right
    if (pixels < 0) {
        console.log("Yes", moveImages)
        for (i = 0; i <= moveImages; i++) {
            if (curIndex == 0) {
                break
            }
            switchLast();
        }
    }
    // Slide left
    else {
        for (i = 0; i <= moveImages; i++) {
            if (curIndex == totalElements - numWithUnseen) {
                break
            }
            switchFirst();
        }
    }
    
    //
    
}


function checkUnseenImages(curX, newX) {
    let curOffset = offset;
    let newDiff = newX - curX;
    let tentativeOffset = newDiff;
    
    const unseenUpperLimit = (imSize + gap) * 2;
    const unseenLowerLimit = (imSize + gap) * 1;
    console.log(tentativeOffset, newX);

    // If the move action would render images outside the rendered zone
    
    // If at the beginning; exception case, where additional images should be rendered on the side
    // If trying to slide to slide past the beginning
    if (curIndex == 0 && newDiff > 0) {
        // No-op, only offset
        return 0;
    }

    // TODO: handle right-most case
    
    if (tentativeOffset < -unseenUpperLimit) {
        let oldNumLeft = Math.floor(curX / (imSize+gap));
        let newNumLeft = Math.floor((newX-gap) / (imSize+gap));
        console.log(newNumLeft-curIndex, newNumLeft)
        return newNumLeft-curIndex;
        //return [...Array(newNumLeft-curIndex-1).keys()];
    }
    else if (tentativeOffset > -unseenLowerLimit) {
        
        let oldNumRight = totalElements - Math.floor(curX / (imSize + gap)) - numWithUnseen;
        let newNumRight = Math.floor((newX + (imSize+gap)*numWithUnseen) / (imSize+gap));
        return numWithUnseen - (newNumRight-curIndex)
        //return [...Array(numWithUnseen - (newNumRight-curIndex) +1).keys()].map(i => i + newNumRight-curIndex-1);
    }
    
    return 0;
    
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
    let totSize = imSize * totalElements + gap * (totalElements-2) + gap;

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


function reinitImages() { //(initX) {
    /*
    let imSizesLeft = Math.floor(initX / (imSize+gap));
    let smallOffset = -initX % (imSize + gap);
    console.log(initX)
    console.log(imSizesLeft);


    curIndex = imSizesLeft-1;
    console.log(curIndex, imSizesLeft)
    
    // The left-most edge case
    if (imSizesLeft < 2) {
        offset = smallOffset - imSizesLeft * (imSize+gap)
        curIndex = 0;
        //console.log("First: " + offset);
    }
    else if (imSizesLeft > totalElements-numWithUnseen) {
        let prevOffset = totalSliderPixelSize
        offset = smallOffset-(totalElements-imSizesLeft-numInView+1)*(imSize+gap)
        //offset = calculatePositionInPixels() - initX;
        curIndex = totalElements-numWithUnseen;
        console.log(curIndex, imSizesLeft, smallOffset, offset)
    }
    // If there are hidden images to the left, the most common scenario
    else {
        offset = smallOffset - imSize - gap;
        //console.log("Second: " + offset);
    }

    //console.log(curIndex);
    */
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