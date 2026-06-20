// src/scripts/pages/stories/story-detail-page.js
import * as api from '../../data/api';
import { parseActivePathname } from '../../routes/url-parser';
import { showFormattedDate } from '../../utils';
import StoryDetailPresenter from './story-detail-presenter';
import L from 'leaflet';

class StoryDetailPage {
  #map = null;
  #presenter;

  constructor() {}

  async render() {
    return `
      <section class="container">
        <h1 id="story-title"></h1>
        <p class="story-owner" id="story-owner"></p>
        <p class="story-date" id="story-date"></p>
        <img id="story-photo" src="" alt="Story Photo" style="max-width: 100%; height: auto; margin-top: 20px; border-radius: 8px;">
        <p id="story-description" style="margin-top: 20px;"></p>
        <p id="story-location" style="margin-top: 10px; font-style: italic;"></p>
        <div id="map-story-detail" class="map-container" style="display: none;"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter({
      view: this,
      model: api,
    });

    const { id } = parseActivePathname();
    this.#presenter.getStoryDetail(id);
  }

  renderStoryDetail(story) {
    if (!story) {
      this.renderError('Story data not available.');
      return;
    }

    const latitude = Number(story.lat);
    const longitude = Number(story.lon);

    document.querySelector('#story-title').textContent = story.name;
    document.querySelector('#story-owner').innerHTML = `<i class="fa-solid fa-user fa-fw"></i> Posted by: <strong>${story.name}</strong>`;
    document.querySelector('#story-date').innerHTML = `<i class="fa-solid fa-calendar-alt fa-fw"></i> On: ${showFormattedDate(story.createdAt)}`;
    document.querySelector('#story-photo').src = story.photoUrl;
    document.querySelector('#story-photo').alt = `Photo for story: ${story.description}`;
    document.querySelector('#story-description').textContent = story.description;

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      document.querySelector('#story-location').innerHTML = `<i class="fa-solid fa-map-marker-alt fa-fw"></i> Location: Lat ${latitude}, Lon ${longitude}`;
      document.querySelector('#map-story-detail').style.display = 'block';
      this.#initializeMapForDetail({
        ...story,
        lat: latitude,
        lon: longitude,
      });
    } else {
      document.querySelector('#story-location').innerHTML = `<i class="fa-solid fa-location-slash fa-fw"></i> Location: Not provided`;
      document.querySelector('#map-story-detail').style.display = 'none';
    }
  }

  renderError(message) {
    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <section class="container">
          <h2>Error Loading Story</h2>
          <p>${message}</p>
          <a href="#/">Go back to Home</a>
        </section>
      `;
    }
  }

  #initializeMapForDetail(story) {
    if (!story || !story.lat || !story.lon) {
      return;
    }

    const { lat, lon } = story;
    const coordinates = L.latLng(lat, lon);

    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    const cartoDBDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    const baseMaps = {
        "Streets": openStreetMap,
        "Topographic": openTopoMap,
        "Dark Mode": cartoDBDark
    };

    this.#map = L.map('map-story-detail', {
        layers: [openStreetMap]
    }).setView(coordinates, 13);

    L.control.layers(baseMaps).addTo(this.#map);

    const marker = L.marker(coordinates).addTo(this.#map);
    
    marker.bindPopup(`Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`).openPopup();

    // Use a short timeout to ensure the map container is fully visible before invalidating size
    setTimeout(() => {
        if (this.#map) {
            this.#map.invalidateSize();
        }
    }, 100);
  }
}

export default StoryDetailPage;
