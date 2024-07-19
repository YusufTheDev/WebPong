function addTouchListener(callback = console.log) {
    function eventCallback(event) {
        callback({
            x: event.targetTouches[0].pageX,
            y: event.targetTouches[0].pageY
        });
    }

    document.addEventListener("touchstart", eventCallback);
    document.addEventListener("touchmove", eventCallback);
    document.addEventListener("touchend", () => callback({}));
}

function elementAbovePos(element, pos) {
    const rect = element.getBoundingClientRect();
    return rect.y + rect.height / 2 > pos.y;
}