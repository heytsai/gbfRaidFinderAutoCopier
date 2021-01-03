const isDebugging = true;

const observeDOM = (function () {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1) return;

        if (MutationObserver) {
            if (isDebugging) console.log('observeDOM: define a new observer.');
            // define a new observer
            const mutationObserver = new MutationObserver(callback)

            // have the observer observe the object for changes in children
            mutationObserver.observe(obj, {childList: true, subtree: true})
            return mutationObserver
        }
        // browser support fallback
        else if (window.addEventListener) {
            if (isDebugging) console.log('observeDOM: browser support fallback.');
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)
        }
    }
})()

const copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(function() {
        if (isDebugging) console.log('Copying to clipboard was successful!', text);
    }, function(err) {
        if (isDebugging) console.log('Could not copy text: ', err);
    });
}

const classNames = 'mdl-list gbfrf-tweets';
const elements = document.getElementsByClassName(classNames);
const element = elements[0];
let raidId = '';

// Observe a specific DOM element:
observeDOM(element, function (m) {
    const recordClassNames = 'gbfrf-tweet gbfrf-js-tweet mdl-list__item';
    const records = element.getElementsByClassName(recordClassNames);
    const firstRecord = records[0];
    const keyRaidId = 'data-raidid';
    const newRaidId = firstRecord.getAttribute(keyRaidId);

    if (raidId !== newRaidId) {
        raidId = newRaidId;
        // copy to clipboard
        copyToClipboard(raidId);
    }
});

// on blur
$(window).blur(function(e) {
    copyToClipboard(raidId);
});
// on focus
$(window).focus(function(e) {
    copyToClipboard(raidId);
});