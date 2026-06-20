// src/scripts/pages/home/home-page.js
import * as api from '../../data/api'; // Import all functions from api.js
import { showFormattedDate } from '../../utils';
import HomePresenter from './home-presenter';
import L from 'leaflet';

class HomePage {
  #presenter;
  #map = null;
  #markersLayer = null;
  #storyMarkers = new Map();
  #activeStoryId = null;
  #defaultCoordinates = [-2.548926, 118.0148634];

  async render() {
    return `
      <section class="container">
        <h1>All Stories</h1>
        <h2>Story Location Map</h2>
        <p>Click a marker to see uploader information and location details.</p>
        <div id="map-home" class="map-container" role="img" aria-label="Digital map showing story locations"></div>
        <div id="stories-list" class="stories-grid">
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#initializeMap();

    this.#presenter = new HomePresenter({
      view: this,
      model: api, // Pass the entire api module as the model
    });
  }

  #initializeMap() {
    if (this.#map) {
      this.#map.remove();
    }

    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    });

    const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    });

    const baseMaps = {
      Streets: openStreetMap,
      Topographic: openTopoMap,
      Light: cartoLight,
    };

    this.#map = L.map('map-home', {
      layers: [openStreetMap],
    }).setView(this.#defaultCoordinates, 5);

    L.control.layers(baseMaps).addTo(this.#map);

    this.#markersLayer = L.layerGroup().addTo(this.#map);
    this.#storyMarkers.clear();
    this.#activeStoryId = null;

    window.requestAnimationFrame(() => {
      if (this.#map) {
        this.#map.invalidateSize();
      }
    });
  }

  #renderStoryMarkers(stories) {
    if (!this.#map || !this.#markersLayer) {
      return;
    }

    this.#markersLayer.clearLayers();
    this.#storyMarkers.clear();
    this.#activeStoryId = null;

    const validStories = stories.filter((story) => {
      const lat = Number(story.lat);
      const lon = Number(story.lon);
      return Number.isFinite(lat) && Number.isFinite(lon);
    });

    if (validStories.length === 0) {
      const fallbackMarker = L.marker(this.#defaultCoordinates).addTo(this.#markersLayer);
      fallbackMarker.bindPopup('Digital map is active. No story location data is available yet.');
      return;
    }

    const markerCoordinates = [];
    validStories.forEach((story) => {
      const lat = Number(story.lat);
      const lon = Number(story.lon);
      markerCoordinates.push([lat, lon]);

      const marker = L.marker([lat, lon]).addTo(this.#markersLayer);
      this.#storyMarkers.set(story.id, marker);

      marker.bindPopup(`
        <strong>${story.name}</strong><br>
        ${story.description.substring(0, 100)}...<br>
        Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}<br>
        <a href="#/stories/${story.id}">See detail</a>
      `);

      marker.on('click', () => {
        this.#setActiveStory(story.id);
        marker.openPopup();
      });
    });

    this.#map.fitBounds(markerCoordinates, { padding: [30, 30] });
  }

  #setActiveStory(storyId) {
    this.#activeStoryId = storyId;

    document.querySelectorAll('.story-item').forEach((storyItemElement) => {
      const isActive = storyItemElement.dataset.storyId === String(storyId);
      storyItemElement.classList.toggle('story-item-active', isActive);
    });
  }

  #bindListMapInteraction() {
    document.querySelectorAll('.story-item').forEach((storyItemElement) => {
      storyItemElement.addEventListener('click', () => {
        const { storyId } = storyItemElement.dataset;
        const marker = this.#storyMarkers.get(storyId);

        this.#setActiveStory(storyId);

        if (marker && this.#map) {
          const position = marker.getLatLng();
          this.#map.flyTo(position, 13, { duration: 0.8 });
          marker.openPopup();
        }
      });
    });
  }

  showStories(stories) {
    const storiesListElement = document.querySelector('#stories-list');
    this.#renderStoryMarkers(stories);
    
    if (stories.length === 0) {
      storiesListElement.innerHTML = '<p>No stories available.</p>';
      return;
    }

    storiesListElement.innerHTML = stories.map(story => `
      <article class="story-item" data-story-id="${story.id}" tabindex="0" role="button" aria-label="Focus map marker for ${story.name}">
        <img class="story-photo" src="${story.photoUrl}" alt="Photo by ${story.name}: ${story.description}">
        <div class="story-info">
          <h2 class="story-name">${story.name}</h2>
          <p class="story-meta">
            <i class="fa-solid fa-calendar-alt fa-fw"></i> ${showFormattedDate(story.createdAt)}
          </p>
          <p class="story-meta">
            <i class="fa-solid fa-map-marker-alt fa-fw"></i>
            ${Number.isFinite(Number(story.lat)) && Number.isFinite(Number(story.lon))
              ? `Lat ${Number(story.lat).toFixed(4)}, Lon ${Number(story.lon).toFixed(4)}`
              : 'Location not available'}
          </p>
          <p class="story-description">${story.description.substring(0, 150)}...</p>
          <a href="#/stories/${story.id}" class="story-detail-link">
            Read More <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `).join('');

    this.#bindListMapInteraction();
  }

  showError(message) {
    const storiesListElement = document.querySelector('#stories-list');
    this.#renderStoryMarkers([]);
    storiesListElement.innerHTML = `<p>Failed to load stories: ${message}. You can still see the digital map above.</p>`;
  }
}

export default HomePage;