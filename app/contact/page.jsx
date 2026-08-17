import ContactForm from "@/components/ContactForm";
import styles from "./contact.module.css";

export const metadata = {
  title: "Contact | Auto Scope",
  description: "Send Auto Scope a catalogue question, data correction, or general feedback.",
};

const contactTopics = [
  {
    title: "Catalogue questions",
    description: "Ask about navigating brands, model families, automobiles, or engine details.",
  },
  {
    title: "Data corrections",
    description: "Flag information that looks incomplete or inaccurate so the catalogue can improve.",
  },
  {
    title: "General feedback",
    description: "Share ideas about the browsing, discovery, and vehicle comparison experience.",
  },
];

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <section className={styles.layout} aria-labelledby="contact-heading">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Contact Auto Scope</p>
          <h1 id="contact-heading">Help us make the catalogue better.</h1>
          <p className={styles.lede}>
            Have a question about the catalogue, spotted a detail that needs attention,
            or want to share an idea? Send us a message and tell us what is on your mind.
          </p>

          <div className={styles.topics}>
            {contactTopics.map((topic) => (
              <article className={styles.topic} key={topic.title}>
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
              </article>
            ))}
          </div>
        </div>

        <ContactForm />
      </section>
    </div>
  );
}
