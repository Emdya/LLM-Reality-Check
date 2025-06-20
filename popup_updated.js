document.addEventListener('DOMContentLoaded', function() {
    const verifyBtn = document.getElementById('verifyBtn');
    const viewDetailsBtn = document.getElementById('viewDetailsBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const feedbackYes = document.getElementById('feedbackYes');
    const feedbackNo = document.getElementById('feedbackNo');
    const settingsLink = document.getElementById('settingsLink');

    // Verify button click handler
    verifyBtn.addEventListener('click', async function() {
        // Update status to loading
        updateStatus('Analyzing content...', 'Checking for potential hallucinations', 'loading');
        
        try {
            // Get current tab content (simplified example)
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            const response = await chrome.tabs.sendMessage(tab.id, {action: "analyze_page"});
            
            if (response.error) {
                updateStatus('Analysis failed', response.error, 'error');
                return;
            }
            
            // Show results
            displayResults(response.data);
            updateStatus('Analysis complete', `${response.data.issues.length} potential issues found`, response.data.issues.length ? 'warning' : 'success');
            
            // Toggle buttons
            verifyBtn.style.display = 'none';
            viewDetailsBtn.style.display = 'block';
            resultsContainer.style.display = 'block';
            
        } catch (error) {
            updateStatus('Error', 'Could not analyze page content', 'error');
            console.error(error);
        }
    });

    // Feedback handlers
    feedbackYes.addEventListener('click', function() {
        sendFeedback(true);
        this.classList.add('active');
        feedbackNo.classList.remove('active');
    });

    feedbackNo.addEventListener('click', function() {
        sendFeedback(false);
        this.classList.add('active');
        feedbackYes.classList.remove('active');
    });

    // Settings link handler
    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });

    function displayResults(data) {
        const summaryEl = document.getElementById('resultsSummary');
        const itemsEl = document.getElementById('highlightedItems');
        
        // Update summary
        summaryEl.textContent = data.summary || `Found ${data.issues.length} potential issues`;
        
        // Clear previous items
        itemsEl.innerHTML = '';
        
        // Add highlighted items
        data.issues.forEach(issue => {
            const item = document.createElement('div');
            item.className = 'highlight-item';
            item.innerHTML = `
                <p><strong>${issue.type}:</strong> ${issue.text}</p>
                <p class="suggestion">${issue.suggestion}</p>
            `;
            itemsEl.appendChild(item);
        });
    }

    function updateStatus(mainText, subText, status) {
        const statusMain = document.getElementById('statusMain');
        const statusSub = document.getElementById('statusSub');
        const iconContainer = document.getElementById('statusIconContainer');
        const icon = document.getElementById('statusIcon');
        
        statusMain.textContent = mainText;
        statusSub.textContent = subText;
        
        // Reset classes
        iconContainer.className = 'status-icon-container';
        icon.innerHTML = '';
        
        // Set new status
        iconContainer.classList.add(status);
        
        // Update icon based on status
        switch(status) {
            case 'loading':
                icon.innerHTML = `<path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>`;
                break;
            case 'success':
                icon.innerHTML = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`;
                break;
            case 'warning':
                icon.innerHTML = `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`;
                break;
            case 'error':
                icon.innerHTML = `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`;
                break;
            default:
                icon.innerHTML = `<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path d="M9 9h6v6H9z"/>`;
        }
    }

    function sendFeedback(isPositive) {
        chrome.runtime.sendMessage({
            action: "send_feedback",
            isPositive: isPositive,
            // Include additional context if available
            analysisData: window.lastAnalysisData 
        });
    }
});
