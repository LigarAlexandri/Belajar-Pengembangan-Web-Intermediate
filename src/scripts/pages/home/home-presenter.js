// src/scripts/pages/home/home-presenter.js
class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;

    this.#getAllStories();
  }

  async #getAllStories() {
    try {
      const stories = await this.#model.getAllStories({});
      this.#view.showStories(stories);
    } catch (error) {
      this.#view.showError(error.message);
    }
  }
}

export default HomePresenter;