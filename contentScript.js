console.log('Grok extension: contentScript.js loaded!');

(function() {
  function tryFill(retries = 10) {
    const textarea = document.querySelector('textarea[aria-label="Ask Grok anything"]');
    console.log('Grok extension: textarea found?', !!textarea, 'Retries left:', retries);
    if (textarea) {
      textarea.focus();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeInputValueSetter.call(textarea, window.GROK_SEARCH_QUERY || '');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        const enterDown = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
        const enterPress = new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', bubbles: true });
        const enterUp = new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true });
        textarea.dispatchEvent(enterDown);
        textarea.dispatchEvent(enterPress);
        textarea.dispatchEvent(enterUp);
        // Also try clicking the submit button (up arrow SVG)
        setTimeout(() => {
          const submitSvg = document.querySelector('svg[viewBox="0 0 24 24"] path[d="M5 11L12 4M12 4L19 11M12 4V21"]');
          if (submitSvg) {
            // Find the nearest clickable button or div
            const clickable = submitSvg.closest('button, [role="button"], div');
            if (clickable && typeof clickable.click === 'function') {
              clickable.click();
              console.log('Grok extension: submit button clicked');
            } else {
              console.log('Grok extension: clickable submit button not found');
            }
          } else {
            console.log('Grok extension: submit SVG not found');
          }
        }, 100);
      }, 100);
    } else if (retries > 0) {
      setTimeout(() => tryFill(retries - 1), 200);
    } else {
      console.log('Grok extension: textarea not found after retries');
    }
  }
  tryFill();
})(); 