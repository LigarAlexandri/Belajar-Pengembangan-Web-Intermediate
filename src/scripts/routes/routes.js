// src/scripts/routes/routes.js
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import RegisterPage from '../pages/auth/register-page';
import LoginPage from '../pages/auth/login-page';
import AddStoryPage from '../pages/stories/add-story-page';
import StoryDetailPage from '../pages/stories/story-detail-page';

const routes = {
  // Use arrow functions to defer instantiation
  '/': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/register': () => new RegisterPage(),
  '/login': () => new LoginPage(),
  '/add-story': () => new AddStoryPage(),
  '/stories/:id': () => new StoryDetailPage(),
};

export default routes;