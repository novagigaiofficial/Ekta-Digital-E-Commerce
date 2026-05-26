export const formatPrice = (amount) =>
  "TZS " + Number(amount).toLocaleString("en-TZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const pointsToTZS = (points) => formatPrice(points * 5);
export const calcPointsEarned = (total) => Math.floor(total / 1000);

export const observeFadeUp = () => {
  const els = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver(
    (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); } }); },
    { threshold: 0.15 }
  );
  els.forEach((el) => observer.observe(el));
};
