window["loggedinUsers"] = {};
window["loggedinUsersIds"] = [];

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

const updateLoggedinUsers = () => {
  console.log(window["loggedinUsers"][window["loggedinUsersIds"][0]]);
};

const requestLoginButton = async () => {
  await requestLogin(
    document.getElementById("signInUsername").value,
    document.getElementById("signInPassword").value
  );
};

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
    window["loggedinUsers"][json.data.id] = json.data;
    window["loggedinUsersIds"].push(json.data.id);
    updateLoggedinUsers();
    goToLobby();
    renderPlayerPanels();
  } catch (error) {
    console.error(error.message);
  }
};

const logoutPlayer = async (index) => {
  const userId = window["loggedinUsersIds"][index];
  try {
    const response = await fetch(`/api/auth/logout/${userId}/`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to log out");
    }

    window["loggedinUsersIds"].splice(index, 1);
    renderPlayerPanels();
  } catch (error) {
    console.error(error.message);
  }
};
