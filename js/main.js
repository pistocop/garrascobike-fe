console.log('Garrascobike started!')

const beHost = "https://garrascobike-backend.herokuapp.com";
const healthEndpoint = "/health";
const brandsEndpoint = "/brands/available"
const suggestionEndpoint = "/recommender/"

const healthText = document.querySelector('#health-timestamp');
const cardsSection = document.querySelector('.cards-section');
const centerSection = document.querySelector('.center-section');
const leftCard = document.querySelector('.cards-section>.left');
const centerCard = document.querySelector('.cards-section>.center');
const rightCard = document.querySelector('.cards-section>.right');

let brandList;

function updateHealthCheck() {
    fetch(beHost + healthEndpoint)
        .then(response => response.json())
        .then(response => new Date(response).toLocaleTimeString())
        .then(() => healthText.textContent = "✅ Online")
        .then(() => centerSection.style.opacity = 1);

}

function updateCardsTitles(suggestion) {
    const descriptionPlaceholder = "Bike additional data not available"


    leftCard.querySelector(".bike-title").textContent = suggestion[1].bike;
    centerCard.querySelector(".bike-title").textContent = suggestion[2].bike;
    rightCard.querySelector(".bike-title").textContent = suggestion[3].bike;


    leftCard.querySelector(".bike-description").textContent = '';
    centerCard.querySelector(".bike-description").textContent = '';
    rightCard.querySelector(".bike-description").textContent = '';
    cardsSection.style.display = "flex";

}

function getRecommendation(bikeName) {
    cardsSection.style.display = "none";
    fetch(beHost + suggestionEndpoint + bikeName)
        .then(response => response.json())
        .then(suggestion => updateCardsTitles(suggestion));
}

async function getBrands() {
    await fetch(beHost + brandsEndpoint)
        .then(response => response.json())
        .then(response => brandList = response)
        .then(() => console.log("Loaded " + brandList.length + " brands"));
}

updateHealthCheck()
getBrands()


// The autoComplete.js Engine instance creator
// Code from: https://tarekraafat.github.io/autoComplete.js/#/playground
const autoCompleteJS = new autoComplete({
    data: {
        src: async() => {
            try {
                // Loading placeholder text
                document
                    .getElementById("autoComplete")
                    .setAttribute("placeholder", "Loading...");
                // Fetch External Data Source
                const data = await brandList;
                // Post Loading placeholder text
                document
                    .getElementById("autoComplete")
                    .setAttribute("placeholder", autoCompleteJS.placeHolder);
                // Returns Fetched data
                return data;
            } catch (error) {
                return error;
            }
        },
        cache: true
    },
    placeHolder: "Ask me a bike...",
    resultsList: {
        element: (list, data) => {
            const info = document.createElement("p");
            if (data.results.length > 0) {
                info.innerHTML = `Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
            } else {
                info.innerHTML = `Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
            }
            list.prepend(info);
        },
        noResults: true,
        maxResults: 15,
        tabSelect: true
    },
    resultItem: {
        element: (item, data) => {
            // Modify Results Item Style
            item.style = "display: flex; justify-content: space-between;";
            // Modify Results Item Content
            item.innerHTML = `
      <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
        ${data.match}
      </span>
      `;
        },
        highlight: true
    },
    events: {
        input: {
            focus: () => {
                if (autoCompleteJS.input.value.length) autoCompleteJS.start();
            }
        }
    }
});

autoCompleteJS.input.addEventListener("selection", function(event) {
    const feedback = event.detail;
    autoCompleteJS.input.blur();
    // Prepare User's Selected Value
    const selection = feedback.selection.value;

    // Replace Input value with the selected value
    autoCompleteJS.input.value = selection;

    // Call the API for make the suggestion
    console.log("Ask recommendations for bike " + selection + "...")
    getRecommendation(selection)
});