import { BASE_API, API_HOSTNAME, API_PORT, API_PROTOCOL } from "./properties";

const LOCAL_CONTACT_BASE_URL = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}${BASE_API}/contact`;

export async function sendContactForm(form = {}) {
  const { name, email, subject = "", message } = form;

  if (name == null || email == null || message == null) {
    throw new Error("Name, email, and message are required.");
  }

  const payload = { name, email, subject, message };

  let response;
  try {
    response = await fetch(LOCAL_CONTACT_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to reach the contact service. Please try again.");
  }

  let responseBody = null;
  try {
    responseBody = await response.json();
  } catch {
    // The status-based fallback below handles an empty or invalid response body.
  }

  if (!response.ok) {
    throw new Error(responseBody?.message || "Unable to send your message. Please try again.");
  }

  if (!responseBody) {
    throw new Error("The contact service returned an invalid response.");
  }

  return responseBody;
}
