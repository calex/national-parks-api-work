'use strict';

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

const getParks = (stateCodes, maxResults = 10) => {
    const apiKey = 'WzATmcuX6aVVhFuWaMk2T2T6ZrAi04KdHOsrclaV';

    const params = {
        stateCode: stateCodes,
        api_key: apiKey,
        limit: maxResults
    };

    const queryString = formatQueryParams(params);
    
    const url = `https://developer.nps.gov/api/v1/parks?${queryString}`;

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

const $resultsSection = document.querySelector('#js-results-section');
const $errorMessageDomEl = document.querySelector('#js-error-message');
const $searchResultsList = document.querySelector('#search-results-list');

const watchForm = () => {
    const $form = document.querySelector('#js-search-form');

    const $checkboxes = $form.elements[ 'states[]' ];

    const $searchLimitChoiceDomEl = $form.querySelector('#search-limit-choice');

    $form.addEventListener("submit", (e) => {
        e.preventDefault();

        showDomItem($resultsSection);
        hideDomItem($errorMessageDomEl);
        
        $searchResultsList.innerHTML = "<li><p>Searching&hellip;</li></p>"

        const selectedCheckboxValues = [];

        for (let i=0; i < $checkboxes.length; i++) {

            if ($checkboxes[i].checked) {
                selectedCheckboxValues.push($checkboxes[i].value);
            }
        }

        if (selectedCheckboxValues.length > 0) {
            const checkboxStateValuesToSearchWith = selectedCheckboxValues.join(",");

            const limitSearchResultsNumber = $searchLimitChoiceDomEl.value;

            getParks(checkboxStateValuesToSearchWith, limitSearchResultsNumber);
        }
        else {
            renderErrorMessageIntoDom("Please pick at least one state!");
        }

    });

}

const createListItemDomEl = item => {

    const physicalAddressObject = item.addresses.find(address => address.type === "Physical");

    const physicalAddressObjectLine1DomEl = (physicalAddressObject.line1.length > -1) ? `<p>${physicalAddressObject.line1}</p>` : null;
    const physicalAddressObjectLine2DomEl = (physicalAddressObject.line2.length > -1) ? `<p>${physicalAddressObject.line2}</p>` : null;
    const physicalAddressObjectLine3DomEl = (physicalAddressObject.line3.length > -1) ? `<p>${physicalAddressObject.line3}</p>` : null;
    const physicalAddressObjectCityDomEl = (physicalAddressObject.city.length > -1) ? `<span>${physicalAddressObject.city}</span>` : null;
    const physicalAddressObjectStateDomEl = (physicalAddressObject.stateCode.length > -1) ? `<span>${physicalAddressObject.stateCode}</span>` : null;
    const physicalAddressObjectPostalCodeDomEl = (physicalAddressObject.postalCode.length > -1) ? `<span>${physicalAddressObject.postalCode}</span>` : null;

    return `<li>
                <h4><a href='${item.url}'>${item.fullName} (${physicalAddressObject.stateCode})</a></h4>
                <p>${item.description}</p>
                <p><b>Website:</b> <a href='${item.url}'>${item.url}</a></p>
                <p><u>Physical Address</u></p>
                <address>
                    ${physicalAddressObjectLine1DomEl}
                    ${physicalAddressObjectLine2DomEl}
                    ${physicalAddressObjectLine3DomEl}
                    <p>${physicalAddressObjectCityDomEl}, ${physicalAddressObjectStateDomEl} ${physicalAddressObjectPostalCodeDomEl}</p>
                </address>
            </li>`;
}

const showDomItem = ($item) => {
    $item.classList.remove('hidden');
}

const hideDomItem = ($item) => {
    $item.classList.add('hidden');
}

const renderSearchResultsIntoDom = (responseJsonFromApi) => {

    const listItems = responseJsonFromApi.data.map((item) => createListItemDomEl(item));
        
    const domReadyListItems = listItems.join("");
        
    $searchResultsList.innerHTML = domReadyListItems;

    showDomItem($resultsSection);

    hideDomItem($errorMessageDomEl);
}

const renderErrorMessageIntoDom = (error) => {    
    $errorMessageDomEl.innerHTML = `<span>Looks like we couldn't get you a list of parks because there was an error: ${error}</span>`;

    showDomItem($errorMessageDomEl);

    hideDomItem($resultsSection);
}

document.addEventListener("DOMContentLoaded", () => {
    watchForm();
});


