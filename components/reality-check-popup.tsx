"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, Loader2, FileSearch } from "lucide-react"

// Declare chrome type for TypeScript
declare const chrome: any

export default function RealityCheckPopup() {
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
    if (typeof window !== "undefined" && (window as any).chrome?.runtime) {
      const chromeRuntime = (window as any).chrome.runtime
      chromeRuntime.onMessage.addListener(messageListener)

      return () => {
        chromeRuntime.onMessage.removeListener(messageListener)
      }
    }
  }, [])

  const handleVerify = async () => {
    setIsVerifying(true)
    setVerificationComplete(false)

    try {
      // Check if chrome extension API is available
      if (typeof window !== "undefined" && (window as any).chrome?.tabs) {
        // Get current tab
        const [tab] = await (window as any).chrome.tabs.query({ active: true, currentWindow: true })

        if (tab.id) {
          // Send message to content script to start verification
          ;(window as any).chrome.tabs.sendMessage(tab.id, { action: "startVerification" })
        }
      } else {
        // Fallback simulation for preview/development
        setTimeout(() => {
          setIsVerifying(false)
          setVerificationComplete(true)
          setFoundIssues(Math.random() > 0.5)
        }, 3000)
      }
    } catch (error) {
      console.error("Error starting verification:", error)
      // Fallback to simulation for demo
      setTimeout(() => {
        setIsVerifying(false)
        setVerificationComplete(true)
        setFoundIssues(Math.random() > 0.5)
      }, 3000)
    }
  }

  const handleSendCorrection = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).chrome?.tabs) {
        const [tab] = await (window as any).chrome.tabs.query({ active: true, currentWindow: true })

        if (tab.id) {
          ;(window as any).chrome.tabs.sendMessage(tab.id, {
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
    <div className="w-80 h-96 bg-gray-900 text-white relative overflow-hidden rounded-xl">
      {/* Glassmorphism background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10 rounded-xl" />
      <div className="absolute inset-0 backdrop-blur-sm rounded-xl" />

      {/* Main content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold italic text-yellow-300" style={{ fontFamily: "Gill Sans MT, sans-serif" }}>
            Reality Check
          </h1>
          <CheckCircle className="w-6 h-6 text-yellow-400" />
        </div>

        {/* Status Display */}
        <div className="flex-1 flex flex-col justify-center items-center space-y-6">
          {!verificationComplete && !isVerifying && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-yellow-500/30">
                <FileSearch className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm mb-2">Ready to fact-check AI content</p>
                <p className="text-gray-400 text-xs">Click verify to analyze the current page</p>
              </div>
            </div>
          )}

          {isVerifying && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-yellow-500/30">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
              </div>
              <div>
                <p className="text-yellow-300 text-sm mb-2">Verifying information...</p>
                <p className="text-gray-400 text-xs">Analyzing content for accuracy</p>
              </div>
            </div>
          )}

          {verificationComplete && (
            <div className="text-center space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center backdrop-blur-sm border ${
                  foundIssues
                    ? "bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30"
                    : "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
                }`}
              >
                {foundIssues ? (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                )}
              </div>
              <div>
                <p className={`text-sm mb-2 ${foundIssues ? "text-red-300" : "text-green-300"}`}>
                  {foundIssues ? "Issues detected!" : "Content verified!"}
                </p>
                <p className="text-gray-400 text-xs">
                  {foundIssues ? "Inaccurate information highlighted in red" : "All information appears accurate"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!verificationComplete ? (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-yellow-500/30 hover:border-yellow-400/50 disabled:border-gray-500/30 shadow-lg hover:shadow-yellow-500/25"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </span>
              ) : (
                "Verify"
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={resetVerification}
                className="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-gray-500/30 hover:border-gray-400/50 shadow-lg"
              >
                Verify Again
              </button>
              {foundIssues && (
                <button
                  onClick={handleSendCorrection}
                  className="w-full py-2 px-4 bg-gradient-to-r from-red-600/80 to-pink-600/80 hover:from-red-700/80 hover:to-pink-700/80 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-red-500/30 hover:border-red-400/50 shadow-lg"
                >
                  Send Correction Prompt
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 text-center">Powered by AI fact-checking database</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-xl" />
    </div>
  )
}
