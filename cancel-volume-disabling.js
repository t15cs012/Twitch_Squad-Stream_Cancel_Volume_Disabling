(function () {
    var cleanupHistoryListener = null;
    var targetNodes = null;
    var intervalIds = [];
    var config = {
        attributes: false,
        childList: true,
        subtree: true
    };
    var observer = new MutationObserver(mutationCallback);

    function mutationCallback(mutations, _observer) {
        for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
            var _mutation = mutations_1[_i];
            if (targetNodes.length) {
                toggleDisabled();
            }
        }
    }

    function toggleDisabled() {
        targetNodes.forEach(element => {
            element.disabled = false;
            element.classList.forEach(className => {
                if (~className.indexOf('disabled')) {
                    element.classList.remove(className);
                }
            });
        });
    }

    function findDisabledContainer() {
        var timer = setInterval(function () {
            targetNodes = document.querySelectorAll('[disabled]');
            if (targetNodes.length) {
                // Check if there is already a disabling volume
                toggleDisabled();

                // Observe for future disabling volume
                observer.observe(targetNodes, config);
                clearInterval(timer);
            }
        }, 1000);
        intervalIds.push(timer);
    }

    function start() {
        window.removeEventListener('beforeunload', cleanup);
        window.addEventListener('beforeunload', cleanup);
        findDisabledContainer();
    }

    function cleanup() {
        observer.disconnect();
        for (var _i = 0, intervalIds_1 = intervalIds; _i < intervalIds_1.length; _i++) {
            var id = intervalIds_1[_i];
            clearInterval(id);
        }
        if (cleanupHistoryListener !== null) {
            cleanupHistoryListener();
        }
    }

    start();
    console.log('Twitch Squad-Stream Volume Enabled');
})();
