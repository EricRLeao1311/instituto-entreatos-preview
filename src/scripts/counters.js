(function() {
  const animateNumber = (element, target, duration) => {
    let startTime;
    const initialNumber = 0;

    const easingFunction = t => 1 - Math.pow(1 - t, 4);

    const animate = time => {
      if (!startTime) startTime = time;
      const elapsedTime = time - startTime;
      const t = Math.min(elapsedTime / duration, 1);
      const newValue = initialNumber + (target - initialNumber) * easingFunction(t);

      element.textContent = Math.round(newValue);

      if (elapsedTime < duration) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(animate);
  };

  const onIntersection = entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const finalNumber = parseInt(el.textContent, 10);
        const animDuration = parseInt(el.getAttribute('duration'), 10) || 2000;

        animateNumber(el, finalNumber, animDuration);
        observer.unobserve(el);
      }
    });
  };

  const observer = new IntersectionObserver(onIntersection);

  document.querySelectorAll('[duration]').forEach(el => {
    observer.observe(el);
  });
})();
