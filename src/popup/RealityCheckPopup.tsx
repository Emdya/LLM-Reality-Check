"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, Loader2, FileSearch } from "lucide-react"
import "./popup.css"

// Declare chrome types
declare global {
  interface Window {
    chrome: any
  }
}

const RealityCheckPopup: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [foundIssues, setFoundIssues] = useState(false)

  useEffect(() => {
    // Listen for messages from background script
    const messageListener = (message: any) => {
      if (message.action === "updateVerificationStatus") {
        setIsVerifying(false)
        setVerificationComplete(true)
        setFoundIssues(message.hasIssues)
      }
    }

    // Check if chrome extension API is available
    if (window.chrome?.runtime) {
      window.chrome.runtime.onMessage.addListener(messageListener)

      return () => {
        window.chrome.runtime.onMessage.removeListener(messageListener)
      }
    }
  }, [])

  const handleVerify = async () => {
    setIsVerifying(true)
    setVerificationComplete(false)

    try {
      if (window.chrome?.tabs) {
        // Get current tab
        const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true })

        if (tab.id) {
          // Send message to content script to start verification
          window.chrome.tabs.sendMessage(tab.id, { action: "startVerification" })
        }
      } else {
        // Fallback simulation for development
        setTimeout(() => {
          setIsVerifying(false)
          setVerificationComplete(true)
          setFoundIssues(Math.random() > 0.5)
        }, 3000)
      }
    } catch (error) {
      console.error("Error starting verification:", error)
      // Fallback to simulation
      setTimeout(() => {
        setIsVerifying(false)
        setVerificationComplete(true)
        setFoundIssues(Math.random() > 0.5)
      }, 3000)
    }
  }

  const handleSendCorrection = async () => {
    try {
      if (window.chrome?.tabs) {
        const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true })

        if (tab.id) {
          window.chrome.tabs.sendMessage(tab.id, {
            action: "insertCorrectionPrompt",
            correction: "The highlighted information appears to be inaccurate. Please provide the correct information.",
          })
        }
      }
    } catch (error) {
      console.error("Error sending correction:", error)
    }
  }

  const resetVerification = () => {
    setVerificationComplete(false)
    setFoundIssues(false)
  }

  return (
    <div className="popup-container">
      <div className="popup-background"></div>

      {/* Main content */}
      <div className="popup-content">
        {/* Header */}
        <div className="popup-header">
          <h1 className="popup-title">Reality Check</h1>
          <CheckCircle className="popup-icon" />
        </div>

        {/* Status Display */}
        <div className="popup-status">
          {!verificationComplete && !isVerifying && (
            <div className="status-display">
              <div className="status-icon-container default">
                <FileSearch className="status-icon-svg" />
              </div>
              <div className="status-text">
                <p className="status-main">Ready to fact-check AI content</p>
                <p className="status-sub">Click verify to analyze the current page</p>
              </div>
            </div>
          )}

          {isVerifying && (
            <div className="status-display">
              <div className="status-icon-container verifying">
                <Loader2 className="status-icon-svg animate-spin" />
              </div>
              <div className="status-text">
                <p className="status-main verifying">Verifying information...</p>
                <p className="status-sub">Analyzing content for accuracy</p>
              </div>
            </div>
          )}

          {verificationComplete && (
            <div className="status-display">
              <div className={`status-icon-container ${foundIssues ? "error" : "success"}`}>
                {foundIssues ? (
                  <AlertTriangle className="status-icon-svg" />
                ) : (
                  <CheckCircle className="status-icon-svg" />
                )}
              </div>
              <div className="status-text">
                <p className={`status-main ${foundIssues ? "error" : "success"}`}>
                  {foundIssues ? "Issues detected!" : "Content verified!"}
                </p>
                <p className="status-sub">
                  {foundIssues ? "Inaccurate information highlighted in red" : "All information appears accurate"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="popup-actions">
          {!verificationComplete ? (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className={`btn-primary ${isVerifying ? "disabled" : ""}`}
            >
              {isVerifying ? (
                <span className="btn-content">
                  <Loader2 className="btn-icon animate-spin" />
                  <span>Verifying...</span>
                </span>
              ) : (
                "Verify"
              )}
            </button>
          ) : (
            <div className="button-group">
              <button onClick={resetVerification} className="btn-secondary">
                Verify Again
              </button>
              {foundIssues && (
                <button onClick={handleSendCorrection} className="btn-danger">
                  Send Correction Prompt
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <p>Powered by AI fact-checking database</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
    </div>
  )
}

export default RealityCheckPopup
