/*
* Utility for copying text to clipboard with timeout
* @param text - The text to copy to clipboard
* @param setCopiedState - A function to set the copied state
* @param setTooltipState - A function to set the tooltip state
* @param timeout - The timeout in milliseconds
* @returns void
*/
export async function copyToClipboard(
  text: string,
  setCopiedState: (state: boolean) => void,
  setTooltipState: (state: boolean) => void,
  timeout: number = 2000
) {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTooltipState(true);
    setTimeout(() => {
      setCopiedState(false);
      setTooltipState(false);
    }, timeout);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
  }
}

