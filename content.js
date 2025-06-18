// Content script for Reality Check extension

let isVerifying = false
let highlightedElements = []

// Declare chrome variable
const chrome = window.chrome
// Initialize content script
;(() => {
  console.log("Reality Check content script loaded")

  // Listen for messages from background script and popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case "startVerification":
        startVerification()
        break
      case "verificationComplete":
        handleVerificationResults(request.results)
        break
      case "highlightText":
        highlightFalseText(request.falseInfo)
        break
      case "insertCorrectionPrompt":
        insertCorrectionPrompt(request.correction)
        break
      case "getPageContent":
        sendResponse({ content: getAIContent() })
        break
    }
    return true
  })
})()

// Extract AI-generated content from ChatGPT or Claude
function getAIContent() {
  let content = ""

  // ChatGPT selectors
  const chatGPTMessages = document.querySelectorAll('[data-message-author-role="assistant"]')
  if (chatGPTMessages.length > 0) {
    const lastMessage = chatGPTMessages[chatGPTMessages.length - 1]
    content = lastMessage.innerText || lastMessage.textContent
  }

  // Claude selectors (fallback)
  if (!content) {
    const claudeMessages = document.querySelectorAll(".font-claude-message")
    if (claudeMessages.length > 0) {
      const lastMessage = claudeMessages[claudeMessages.length - 1]
      content = lastMessage.innerText || lastMessage.textContent
    }
  }

  // Generic fallback
  if (!content) {
    const messages = document.querySelectorAll('[role="presentation"], .message, .response')
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      content = lastMessage.innerText || lastMessage.textContent
    }
  }

  return content
}

// Start verification process
function startVerification() {
  if (isVerifying) return

  isVerifying = true
  const content = getAIContent()

  if (!content) {
    console.error("No AI content found to verify")
    isVerifying = false
    return
  }

  // Send content to background script for verification
  chrome.runtime
    .sendMessage({
      action: "startVerification",
      data: { content: content, url: window.location.href },
    })
    .catch((error) => {
      console.error("Failed to send verification request:", error)
      isVerifying = false
    })
}

// Handle verification results
function handleVerificationResults(results) {
  isVerifying = false

  if (results.hasIssues && results.falseStatements) {
    results.falseStatements.forEach((statement) => {
      highlightFalseText(statement.text)
    })

    // Show notification
    showNotification(`Found ${results.falseStatements.length} potential issue(s)`)
  } else {
    showNotification("Content appears accurate!")
  }
}

// Highlight false information on the page
function highlightFalseText(text) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)

  const textNodes = []
  let node

  while ((node = walker.nextNode())) {
    if (node.textContent.includes(text)) {
      textNodes.push(node)
    }
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentNode
    const content = textNode.textContent
    const index = content.indexOf(text)

    if (index !== -1) {
      const beforeText = content.substring(0, index)
      const highlightText = content.substring(index, index + text.length)
      const afterText = content.substring(index + text.length)

      const span = document.createElement("span")
      span.className = "reality-check-highlight"
      span.textContent = highlightText
      span.title = "Potentially inaccurate information detected by Reality Check"

      const fragment = document.createDocumentFragment()
      if (beforeText) fragment.appendChild(document.createTextNode(beforeText))
      fragment.appendChild(span)
      if (afterText) fragment.appendChild(document.createTextNode(afterText))

      parent.replaceChild(fragment, textNode)
      highlightedElements.push(span)
    }
  })
}

// Insert correction prompt into AI chat
function insertCorrectionPrompt(correction) {
  // ChatGPT input selector
  let inputElement = document.querySelector('#prompt-textarea, [data-id="root"] textarea')

  // Claude input selector (fallback)
  if (!inputElement) {
    inputElement = document.querySelector('.ProseMirror, [contenteditable="true"]')
  }

  if (inputElement) {
    const correctionText = `Please correct the following information: ${correction}`

    if (inputElement.tagName === "TEXTAREA") {
      inputElement.value = correctionText
      inputElement.dispatchEvent(new Event("input", { bubbles: true }))
    } else {
      inputElement.textContent = correctionText
      inputElement.dispatchEvent(new Event("input", { bubbles: true }))
    }

    // Focus the input
    inputElement.focus()
  }
}

// Show notification to user
function showNotification(message) {
  const notification = document.createElement("div")
  notification.className = "reality-check-notification"
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 5000)
}

// Clear all highlights
function clearHighlights() {
  highlightedElements.forEach((element) => {
    const parent = element.parentNode
    parent.replaceChild(document.createTextNode(element.textContent), element)
    parent.normalize()
  })
  highlightedElements = []
}
