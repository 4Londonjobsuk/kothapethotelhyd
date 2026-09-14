/**
 * Robust Phone Call Trigger Utility
 * Handles both mobile phone dialer launching, clipboard copying,
 * and opening the front-desk dialog on desktop/iframe environments.
 */
export const initiatePhoneCall = (phoneNumber: string = '+919032666941', phoneDisplay: string = '090326 66941') => {
  const cleanNumber = phoneNumber.trim();

  // 1. Copy formatted/clean number to clipboard so desktop users don't lose it
  try {
    const rawNumber = phoneDisplay.replace(/\s+/g, '');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(rawNumber);
    }
  } catch (err) {
    console.debug('Clipboard copy ignored:', err);
  }

  // 2. Attempt direct dialer trigger
  try {
    window.location.href = `tel:${cleanNumber}`;
  } catch {
    try {
      window.open(`tel:${cleanNumber}`, '_top');
    } catch {
      // Ignore
    }
  }

  // 3. Dispatch event to open CallActionModal for clear UI feedback (especially on desktop & iframes)
  window.dispatchEvent(new CustomEvent('lotus:open-call-modal'));
};
