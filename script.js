const WHATSAPP_COUNTRY_CODE = "32";
const WHATSAPP_NUMBER = "400012234";
const WHATSAPP_MESSAGE = "Hallo D Reynders Projects, ik heb een vraag over een plat dak.";

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupMobileNavigation();
  setupDynamicYear();
  setupNetlifyForm();
  setupImageFallbacks();
  setupActiveNavigation();
});

function setupWhatsAppLinks() {
  const links = document.querySelectorAll(".js-whatsapp");
  const cleanCountryCode = WHATSAPP_COUNTRY_CODE.replace(/\D/g, "");
  const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, "");
  const message = encodeURIComponent(WHATSAPP_MESSAGE);
  const url = `https://wa.me/${cleanCountryCode}${cleanNumber}?text=${message}`;

  links.forEach((link) => {
    link.setAttribute("href", url);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
  });
}

function setupMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.classList.toggle("is-open", !isOpen);
    nav.classList.toggle("is-open", !isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (!event.target.matches("a")) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.classList.remove("is-open");
    nav.classList.remove("is-open");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.classList.remove("is-open");
    nav.classList.remove("is-open");
  });
}

function setupDynamicYear() {
  const yearElements = document.querySelectorAll(".js-year");
  const currentYear = new Date().getFullYear();
  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });
}

function setupNetlifyForm() {
  const form = document.querySelector('form[name="contact"]');
  if (!form) return;

  const messageBox = form.querySelector(".form-message");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      showFormMessage(messageBox, "error", "Vul de verplichte velden aan en probeer opnieuw.");
      return;
    }

    const formData = new FormData(form);
    const encodedData = new URLSearchParams();
    formData.forEach((value, key) => encodedData.append(key, value));

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Bezig met verzenden...";
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodedData.toString()
      });
      if (!response.ok) throw new Error("Form submission failed");
      form.reset();
      showFormMessage(messageBox, "success", "Bedankt voor uw bericht. We nemen contact met u op om uw vraag te bespreken.");
    } catch (error) {
      showFormMessage(messageBox, "error", "Er ging iets mis bij het verzenden. Probeer opnieuw of neem telefonisch contact op.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Verstuur uw vraag";
      }
    }
  });
}

function showFormMessage(element, type, text) {
  if (!element) return;
  element.textContent = text;
  element.classList.remove("is-success", "is-error");
  element.classList.add(type === "success" ? "is-success" : "is-error");
}

function setupImageFallbacks() {
  const images = document.querySelectorAll("img");
  images.forEach((image) => {
    image.addEventListener("error", () => {
      const figure = image.closest("figure");
      if (figure) figure.classList.add("image-missing");
      image.setAttribute("alt", "Beeld volgt");
    });
  });
}

function setupActiveNavigation() {
  const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  const sections = Array.from(navLinks)
    .map((link) => {
      const id = link.getAttribute("href");
      const section = id ? document.querySelector(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = sections.find((item) => item.section === entry.target);
      navLinks.forEach((link) => link.classList.remove("is-active"));
      if (active) active.link.classList.add("is-active");
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

  sections.forEach((item) => observer.observe(item.section));
}
