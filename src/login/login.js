import { ACCESS_TOKEN, TOKEN_TYPE, EXPIRES_IN } from "../common";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const scopes =
  "user-top-read user-follow-read playlist-read-private user-library-read";

const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

// const ACCESS_TOKEN_KEY = "accessToken";

const APP_URL = import.meta.env.VITE_APP_URL;

const authorizeUser = () => {
  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes}&show_dialog=true`;
  console.log(url);
  window.open(url, "login", "width=800,height=600");
};

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-to-spotify");
  loginButton.addEventListener("click", authorizeUser);
});

window.setItemsInLocalStorage = ({ accessToken, tokenType, expiresIn }) => {
  localStorage.setItem("ACCESS_TOKEN", accessToken);
  localStorage.setItem("TOKEN_TYPE", tokenType);
  localStorage.setItem("EXPIRES_IN", expiresIn);
  window.location.href = APP_URL;
  console.log("stored in local storage");
};

window.addEventListener("load", () => {
  // const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  console.log(accessToken);
  if (accessToken) {
    window.location.href = `${APP_URL}/dashboard/dashboard.html`;
  }
  if (window.opener !== null && !window.opener.closed) {
    window.focus();
    if (window.location.href.includes("error")) {
      window.close();
    }

    console.log(window.location.hash);
    const { hash } = window.location;
    const searchParams = new URLSearchParams(hash);
    const accessToken = searchParams.get("#access_token");

    //#accessToken = '#access_token=BQBUnFm1hI1QF3gJNRPoCx30bJeJvIk2EhuSOKgJjdEzIJp_Csb--krXVfSPGx8aV_S8PhQyrLGHBf8fqT2TH2-GXhhyAjma4zGGPHP88hLVlORqx1R8Z-GfTt8v38eT6FyKPlDN_MSuCDiX3VJHodtyplA99_gPHIrsv0ywGN7BmHibO0Ywh4Ml4LFFr_C7zpcvZVmXtVJHwfnH2lkVJlX5wkkiEWmDvee8tA&token_type=Bearer&expires_in=3600'

    const tokenType = searchParams.get("token_type");
    const expiresIn = searchParams.get("expires_in");
    if (accessToken) {
      window.close();
      window.opener.setItemsInLocalStorage({
        accessToken,
        tokenType,
        expiresIn,
      });
    } else {
      window.close();
    }
  }
});
