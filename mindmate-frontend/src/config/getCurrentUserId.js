function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload._id;
  } catch (err) {
    console.error('Failed to parse token:', err);
    return null;
  }
}

export default getCurrentUserId;