define([
  './element',
  './node'
], function (elementHelpers, nodeHelpers) {

  var MutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;

  function hasRealMutation(n) {
    return ! nodeHelpers.isEmptyTextNode(n) &&
      ! elementHelpers.isSelectionMarkerNode(n);
  }

  function includeRealMutations(mutations) {
    return mutations.some(function(mutation) {
      return mutations.some.call(mutation.addedNodes, hasRealMutation) ||
        mutations.some.call(mutation.removedNodes, hasRealMutation);
    });
  }

  function observeDomChanges(el, callback) {
    // Flag to avoid running recursively
    var runningPostMutation = false;

    var observer = new MutationObserver(function(mutations) {
      if (! runningPostMutation && includeRealMutations(mutations)) {
        runningPostMutation = true;

        try {
          callback();
        } catch(e) {
          // The catch block is required but we don't want to swallow the error
          throw e;
        } finally {
          // We must yield to let any mutation we caused be triggered
          // in the next cycle
          setTimeout(function() {
            runningPostMutation = false;
          }, 0);
        }
      }
    });

    observer.observe(el, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  return observeDomChanges;
});
