/**
 * Logic identifying job descriptions on common platforms
 */
const SELECTORS = {
    'indeed.com': '#jobDescriptionText',
    'linkedin.com': '.jobs-description-content__text, .jobs-description__container',
    'welcometothejungle.com': '[data-testid="job-section-description"]',
    'glassdoor.com': '.jobDescriptionContent',
};

function getJobDescription() {
    const domain = window.location.hostname;
    let description = "";

    // Try platform-specific selectors
    for (const [key, selector] of Object.entries(SELECTORS)) {
        if (domain.includes(key)) {
            const el = document.querySelector(selector);
            if (el) {
                description = el.innerText || el.textContent;
                break;
            }
        }
    }

    // Fallback: search for long text blocks if nothing found
    if (!description) {
        const article = document.querySelector('article') || document.body;
        // This is a very basic heuristic: find the largest text container
        // In a real scenario, we'd use better heuristics
        description = article.innerText.slice(0, 10000); 
    }

    return description.trim();
}

/**
 * Listen for messages from the popup or background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_JOB_DATA") {
        sendResponse({
            title: document.title,
            url: window.location.href,
            description: getJobDescription()
        });
    }
});
