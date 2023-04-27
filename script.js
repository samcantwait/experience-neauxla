// Create a main class for building outing objects
class Outing {
    // Use the current date and a random number to create a unique ID, the date will also be used in the description
    date = new Date();
    random = Math.random() + '';
    id = ((Date.now() + '').slice(-10) + this.random);

    constructor(rating, coords) {
        this.rating = rating;
        this.coords = coords;
    }

    // Create the description of the Outing
    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

// Create a subclass of for a music outing, which extends Outing
class Music extends Outing {
    type = 'music';

    constructor(rating, coords, venue, band, duration, drinks) {
        super(rating, coords);
        this.venue = venue;
        this.band = band;
        this.duration = duration;
        this.drinks = drinks;
        this.calcDrinksPerHour();
        this._setDescription();
    }

    // Calculate the average drinks consumed per hour based on user input
    calcDrinksPerHour() {
        this.drinksPerHour = (this.drinks / (this.duration / 60)).toFixed(1);
        return this.drinksPerHour;
    }
}

// Create a subclass of for a dining outing, which extends Outing
class Dining extends Outing {
    type = 'dining';

    constructor(rating, coords, restaurantName, cuisine, cost, people) {
        super(rating, coords);
        this.restaurantName = restaurantName;
        this.cuisine = cuisine;
        this.cost = cost;
        this.people = people;
        this.calcCostPerPerson();
        this._setDescription();
    }

    // Calculate the average cost per person based on user input
    calcCostPerPerson() {
        this.costPerPerson = (this.cost / this.people).toFixed(2);
        return this.costPerPerson;
    }
}


// Select the DOM elements needed to create a new instance of the Outing class and for user interactions
const form = document.querySelector('.form');
const getType = document.querySelector('.form__input--type');
const lowerForms = document.querySelectorAll('.form__lower');
const list = document.querySelector('.list');
const rating = document.querySelector('.form__input--rating');
const venue = document.querySelector('.form__input--venue');
const band = document.querySelector('.form__input--band');
const duration = document.querySelector('.form__input--duration');
const drinks = document.querySelector('.form__input--drinks');
const restaurant = document.querySelector('.form__input--restaurant');
const cuisine = document.querySelector('.form__input--cuisine');
const cost = document.querySelector('.form__input--cost');
const people = document.querySelector('.form__input--people');

// Create the main App class
class App {
    #map;
    #mapEvent;
    #mapZoom = 16;
    #latitude = 29.959026;
    #longitude = -90.065218;
    #outings = [];
    #markers = [];

    constructor() {
        // Display hard coded outings as examples to the user
        this._firstOutings();
        // If there are any outings in local storage, display them
        this._getLocalStorage();
        // Display the map with the hard coded latitude and longtitude so that it shows the French Quarter in NOLA
        this._displayMap();

        // Use bind when submitting the form so that the 'this' keyword will refer to the app instance rather than the form.
        form.addEventListener('submit', this._newOuting.bind(this));
        // Opening the form is primarily for UX regarding screen space
        form.addEventListener('click', this._openForm);
        // If the type of outing is changed, the form also needs to change accordingly
        getType.addEventListener('change', this._selectType);
        // Move the map to the correct popup clicked by the user and bind the app instance
        list.addEventListener('click', this._moveToPopup.bind(this));
    }

    _displayMap() {
        // The map is displayed using Leaflet
        this.#map = L.map('map').setView([this.#latitude, this.#longitude], this.#mapZoom);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map);

        // When the map is clicked, it transmits information about lat and long, etc. so we bind the app instance again
        this.#map.on('click', this._displayForm.bind(this));
        // Call the functions to create the Outing object and render a marker on the map
        this.#outings.forEach(outing => {
            this._renderOuting(outing);
            this._renderMarker(outing);
        })
    }

    // Opens the form, UX effect
    _openForm() {
        const type = document.querySelector('.form__input--type').value;
        document.querySelector(`.form__lower--${type}`).style.display = 'inline-block';
    }

    // The form is initially hidden, this reveals it, UX effect
    _displayForm(mapEvent) {
        form.classList.remove('hidden');
        this.#mapEvent = mapEvent;
    }

    // Hide the form again after submission, UX effect
    _hideForm() {
        rating.value = restaurant.value = cuisine.value = cost.value = people.value = venue.value = band.value = duration.value = drinks.value = '';
        form.classList.add('hidden');
    }

    // Display the proper form based on the type of outing
    _selectType() {
        lowerForms.forEach(form => {
            form.style.display = 'none';
        })
        const type = document.querySelector('.form__input--type').value;
        document.querySelector(`.form__lower--${type}`).style.display = 'inline-block'
    }

    // Create a new outing 
    _newOuting(e) {
        e.preventDefault();
        const { lat, lng } = this.#mapEvent.latlng;
        const outingType = document.querySelector('.form__input--type').value;

        let outing;
        // Create a new dining outing
        if (outingType === 'dining') {
            outing = new Dining(rating.value, [lat, lng], restaurant.value, cuisine.value, cost.value, people.value);
        }
        // Create a new music outing
        if (outingType === 'music') {
            outing = new Music(rating.value, [lat, lng], venue.value, band.value, +duration.value, +drinks.value);
        }

        // Add the new outing to the #outings array 
        this.#outings.push(outing);
        // Create the html components for the outing
        this._renderOuting(outing);
        // Hide the form
        this._hideForm();
        // Create the marker based on the outing instances lat and long
        this._renderMarker(outing);
        // Update local storage with the current #outings array
        this._setLocalStorage();
    }

    // Create the html markup for the outing
    _renderOuting(outing) {
        let html;
        if (outing.type === 'dining') {
            html =
                `
                <li class="list__item outing--dining" data-id='${outing.id}'>
                    <h2 class="outing__title">${outing.description}</h2>
                    <div class="outing__details">
                        <span class="outing__span--icon">⭐</span>
                        <span class="outing__span outing__rating">${outing.rating || 'unrated'}</span>
                        <span class="outing__span--icon">🍽️</span>
                        <span class="outing__span outing__restaurant">${outing.restaurantName || 'unknown'}</span>
                        <span class="outing__span--icon">🍔</span>
                        <span class="outing__span outing__cuisine">${outing.cuisine || 'unknown'}</span>
                        <span class="outing__span--icon">💵</span>
                        <span class="outing__span outing__cost">${outing.costPerPerson === 'NaN' ? 'free!' : '$' + outing.costPerPerson + ' cost per/person'}</span>
                    </div>
                    <div class="trash">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
                        <path fill="#fff" d="M2 5v10c0 0.55 0.45 1 1 1h9c0.55 0 1-0.45 1-1v-10h-11zM5 14h-1v-7h1v7zM7 14h-1v-7h1v7zM9 14h-1v-7h1v7zM11 14h-1v-7h1v7z"></path>
                        <path fill="#fff" d="M13.25 2h-3.25v-1.25c0-0.412-0.338-0.75-0.75-0.75h-3.5c-0.412 0-0.75 0.338-0.75 0.75v1.25h-3.25c-0.413 0-0.75 0.337-0.75 0.75v1.25h13v-1.25c0-0.413-0.338-0.75-0.75-0.75zM9 2h-3v-0.987h3v0.987z"></path>
                        </svg>
                    </div>
                </li>
                `
        }

        if (outing.type === 'music') {
            html =
                `
                    <li class="list__item outing--music" data-id='${outing.id}'>
                        <h2 class="outing__title">${outing.description}</h2>
                        <div class="outing__details">
                            <span>
                                <span class="outing__span--icon">⭐</span>
                                <span class="outing__span outing__rating">${outing.rating || 'unrated'}</span>
                            </span>
                            <span>
                                <span class="outing__span--icon">🎺</span>
                                <span class="outing__span outing__venue-name">${outing.venue || 'unknown'}</span>
                            </span>
                            <span>    
                                <span class="outing__span--icon">🎙️</span>
                                <span class="outing__span outing__band-name">${outing.band || 'unknown'}</span>
                            </span>
                            <span>    
                                <span class="outing__span--icon">🍺</span>
                                <span class="outing__span outing__drinks">${outing.drinksPerHour === 'NaN' ? '0' : outing.drinksPerHour + ' drinks per/hour'}</span>
                            </span>
                        </div>
                        <div class="trash">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
                                <path fill="#fff" d="M2 5v10c0 0.55 0.45 1 1 1h9c0.55 0 1-0.45 1-1v-10h-11zM5 14h-1v-7h1v7zM7 14h-1v-7h1v7zM9 14h-1v-7h1v7zM11 14h-1v-7h1v7z"></path>
                                <path fill="#fff" d="M13.25 2h-3.25v-1.25c0-0.412-0.338-0.75-0.75-0.75h-3.5c-0.412 0-0.75 0.338-0.75 0.75v1.25h-3.25c-0.413 0-0.75 0.337-0.75 0.75v1.25h13v-1.25c0-0.413-0.338-0.75-0.75-0.75zM9 2h-3v-0.987h3v0.987z"></path>
                            </svg>
                        </div>
                    </li>
                `
        }

        list.insertAdjacentHTML('beforeend', html)
    }

    // Create the marker for the outing using Leaflet
    _renderMarker(outing) {
        const marker = L.marker(outing.coords).addTo(this.#map);

        marker.bindPopup(`${outing.type === 'dining' ? '🍔' : '🎺'} ${outing.description}`, {
            className: `${outing.type}`,
            autoClose: false
        }).openPopup();

        // Add the marker to the #markers array (so it may be deleted, if needed)
        this.#markers.push(marker);
    }

    // Move the map to the location of the marker for a clicked outing
    _moveToPopup(e) {
        const trash = e.target.closest('.trash');
        const item = e.target.closest('.list__item');
        if (!item) return;

        if (trash) {
            this._deleteOuting(item);
            return
        }
        // Find the clicked outing in the #outings array
        const curOuting = this.#outings.find(outing => outing.id === item.dataset.id)
        this.#map.flyTo(curOuting.coords, 18)
    }

    // Set local storage from the #outings array
    _setLocalStorage() {
        localStorage.setItem('outings', JSON.stringify(this.#outings));
    }

    // Retrieve local storage from the user's browser
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('outings'));
        if (!data) return;
        this.#outings = data;
    }

    // Delete an outing
    _deleteOuting(item) {
        // Find the correct outing and marker in their respective arrays
        const index = this.#outings.findIndex(outing => outing.id === item.dataset.id);
        const markerIndex = this.#markers.findIndex(marker => marker._latlng.lat === this.#outings[index].coords[0] && marker._latlng.lng === this.#outings[index].coords[1])
        // Remove the marker
        this.#map.removeLayer(this.#markers[markerIndex])
        // Remove the html element from the DOM
        item.remove();
        // Remove the outing from the #outings array
        this.#outings.splice(index, 1);
        // Reset the local storage
        this._setLocalStorage();
        return
    }

    // Add two outings as examples for the user
    _firstOutings() {
        const music = new Music(9, [29.964574163507624, -90.05809128284454], 'Royal Frenchmen', 'Trumpet Mafia', 95, 3);
        const dining = new Dining(10, [29.96222020236467, -90.06082981824876], 'Bennachin', 'West African', '82', 2);
        this.#outings.push(music);
        this.#outings.push(dining);
    }
}

const app = new App();
