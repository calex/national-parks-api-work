'use strict';

const getUserRepos = (searchedUserName) => {
    const url = `https://api.github.com/users/${searchedUserName}/repos?owner`;
    
    const options = {
        method: "GET"
    }

    fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => renderSearchResultsIntoDom(responseJson))
        .catch(err => renderErrorMessageIntoDom(err));
}


const watchForm = () => {
    const $form = document.querySelector('#js-search-form');

    $form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const searchNameInputByUser = $form.querySelector('#js-search-term').value;
        getUserRepos(searchNameInputByUser);
    });
}

const createListItemDomEl = item => {
    return `<li><p><a href='${item.html_url}'>${item.name}</a></p></li>`;
}

const showDomItem = ($item) => {
    $item.classList.remove('hidden');
}

const hideDomItem = ($item) => {
    $item.classList.add('hidden');
}

const $resultsSection = document.querySelector('#js-results-section');
const $errorMessageDomEl = document.querySelector('#js-error-message');

const renderSearchResultsIntoDom = (responseJsonFromApi) => {

    const listItems = responseJsonFromApi.map((item) => createListItemDomEl(item));
        
    const domReadyListItems = listItems.join("");
    
    const $searchResultsList = document.querySelector('#search-results-list');
    
    $searchResultsList.innerHTML = domReadyListItems;

    showDomItem($resultsSection);

    hideDomItem($errorMessageDomEl);
}

const renderErrorMessageIntoDom = (error) => {    
    $errorMessageDomEl.innerHTML = `<span>${error}</span>`;

    showDomItem($errorMessageDomEl);

    hideDomItem($resultsSection);
}

document.addEventListener("DOMContentLoaded", () => {
    watchForm();
});


