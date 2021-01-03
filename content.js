const isDebugging = true;
let observerDisabler = null;
let raidId = '';

// return disabler of the observer
const observeDOM = (function () {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1) return;

        let disabler = null;
        if (MutationObserver) {
            if (isDebugging) console.log('observeDOM: define a new observer.');
            // define a new observer
            const mutationObserver = new MutationObserver(callback)

            // have the observer observe the object for changes in children
            mutationObserver.observe(obj, {childList: true, subtree: true})

            disabler = function() {
                if (isDebugging) console.log('disconnect mutation observer.');
                mutationObserver.disconnect();
            };
        }
        // browser support event listener
        else if (window.addEventListener) {
            if (isDebugging) console.log('observeDOM: browser support event listener.');
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)

            disabler = function() {
                if (isDebugging) console.log('remove event listener.');

                obj.remove('DOMNodeInserted', callback);
                obj.remove('DOMNodeRemoved', callback);
            };
        } else {
            if (isDebugging) console.log('observeDOM: failed to observe DOM.');
        }

        return disabler;
    }
})()

const copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(function() {
        if (isDebugging) console.log('Copying to clipboard was successful!', text);
    }, function(err) {
        if (isDebugging) console.log('Could not copy text: ', err);
    });
}

const enableAutoCopy = function() {
    if (isDebugging) console.log('enable auto-copy.');

    const classNames = 'mdl-list gbfrf-tweets';
    const elements = document.getElementsByClassName(classNames);
    const element = elements[0];

    // save the returned disabler
    observerDisabler = observeDOM(element, function (m) {
        // save the Raid-ID of the first element
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
};

const disableAutoCopy = function() {
    if (isDebugging) console.log('disable auto-copy.');
    if (observerDisabler) {
        observerDisabler();
    }
};

// default enable auto-copy
enableAutoCopy();

// show the controller
$('body').append(
    `<div class="auto-copy">
        <span class="title">Auto Copy</span>
        <input type="checkbox" checked />
    <div>`
);
$('.auto-copy input[type="checkbox"]').change(function() {
    if (this.checked) enableAutoCopy();
    else disableAutoCopy();
});

// on blur
$(window).blur(function(e) {
    copyToClipboard(raidId);
});
// on focus
$(window).focus(function(e) {
    copyToClipboard(raidId);
});