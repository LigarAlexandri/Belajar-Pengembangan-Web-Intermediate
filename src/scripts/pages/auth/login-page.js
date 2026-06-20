// src/scripts/pages/auth/login-page.js
import * as api from '../../data/api';
import LoginPresenter from './login-presenter';

class LoginPage {
  #presenter;

  constructor() {
    // Constructor is kept empty.
  }

  async render() {
    return `
      <section class="container">
        <h1>Login to your Account</h1>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required aria-label="Email address">
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required aria-label="Password">
          </div>
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="#/register">Register here</a></p>
      </section>
    `;
  }

  async afterRender() {
    // Presenter is instantiated here.
    this.#presenter = new LoginPresenter({
      view: this,
      model: api,
    });

    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;
      this.#presenter.login({ email, password });
    });
  }

  onLoginSuccess(loginResult) {
    alert(`Welcome, ${loginResult.name}!`);
    window.location.hash = '#/';
  }

  onLoginFailure(message) {
    alert(`Login failed: ${message}`);
  }
}

export default LoginPage;
