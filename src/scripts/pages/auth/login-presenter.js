// src/scripts/pages/auth/login-presenter.js
class LoginPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async login({ email, password }) {
    try {
      const loginResult = await this.#model.login({ email, password });
      this.#view.onLoginSuccess(loginResult);
    } catch (error) {
      this.#view.onLoginFailure(error.message);
    }
  }
}

export default LoginPresenter;
