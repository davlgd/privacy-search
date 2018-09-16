"use strict";
(function() {
    
    // After install, we launch option page to allow user to select its favorite search engine
    browser.runtime.onInstalled.addListener(function (infos) {
        if (infos.reason == "install")
            browser.runtime.openOptionsPage();
    });
    
    // We define the list of privacy aware search engines and store it locally
    const searchEngines = [
        { name: "DuckDuckGo", url: "duckduckgo.com" },
        { name: "Framabee", url: "framabee.org" },
        { name: "Oscobo", url: "oscobo.com/search.php" },
        { name: "Qwant", url: "qwant.com" },
        { name: "Qwant Junior", url: "qwantjunior.com" },
        { name: "Qwant Lite", url: "lite.qwant.com" },
        { name: "Startpage", url: "startpage.com/do/asearch" }
    ];
    browser.storage.local.set({searchEnginesList: searchEngines});

    // We check if incognito mode is activated for the current window
    let IsIncognitoActive = false;
    browser.windows.onFocusChanged.addListener(function(id){
        browser.windows.getCurrent(function (properties) {
            IsIncognitoActive = properties.incognito;
        });
    });

    // We get selected search engine from synced storage
    browser.storage.sync.get(["selectedSearchEngine"], function(items){

        browser.webRequest.onBeforeRequest.addListener(function (request) {

            // If the privacy search engine URL is not defined, we use Qwant
            if (typeof items.selectedSearchEngine === "undefined" || typeof searchEngines[items.selectedSearchEngine].url === "undefined") items.selectedSearchEngine = 3;
            let privacySearchEngineUrl = `https://${searchEngines[items.selectedSearchEngine].url}`;

            const askedURL = new URL(request.url);
            const keywords = askedURL.searchParams.get("q");
            
            // If the incognito mode is not active and non privacy aware search engine URL is detected
            if (/bing.|google.|yahoo./.test(askedURL.hostname) && !IsIncognitoActive && !/youtube.com/.test(request.initiator))
            {   
                const destinationUrl = (keywords) ? `${privacySearchEngineUrl}?q=${keywords}` : privacySearchEngineUrl;
                return { redirectUrl: destinationUrl };
            }
        }, 
        { urls: ["<all_urls>"] }, ["blocking"]);
        
        // If the user change the selected privacy search engine, we use the new value
        browser.storage.onChanged.addListener(function(changes) {
            if (changes["selectedSearchEngine"])
                items.selectedSearchEngine = changes["selectedSearchEngine"].newValue;
        });
    });
})();