export const fetchUserData = async (baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/api/session/getUser`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        return false;
      }
  
      const data = await response.json();
      return data.userData; // Повертаємо лише userData
    } catch (error) {
      console.error("Fetch user error:", error);
      return false; // У разі помилки повертаємо null
    }
  };
  