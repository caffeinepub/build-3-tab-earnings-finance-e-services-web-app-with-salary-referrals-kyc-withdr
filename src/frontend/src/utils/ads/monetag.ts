let scriptLoaded = false;
let scriptLoading = false;

export function loadMonetagScript(): Promise<void> {
  if (scriptLoaded) {
    return Promise.resolve();
  }

  if (scriptLoading) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (scriptLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  scriptLoading = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '//libtl.com/sdk.js';
    script.setAttribute('data-zone', '10570310');
    script.setAttribute('data-sdk', 'show_10570310');
    script.async = true;

    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
    };

    script.onerror = () => {
      scriptLoading = false;
      reject(new Error('Failed to load Monetag script'));
    };

    document.head.appendChild(script);
  });
}

export async function showMonetagAd(): Promise<void> {
  try {
    await loadMonetagScript();

    if (typeof window !== 'undefined' && 'show_10570310' in window) {
      const showFn = (window as any).show_10570310;
      if (typeof showFn === 'function') {
        await showFn();
        return;
      }
    }

    console.warn('Monetag ad function not available');
  } catch (error) {
    console.error('Error showing Monetag ad:', error);
    throw error;
  }
}
