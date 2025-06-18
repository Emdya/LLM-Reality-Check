// Background script for Reality Check extension

// Declare the chrome variable
const chrome = window.chrome

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Reality Check extension installed")
})

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startVerification") {
    handleVerification(sender.tab?.id, request.data)
    sendResponse({ success: true })
  } else if (request.action === "highlightFalseInfo") {
    highlightFalseInformation(sender.tab?.id, request.falseInfo)
    sendResponse({ success: true })
  } else if (request.action === "sendCorrectionPrompt") {
    sendCorrectionToAI(sender.tab?.id, request.correction)
    sendResponse({ success: true })
  }

  return true // Keep message channel open for async response
})

// Simulate fact-checking API call
async function handleVerification(tabId: number | undefined, data: any) {
  if (!tabId) return

  try {
    // Simulate API call to your fact-checking database
    const response = await simulateFactCheckAPI(data)

    // Send results back to content script
    chrome.tabs
      .sendMessage(tabId, {
        action: "verificationComplete",
        results: response,
      })
      .catch((error) => {
        console.log("Content script not available:", error)
      })

    // Update popup if it's open
    chrome.runtime
      .sendMessage({
        action: "updateVerificationStatus",
        status: "complete",
        hasIssues: response.hasIssues,
      })
      .catch((error) => {
        console.log("Popup not available:", error)
      })
  } catch (error) {
    console.error("Verification failed:", error)
    chrome.tabs
      .sendMessage(tabId, {
        action: "verificationError",
        error: (error as Error).message,
      })
      .catch((err) => {
        console.log("Content script not available:", err)
      })
  }
}

// Simulate fact-checking API
async function simulateFactCheckAPI(content: any): Promise<any> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock response - replace with actual API call
  return {
    hasIssues: Math.random() > 0.5,
    falseStatements: [
      {
        text: "Example false statement",
        reason: "This information is outdated",
        correction: "The correct information is...",
      },
    ],
    confidence: 0.85,
  }
}

// Highlight false information on the page
function highlightFalseInformation(tabId: number | undefined, falseInfo: any) {
  if (!tabId) return

  chrome.tabs
    .sendMessage(tabId, {
      action: "highlightText",
      falseInfo: falseInfo,
    })
    .catch((error) => {
      console.log("Content script not available:", error)
    })
}

// Send correction prompt to AI
function sendCorrectionToAI(tabId: number | undefined, correction: string) {
  if (!tabId) return

  chrome.tabs
    .sendMessage(tabId, {
      action: "insertCorrectionPrompt",
      correction: correction,
    })
    .catch((error) => {
      console.log("Content script not available:", error)
    })
}
