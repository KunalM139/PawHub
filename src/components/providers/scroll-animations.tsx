"use client";

import { useEffect } from "react";

export function ScrollAnimations() {
  useEffect(() => {
    // Navbar Scroll Effect
    const mainNav = document.getElementById("main-nav");
    const mobileNav = document.getElementById("mobile-nav");

    const handleScroll = () => {
      if (window.scrollY > 20) {
        mainNav?.classList.add("scrolled");
        mobileNav?.classList.add("scrolled");
      } else {
        mainNav?.classList.remove("scrolled");
        mobileNav?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Init

    // Intersection Observer for Reveals
    const revealOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, revealOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });

    // Number Counter Animation
    const statsSection = document.getElementById("stats-section");
    let countersStarted = false;

    const animateValue = (
      obj: Element,
      start: number,
      end: number,
      duration: number
    ) => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          obj.innerHTML = end.toLocaleString();
        }
      };
      window.requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !countersStarted) {
          countersStarted = true;
          document.querySelectorAll(".stat-counter").forEach((counter) => {
            const target = parseInt(counter.getAttribute("data-target") || "0");
            animateValue(counter, 0, target, 2000);
          });
        }
      },
      { threshold: 0.5 }
    );

    if (statsSection) {
      statsObserver.observe(statsSection);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      revealObserver.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  return null;
}
