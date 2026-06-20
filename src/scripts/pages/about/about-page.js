export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>About Dicoding Story App</h1>
        <p>This app is made by **ligaralexandri**.</p>
        <p>It is a Dicoding Story App that is the first submission of the Web Development Intermediate course by Dicoding.</p>
      </section>
    `
  }

  async afterRender() {
  }
}
