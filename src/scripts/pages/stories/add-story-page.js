// src/scripts/pages/stories/add-story-page.js
import * as api from '../../data/api';
import AddStoryPresenter from './add-story-presenter';
import L from 'leaflet';

class AddStoryPage {
  #map = null;
  #marker = null;
  #video = null;
  #stream = null;
  #presenter;

  constructor() {}

  async render() {
    return `
      <section class="container">
        <h1>Add New Story</h1>
        <form id="add-story-form">
          <div class="form-group">
            <label for="description"><i class="fa-solid fa-comment-dots fa-fw"></i> Description:</label>
            <textarea id="description" name="description" required aria-label="Story description"></textarea>
          </div>
          <div class="form-group">
            <label for="photo"><i class="fa-solid fa-image fa-fw"></i> Photo:</label>
            <input type="file" id="photo" name="photo" accept="image/*" required aria-label="Upload photo from device">
            <button type="button" id="open-camera-button" aria-label="Take photo with camera"><i class="fa-solid fa-camera"></i> Take Photo</button>
            <video id="camera-feed" autoplay style="display: none; width: 100%; max-width: 400px; margin-top: 10px;" aria-label="Camera feed"></video>
            <button type="button" id="capture-photo-button" style="display: none; margin-top: 10px;" aria-label="Capture photo from camera"><i class="fa-solid fa-circle-dot"></i> Capture Photo</button>
            <canvas id="camera-canvas" style="display: none;"></canvas>
          </div>
          <div class="form-group">
            <label for="lat"><i class="fa-solid fa-map-pin fa-fw"></i> Latitude:</label>
            <input type="number" step="any" id="lat" name="lat" readonly aria-label="Latitude coordinate">
          </div>
          <div class="form-group">
            <label for="lon"><i class="fa-solid fa-map-pin fa-fw"></i> Longitude:</label>
            <input type="number" step="any" id="lon" name="lon" readonly aria-label="Longitude coordinate">
          </div>
          <div id="map-add-story" class="map-container" role="img" aria-label="Map for selecting location"></div>
          <button type="submit" id="add-story-button"><i class="fa-solid fa-paper-plane"></i> Add Story</button>
          <button type="button" id="add-story-guest-button"><i class="fa-solid fa-user-secret"></i> Add as Guest</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: api,
    });

    const addStoryForm = document.querySelector('#add-story-form');
    const addStoryGuestButton = document.querySelector('#add-story-guest-button');
    const latInput = document.querySelector('#lat');
    const lonInput = document.querySelector('#lon');
    const openCameraButton = document.querySelector('#open-camera-button');
    const capturePhotoButton = document.querySelector('#capture-photo-button');
    this.#video = document.querySelector('#camera-feed');

    this.#initializeMap(latInput, lonInput);

    openCameraButton.addEventListener('click', () => this.#openCamera());
    capturePhotoButton.addEventListener('click', () => this.#capturePhoto());

    addStoryForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleAddStory(false);
    });

    addStoryGuestButton.addEventListener('click', () => this.#handleAddStory(true));
  }

  #handleAddStory(asGuest) {
    const description = document.querySelector('#description').value;
    const photoInput = document.querySelector('#photo');
    const photo = photoInput.files[0];
    const lat = document.querySelector('#lat').value ? parseFloat(document.querySelector('#lat').value) : undefined;
    const lon = document.querySelector('#lon').value ? parseFloat(document.querySelector('#lon').value) : undefined;

    if (!description || !photo) {
      alert('Please fill in description and upload or take a photo.');
      return;
    }

    this.#presenter.addStory({ description, photo, lat, lon }, asGuest);
  }

  onAddStorySuccess(asGuest) {
    const message = asGuest ? 'Story added as guest successfully!' : 'Story added successfully!';
    alert(message);
    this.#stopCameraStream();
    window.location.hash = '#/';
  }

  onAddStoryFailure(message) {
    alert(`Failed to add story: ${message}`);
  }

  #initializeMap(latInput, lonInput) {
    const defaultLat = -8.1689; // Jember latitude
    const defaultLon = 113.7022; // Jember longitude

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

    this.#map = L.map('map-add-story', {
        layers: [openStreetMap]
    }).setView([defaultLat, defaultLon], 13);

    L.control.layers(baseMaps).addTo(this.#map);

    this.#marker = L.marker([defaultLat, defaultLon], {
      draggable: true,
      alt: 'Location marker'
    }).addTo(this.#map);

    latInput.value = defaultLat.toFixed(6);
    lonInput.value = defaultLon.toFixed(6);
    this.#marker.bindPopup(`You are here: Jember`).openPopup();

    this.#map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.#marker.setLatLng([lat, lng]);
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);
      this.#marker.bindPopup(`Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`).openPopup();
    });

    window.requestAnimationFrame(() => {
      if (this.#map) {
        this.#map.invalidateSize();
      }
    });

    this.#marker.on('move', (event) => {
      const position = event.target.getLatLng();
      latInput.value = position.lat.toFixed(6);
      lonInput.value = position.lng.toFixed(6);
      this.#marker.bindPopup(`Lat: ${position.lat.toFixed(6)}, Lon: ${position.lng.toFixed(6)}`).openPopup();
    });
  }

  async #openCamera() {
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.#video.srcObject = this.#stream;
      this.#video.style.display = 'block';
      document.querySelector('#capture-photo-button').style.display = 'inline-block';
      document.querySelector('#photo').style.display = 'none';
      document.querySelector('#open-camera-button').style.display = 'none';
    } catch (error) {
      alert('Could not access camera. Please ensure you have a camera and have granted permission.');
      console.error('Error accessing camera:', error);
    }
  }

  #capturePhoto() {
    const canvas = document.querySelector('#camera-canvas');
    canvas.width = this.#video.videoWidth;
    canvas.height = this.#video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(this.#video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const photoFile = new File([blob], `captured-photo-${Date.now()}.png`, { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(photoFile);
      document.querySelector('#photo').files = dataTransfer.files;

      this.#stopCameraStream();
    }, 'image/png');
  }

  #stopCameraStream() {
    if (this.#stream) {
      this.#stream.getTracks().forEach(track => track.stop());
      this.#stream = null;
      this.#video.srcObject = null;
      this.#video.style.display = 'none';
      document.querySelector('#capture-photo-button').style.display = 'none';
      document.querySelector('#photo').style.display = 'block';
      document.querySelector('#open-camera-button').style.display = 'inline-block';
    }
  }
}

export default AddStoryPage;
