// src/scripts/pages/auth/register-presenter.js
class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async register({ name, email, password }) {
    try {
      await this.#model.register({ name, email, password });
      this.#view.onRegisterSuccess();
    } catch (error) {
      this.#view.onRegisterFailure(error.message);
    }
  }
}

export default RegisterPresenter;
