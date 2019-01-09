// min x delta swipe for horizontal swipe
const MIN_X = 100;
// max y delta for horizontal swipe
const MAX_Y = 50;
export const LEFT_SWIPE = -1;
export const RIGHT_SWIPE = 1;
export const TOP_SWIPE = 2;
export const BOTTOM_SWIPE = -2;

let eventObj = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isValid: true
};

let callback;

export function add(el, action) {
    el.addEventListener('touchstart', handleStart, false);
    el.addEventListener('touchmove', handleMove, false);
    el.addEventListener('touchend', handleEnd, false);
    callback = action;
}

export function remove(el) {
    el.removeEventListener('touchstart', handleStart);
    el.removeEventListener('touchmove', handleMove);
    el.removeEventListener('touchend', handleEnd);
    callback = undefined;
}

function handleStart(e) {
    // assuming single touch, e.touches is an Array of all touches,
    // but with single touch there is only one element
    let touch = e.touches[0];
    eventObj.startX = touch.screenX;
    eventObj.startY = touch.screenY;
}

function handleMove(e) {
    let touch = e.touches[0];
    eventObj.endX = touch.screenX;
    eventObj.endY = touch.screenY;

    if (e.touches.length > 1) {
        eventObj.isValid = false;
    }
}

function handleEnd() {
    let code;
    let xDelta = eventObj.startX - eventObj.endX;
    let yDelta = eventObj.endY - eventObj.startY;

    if (yDelta > 300) {
        code = TOP_SWIPE
    } else if (yDelta < 0) {
        code = BOTTOM_SWIPE
    }

    // check to see if the delta of X is great enough to trigger a swipe gesture
    // also see if the Y delta wasn't too drastic to be considered horizontal
    if (Math.abs(xDelta) > MIN_X && Math.abs(yDelta) < MAX_Y) {
        // acceptable swipe, now if it delta is negative, it's a left swipe, otherwise right
        if (xDelta < 0) {
            code = LEFT_SWIPE;
        }
        else {
            code = RIGHT_SWIPE;
        }
    }
    // trigger callback
    if (callback && code && eventObj.isValid) {
        callback(code);
    }

    // reset touch session
    eventObj = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        isValid: true
    };
}
