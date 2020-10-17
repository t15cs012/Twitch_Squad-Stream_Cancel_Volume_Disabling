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
            console.log("toggle disabled");
            element.classList.forEach(className => {
                if (~className.indexOf('disabled')) {
                    element.classList.remove(className);
                    console.log('remove', className);
                }
            });
        });
    }

    function findDisabledContainer() {
        var timer = setInterval(function () {
            targetNodes = document.querySelectorAll('[disabled]');
            if (targetNodes.length) {
                // Check if there is already a bonus to collect
                toggleDisabled();

                // Observe for future bonuses
                observer.observe(targetNodes, config);
                clearInterval(timer);
            }
        }, 1000);
        intervalIds.push(timer);
    }

    function hookIntoReact() {
        // Watch for navigation changes within the React app
        function reactNavigationHook(history) {
            cleanupHistoryListener = history.listen(function (location) {
                if (~location.pathname.indexOf('squad')) {
                    cleanup();
                    start();
                }
            });
        }

        // Find a property within the React component tree
        function findReactProp(node, prop, func) {
            if (node.stateNode &&
                node.stateNode.props &&
                node.stateNode.props[prop]) {
                func(node.stateNode.props[prop]);
            }
            else if (node.child) {
                var child = node.child;
                while (child) {
                    findReactProp(child, prop, func);
                    child = child.sibling;
                }
            }
        }

        // Find the react instance of a element
        function findReactInstance(element, target, func) {
            var timer = setInterval(function () {
                var reactRoot = document.getElementById(element);
                if (reactRoot !== null) {
                    var reactInstance = null;
                    for (var _i = 0, _a = Object.keys(reactRoot); _i < _a.length; _i++) {
                        var key = _a[_i];
                        if (key.startsWith(target)) {
                            reactInstance = reactRoot[key];
                            break;
                        }
                    }
                    if (reactInstance) {
                        func(reactInstance);
                        clearInterval(timer);
                    }
                }
            }, 500);
            intervalIds.push(timer);
        }

        // Find the root instance and hook into the router history
        findReactInstance('root', '_reactRootContainer', function (instance) {
            if (instance._internalRoot && instance._internalRoot.current) {
                // Hook into router
                findReactProp(instance._internalRoot.current, 'history', reactNavigationHook);
                // Determine if the channel has points enabled (May take some time to load)
                var timer_1 = setInterval(function () {
                    findReactProp(instance._internalRoot.current, 'isChannelPointsEnabled', function (value) {
                        if (value) {
                            findDisabledContainer();
                        }
                        clearInterval(timer_1);
                    });
                }, 1000);
                intervalIds.push(timer_1);
            }
        });
    }

    function start() {
        window.removeEventListener('beforeunload', cleanup);
        window.addEventListener('beforeunload', cleanup);
        hookIntoReact();
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
