"use strict";
(function() {
    
    document.title = "Privacy Search - Options";
    
    let searchEnginesList = document.getElementById("searchEngine");
    let questionLabel = document.getElementById("question");
    questionLabel.innerText = chrome.i18n.getMessage("searchEngineToSelectText");

    chrome.storage.local.get(["searchEnginesList"], function(items){
        items.searchEnginesList.forEach(element => {
            let searchEnginesOption = document.createElement("option");
            searchEnginesOption.value = element.url;
            searchEnginesOption.text = element.name;
            searchEnginesList.append(searchEnginesOption);
        });
    });

    function saveOptions() {
        let searchEngine = searchEnginesList.selectedIndex;
        
        chrome.storage.sync.set({
            selectedSearchEngine: searchEngine,
        }, function() {
            let status = document.getElementById("status");
            status.textContent = chrome.i18n.getMessage("optionsSaved");
            setTimeout(function() {
                status.textContent = "";
            }, 2000);
        });
    }

    function restoreOptions() {
        chrome.storage.sync.get(["selectedSearchEngine"], function(items) {
            if (items.selectedSearchEngine) 
                searchEnginesList.selectedIndex = items.selectedSearchEngine;
            else 
                searchEnginesList.selectedIndex = 3;
        });
    }

    document.addEventListener('DOMContentLoaded', restoreOptions, false);
    document.querySelector("#searchEngine").onchange = saveOptions;
})();