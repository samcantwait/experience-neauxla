class Outing {
    date = new Date();
    random = Math.random() + '';
    id = ((Date.now() + '').slice(-10) + this.random);

    constructor(rating, coords) {
        this.rating = rating;
        this.coords = coords;
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

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

    calcDrinksPerHour() {
        this.drinksPerHour = (this.drinks / (this.duration / 60)).toFixed(1);
        return this.drinksPerHour;
    }
}

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

    calcCostPerPerson() {
        this.costPerPerson = (this.cost / this.people).toFixed(2);
        return this.costPerPerson;
    }
}


///// SELECT ALL THE DOM ELEMENTS NEEDED FOR THE FORM ETC.
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


class App {
    #map;
    #mapEvent;
    #mapZoom = 16;
    #latitude = 29.959026;
    #longitude = -90.065218;
    #outings = [];

    constructor() {
        this._firstOutings();
        this._getLocalStorage();
        this._displayMap();
        //Get local storage;
        //set event listeners...
        form.addEventListener('submit', this._newOuting.bind(this));
        form.addEventListener('click', this._openForm);
        getType.addEventListener('change', this._selectType);
        list.addEventListener('click', this._moveToPopup.bind(this));
    }

    _displayMap() {
        this.#map = L.map('map').setView([this.#latitude, this.#longitude], this.#mapZoom);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map);

        this.#map.on('click', this._displayForm.bind(this));
        this.#outings.forEach(outing => {
            this._renderOuting(outing);
            this._renderMarker(outing);
        })
    }

    _openForm() {
        const type = document.querySelector('.form__input--type').value;
        document.querySelector(`.form__lower--${type}`).style.display = 'inline-block';
    }

    _displayForm(mapEvent) {
        form.classList.remove('hidden');
        this.#mapEvent = mapEvent;
    }

    _hideForm() {
        rating.value = restaurant.value = cuisine.value = cost.value = people.value = venue.value = band.value = duration.value = drinks.value = '';
        form.classList.add('hidden');
    }

    _selectType() {
        lowerForms.forEach(form => {
            form.style.display = 'none';
        })
        const type = document.querySelector('.form__input--type').value;
        document.querySelector(`.form__lower--${type}`).style.display = 'inline-block'
    }

    _newOuting(e) {
        e.preventDefault();
        const { lat, lng } = this.#mapEvent.latlng;
        const outingType = document.querySelector('.form__input--type').value;

        let outing;

        if (outingType === 'dining') {
            outing = new Dining(rating.value, [lat, lng], restaurant.value, cuisine.value, cost.value, people.value);
        }

        if (outingType === 'music') {
            outing = new Music(rating.value, [lat, lng], venue.value, band.value, +duration.value, +drinks.value);
        }

        this.#outings.push(outing);

        this._renderOuting(outing);

        this._hideForm();

        this._renderMarker(outing);

        this._setLocalStorage();
    }

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
                    </li>
                `
        }

        list.insertAdjacentHTML('beforeend', html)
    }

    _renderMarker(outing) {
        const marker = L.marker(outing.coords).addTo(this.#map);

        marker.bindPopup(`${outing.type === 'dining' ? '🍔' : '🎺'} ${outing.description}`, {
            className: `${outing.type}`,
            autoClose: false
        }).openPopup();
    }

    _moveToPopup(e) {
        const item = e.target.closest('.list__item');
        if (!item) return;
        const curOuting = this.#outings.find(outing => outing.id === item.dataset.id)
        this.#map.flyTo(curOuting.coords, 18)
    }

    _setLocalStorage() {
        localStorage.setItem('outings', JSON.stringify(this.#outings));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('outings'));

        if (!data) return;

        this.#outings = data;
        console.log(this.#outings)
    }

    _firstOutings() {
        const music = new Music(9, [29.964574163507624, -90.05809128284454], 'Royal Frenchmen', 'Trumpet Mafia', 95, 3);
        const dining = new Dining(10, [29.96222020236467, -90.06082981824876], 'Bennachin', 'West African', '82', 2);
        this.#outings.push(music);
        this.#outings.push(dining);
    }
}

const app = new App();
