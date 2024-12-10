// --- Authorization part ---

// Getting the list of logged in users to display in the lobby
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/players/current/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to get logged in user");
    }
    const { data } = await response.json();
    window.state.loggedInUsers = data?.players;
    console.log("state: ", window.state.loggedInUsers);
    renderPlayerPanels();
  } catch (error) {
    console.error(error.message);
  }
});

// Signing up a new user
const requestSignUp = async () => {
  const username = document.getElementById("signUpUsername").value;
  const password = document.getElementById("signUpPassword").value;
  try {
    const response = await fetch("/api/players/", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        displayName: document.getElementById("displayName").value,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to sign up");
    }
    const json = await response.json().then(requestLogin(username, password));
  } catch (error) {
    console.error(error.message);
  }
};

// Printing the list of logged in users
const printLoggedinUsers = () => {
  console.log(window.state.loggedInUsers);
};

// Function that being called when the user clicks the "Sign In" button
const requestLoginButton = async () => {
  await requestLogin(
    document.getElementById("signInUsername").value,
    document.getElementById("signInPassword").value
  );
};

// Clearing the input fields for security reasons
const clearAuthInputs = () => {
  document.getElementById("signInUsername").value = "";
  document.getElementById("signInPassword").value = "";
  document.getElementById("displayName").value = "";
  document.getElementById("signUpUsername").value = "";
  document.getElementById("signUpPassword").value = "";
};

// Logging in a user
const requestLogin = async (_username, _password) => {
  try {
    const response = await fetch("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username: _username,
        password: _password,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to sign in");
    }

    const json = await response.json();
    window.state.loggedInUsers.push(json.data);
    clearAuthInputs();
    printLoggedinUsers();
    goToLobby();
    renderPlayerPanels();
  } catch (error) {
    console.error(error.message);
    clearAuthInputs();
  }
};

// Logging out a user
const logoutPlayer = async (index) => {
  const userId = window.state.loggedInUsers[index].id;
  try {
    const response = await fetch(`/api/auth/logout/${userId}/`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to log out");
    }

    window.state.loggedInUsers.splice(index, 1);
    renderPlayerPanels();
  } catch (error) {
    console.error(error.message);
  }
};
