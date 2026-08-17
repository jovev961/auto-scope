"use client";

import { sendContactForm } from "@/lib/contact";
import { useState } from "react";
import styles from "./ContactForm.module.css";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function formatSubmittedAt(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [timeStamp, setTimeStamp] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
    setMessage("");
    setTimeStamp("");
    setSubmitError("");
  }

  async function submitForm(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");
    setTimeStamp("");
    setSubmitError("");

    try {
      const response = await sendContactForm(form);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to send your message.");
      }

      setMessage(response.message || "Thank you for contacting Auto Scope.");
      setTimeStamp(response.submittedAt || "");
      setForm(initialForm);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const formattedTimeStamp = formatSubmittedAt(timeStamp);

  return (
    <section className={styles.card} aria-labelledby="contact-form-heading">
      <div className={styles.heading}>
        <p>Send a message</p>
        <h2 id="contact-form-heading">Tell us how we can help.</h2>
        <span id="contact-form-description">
          Complete the fields below and we will acknowledge your message right away.
        </span>
      </div>

      <form
        className={styles.form}
        onSubmit={submitForm}
        aria-describedby="contact-form-description"
      >
        <div className={styles.fieldGrid}>
          <label className={styles.field} htmlFor="contact-name">
            <span>Name</span>
            <input
              id="contact-name"
              type="text"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              maxLength={100}
              required
              disabled={isSubmitting}
            />
          </label>

          <label className={styles.field} htmlFor="contact-email">
            <span>Email</span>
            <input
              id="contact-email"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              maxLength={254}
              required
              disabled={isSubmitting}
            />
          </label>
        </div>

        <label className={styles.field} htmlFor="contact-subject">
          <span className={styles.labelRow}>
            Subject <small>Optional</small>
          </span>
          <input
            id="contact-subject"
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="What would you like to discuss?"
            maxLength={150}
            disabled={isSubmitting}
          />
        </label>

        <label className={styles.field} htmlFor="contact-message">
          <span>Message</span>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Share your question, correction, or feedback."
            maxLength={5000}
            rows={7}
            required
            disabled={isSubmitting}
          />
        </label>

        <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "Sending…" : "Send message"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className={styles.feedback} aria-live="polite">
        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}
        {message && (
          <div className={styles.success} role="status">
            <strong>{message}</strong>
            {formattedTimeStamp && <span>Received {formattedTimeStamp}</span>}
          </div>
        )}
      </div>
    </section>
  );
}
