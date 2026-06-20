// src/scripts/pages/stories/add-story-presenter.js
class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async addStory(storyData, asGuest) {
    try {
      if (asGuest) {
        await this.#model.addNewStoryGuest(storyData);
      } else {
        await this.#model.addNewStory(storyData);
      }
      this.#view.onAddStorySuccess(asGuest);
    } catch (error) {
      this.#view.onAddStoryFailure(error.message);
    }
  }
}

export default AddStoryPresenter;