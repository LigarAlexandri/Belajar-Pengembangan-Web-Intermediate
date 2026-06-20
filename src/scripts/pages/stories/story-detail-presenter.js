// src/scripts/pages/stories/story-detail-presenter.js
class StoryDetailPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getStoryDetail(id) {
    if (!id) {
      this.#view.renderError('Story ID not found in URL.');
      return;
    }

    try {
      const story = await this.#model.getStoryDetail(id);
      this.#view.renderStoryDetail(story);
    } catch (error) {
      this.#view.renderError(`Failed to fetch story: ${error.message}`);
    }
  }
}

export default StoryDetailPresenter;