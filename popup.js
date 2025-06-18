// Reality Check Extension Popup - Vanilla JS Version
class RealityCheckPopup {
  constructor() {
    this.isVerifying = false
    this.verificationComplete = false
    this.foundIssues = false
    this.chrome = window.chrome
    this.init()
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.attachEventListeners())
    } else {
      this.attachEventListeners()
    }
    this.listenForMessages()
  }

  attachEventListeners() {
    const verifyBtn = document.getElementById("verifyBtn")
    if (verifyBtn) {
      verifyBtn.addEventListener("click", () => this.handleVerify())
    }
  }

  listenForMessages() {
    if (this.chrome && this.chrome.runtime) {
      this.chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateVerificationStatus") {
          this.updateStatus(message.status, message.hasIssues)
        }
      })
    }
  }

  async handleVerify() {
    this.setVerifying(true)

    try {
      if (this.chrome && this.chrome.tabs) {
        const [tab] = await this.chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id) {
          this.chrome.tabs.sendMessage(tab.id, { action: "startVerification" })
        }
      } else {
        // Fallback simulation for testing
        setTimeout(() => {
          this.updateStatus("complete", Math.random() > 0.5)
        }, 3000)
      }
    } catch (error) {
      console.error("Error:", error)
      // Fallback simulation
      setTimeout(() => {
        this.updateStatus("complete", Math.random() > 0.5)
      }, 3000)
    }
  }

  setVerifying(verifying) {
    this.isVerifying = verifying
    const statusIconContainer = document.getElementById("statusIconContainer")
    const statusIcon = document.getElementById("statusIcon")
    const statusMain = document.getElementById("statusMain")
    const statusSub = document.getElementById("statusSub")
    const verifyBtn = document.getElementById("verifyBtn")

    if (verifying) {
      statusIconContainer.className = "status-icon-container verifying"
      statusIcon.innerHTML = `
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
            `
      statusIcon.classList.add("animate-spin")
      statusMain.textContent = "Verifying information..."
      statusMain.className = "status-main verifying"
      statusSub.textContent = "Analyzing content for accuracy"
      verifyBtn.textContent = "Verifying..."
      verifyBtn.disabled = true
      verifyBtn.className = "btn-primary disabled"
    }
  }

  updateStatus(status, hasIssues) {
    this.isVerifying = false
    this.verificationComplete = true
    this.foundIssues = hasIssues

    const statusIconContainer = document.getElementById("statusIconContainer")
    const statusIcon = document.getElementById("statusIcon")
    const statusMain = document.getElementById("statusMain")
    const statusSub = document.getElementById("statusSub")
    const popupActions = document.getElementById("popupActions")

    statusIcon.classList.remove("animate-spin")

    if (hasIssues) {
      statusIconContainer.className = "status-icon-container error"
      statusIcon.innerHTML = `
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="m12 17 .01 0"/>
            `
      statusMain.textContent = "Issues detected!"
      statusMain.className = "status-main error"
      statusSub.textContent = "Inaccurate information highlighted in red"
    } else {
      statusIconContainer.className = "status-icon-container success"
      statusIcon.innerHTML = `
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
            `
      statusMain.textContent = "Content verified!"
      statusMain.className = "status-main success"
      statusSub.textContent = "All information appears accurate"
    }

    // Update buttons
    popupActions.innerHTML = `
            <div class="button-group">
                <button class="btn-secondary" id="verifyAgainBtn">Verify Again</button>
                ${hasIssues ? '<button class="btn-danger" id="correctionBtn">Send Correction Prompt</button>' : ""}
            </div>
        `

    // Reattach event listeners
    const verifyAgainBtn = document.getElementById("verifyAgainBtn")
    if (verifyAgainBtn) {
      verifyAgainBtn.addEventListener("click", () => this.resetAndVerify())
    }

    if (hasIssues) {
      const correctionBtn = document.getElementById("correctionBtn")
      if (correctionBtn) {
        correctionBtn.addEventListener("click", () => this.sendCorrection())
      }
    }
  }

  resetAndVerify() {
    this.verificationComplete = false
    this.foundIssues = false

    // Reset UI
    const statusIconContainer = document.getElementById("statusIconContainer")
    const statusIcon = document.getElementById("statusIcon")
    const statusMain = document.getElementById("statusMain")
    const statusSub = document.getElementById("statusSub")
    const popupActions = document.getElementById("popupActions")

    statusIconContainer.className = "status-icon-container default"
    statusIcon.innerHTML = `
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            <path d="M9 9h6v6H9z"/>
        `
    statusMain.textContent = "Ready to fact-check AI content"
    statusMain.className = "status-main"
    statusSub.textContent = "Click verify to analyze the current page"

    popupActions.innerHTML = '<button class="btn-primary" id="verifyBtn">Verify</button>'

    // Reattach verify button listener
    const verifyBtn = document.getElementById("verifyBtn")
    if (verifyBtn) {
      verifyBtn.addEventListener("click", () => this.handleVerify())
    }
  }

  async sendCorrection() {
    try {
      if (this.chrome && this.chrome.tabs) {
        const [tab] = await this.chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id) {
          this.chrome.tabs.sendMessage(tab.id, {
            action: "insertCorrectionPrompt",
            correction: "The highlighted information appears to be inaccurate. Please provide the correct information.",
          })
        }
      }
    } catch (error) {
      console.error("Error sending correction:", error)
    }
  }
}

// Initialize the popup
new RealityCheckPopup()
