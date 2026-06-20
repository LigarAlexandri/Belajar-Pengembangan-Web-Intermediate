import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  NOTIFICATIONS_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

async function _fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
    },
  });

  const responseData = await response.json();

  if (responseData.error) {
    throw new Error(responseData.message);
  }

  return responseData.data || responseData;
}

export async function register({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseData = await response.json();

    if (responseData.error) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
}

export async function login({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();

    if (responseData.error) {
      throw new Error(responseData.message);
    }

    localStorage.setItem('token', responseData.loginResult.token);
    localStorage.setItem('userId', responseData.loginResult.userId);
    localStorage.setItem('userName', responseData.loginResult.name);

    return responseData.loginResult;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

export async function addNewStory({ description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined) formData.append('lat', lat);
    if (lon !== undefined) formData.append('lon', lon);

    const response = await _fetchWithAuth(ENDPOINTS.STORIES, {
      method: 'POST',
      body: formData,
    });

    return response;
  } catch (error) {
    console.error('Add new story failed:', error.message);
    throw error;
  }
}

export async function addNewStoryGuest({ description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined) formData.append('lat', lat);
    if (lon !== undefined) formData.append('lon', lon);

    const response = await fetch(ENDPOINTS.STORIES_GUEST, {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();

    if (responseData.error) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (error) {
    console.error('Add new story as guest failed:', error.message);
    throw error;
  }
}

export async function getAllStories({ page, size, location }) {
  try {
    let url = new URL(ENDPOINTS.STORIES);
    if (page) url.searchParams.append('page', page);
    if (size) url.searchParams.append('size', size);
    if (location !== undefined) url.searchParams.append('location', location);

    const response = await _fetchWithAuth(url.toString(), {
      method: 'GET',
    });

    return response.listStory;
  } catch (error) {
    console.error('Get all stories failed:', error.message);
    throw error;
  }
}

export async function getStoryDetail(id) {
  try {
    const url = `${ENDPOINTS.STORIES}/${id}`;
    const response = await _fetchWithAuth(url, {
      method: 'GET',
    });

    return response.story;
  } catch (error) {
    console.error('Get story detail failed:', error.message);
    throw error;
  }
}

export async function subscribeNotification(subscription) {
  try {
    const response = await _fetchWithAuth(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    return response;
  } catch (error) {
    console.error('Subscribe notification failed:', error.message);
    throw error;
  }
}

export async function unsubscribeNotification(endpoint) {
  try {
    const response = await _fetchWithAuth(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });
    return response;
  } catch (error) {
    console.error('Unsubscribe notification failed:', error.message);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  // Optionally unsubscribe from notifications here if desired
}