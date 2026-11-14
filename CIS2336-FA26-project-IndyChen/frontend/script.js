// UH Sugar Land Student Center - front-end script
// Handles: dynamic nav menu, FAQ accordion, room booking form validation.

(function () {
  "use strict";

  /* ---------- Dynamic navigation menu ---------- */
  var NAV_ITEMS = [
    { label: "Home", href: "index.html" },
    { label: "FAQ", href: "FAQ.html" },
    { label: "Room Booking", href: "roombooking.html" },
    { label: "Reference", href: "reference.html" }
  ];

  function buildNav() {
    var menu = document.getElementById("nav-menu");
    var toggle = document.getElementById("nav-toggle");
    if (!menu) return;

    var current = document.body.getAttribute("data-page");
    NAV_ITEMS.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.textContent = item.label;
      a.href = item.href;
      if (item.href === current) {
        a.className = "active";
        a.setAttribute("aria-current", "page");
      }
      li.appendChild(a);
      menu.appendChild(li);
    });

    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    var buttons = document.querySelectorAll(".acc-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
      });
    });
  }

  /* ---------- Room booking form ---------- */
  var OPEN_MIN = 8 * 60;    // 8:00 AM
  var CLOSE_MIN = 22 * 60;  // 10:00 PM
  var MIN_LEN = 30;         // minutes
  var MAX_LEN = 180;        // minutes

  function toMinutes(t) {
    var p = t.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function todayString() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function setError(id, message) {
    var field = document.getElementById(id).closest(".field");
    document.getElementById(id + "-error").textContent = message || "";
    field.classList.toggle("invalid", Boolean(message));
    document.getElementById(id).setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  // Each validator returns true when valid, and shows an error when not.
  var validators = {
    name: function (f) {
      var v = f.name.value.trim();
      if (!v) return setError("name", "Please enter your name.");
      if (v.length < 2) return setError("name", "Name must be at least 2 characters.");
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return setError("name", "Use letters, spaces, apostrophes, or hyphens only.");
      return setError("name");
    },
    email: function (f) {
      var v = f.email.value.trim();
      if (!v) return setError("email", "Please enter your UH email.");
      if (!/^[^\s@]+@(cougarnet\.uh\.edu|uh\.edu)$/i.test(v)) {
        return setError("email", "Use your UH email (ending in @cougarnet.uh.edu or @uh.edu).");
      }
      return setError("email");
    },
    room: function (f) {
      if (!f.room.value) return setError("room", "Please choose a room.");
      return setError("room");
    },
    date: function (f) {
      var v = f.date.value;
      if (!v) return setError("date", "Please choose a date.");
      if (v < todayString()) return setError("date", "The date cannot be in the past.");
      return setError("date");
    },
    start: function (f) {
      if (!f.start.value) return setError("start", "Please choose a start time.");
      var s = toMinutes(f.start.value);
      if (s < OPEN_MIN || s >= CLOSE_MIN) return setError("start", "Start time must be between 8:00 AM and 10:00 PM.");
      // Same-day bookings cannot start in the past.
      if (f.date.value === todayString()) {
        var now = new Date();
        if (s < now.getHours() * 60 + now.getMinutes()) return setError("start", "That time has already passed today.");
      }
      return setError("start");
    },
    end: function (f) {
      if (!f.end.value) return setError("end", "Please choose an end time.");
      var e = toMinutes(f.end.value);
      if (e > CLOSE_MIN) return setError("end", "Rooms close at 10:00 PM.");
      if (f.start.value) {
        var len = e - toMinutes(f.start.value);
        if (len <= 0) return setError("end", "End time must be after the start time.");
        if (len < MIN_LEN) return setError("end", "Minimum booking is 30 minutes.");
        if (len > MAX_LEN) return setError("end", "Maximum booking is 3 hours.");
      }
      return setError("end");
    },
    guests: function (f) {
      var raw = f.guests.value.trim();
      if (!raw) return setError("guests", "Please enter the number of people.");
      var n = Number(raw);
      if (!Number.isInteger(n) || n < 1) return setError("guests", "Enter a whole number of at least 1.");
      var opt = f.room.options[f.room.selectedIndex];
      var cap = opt && opt.dataset.cap ? parseInt(opt.dataset.cap, 10) : null;
      if (cap && n > cap) return setError("guests", opt.text.split(" (")[0] + " holds up to " + cap + " people.");
      return setError("guests");
    },
    purpose: function (f) {
      if (f.purpose.value.length > 200) return setError("purpose", "Keep it under 200 characters.");
      return setError("purpose");
    }
  };

  function showStatus(kind, message) {
    var box = document.getElementById("form-status");
    box.className = "form-status show " + kind;
    box.textContent = message;
  }

  function initBooking() {
    var form = document.getElementById("booking-form");
    if (!form) return;

    form.date.min = todayString();

    // Validate each field when the user leaves it, and re-check once invalid.
    Object.keys(validators).forEach(function (key) {
      var el = form[key];
      el.addEventListener("blur", function () { validators[key](form); });
      el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("invalid")) validators[key](form);
      });
    });

    // Changing room/date/start affects other fields' rules.
    form.room.addEventListener("change", function () { if (form.guests.value) validators.guests(form); });
    form.start.addEventListener("change", function () { if (form.end.value) validators.end(form); });
    form.date.addEventListener("change", function () { if (form.start.value) validators.start(form); });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      document.getElementById("form-status").className = "form-status";

      var allValid = true;
      var firstBad = null;
      Object.keys(validators).forEach(function (key) {
        if (!validators[key](form)) {
          allValid = false;
          if (!firstBad) firstBad = form[key];
        }
      });
      if (!allValid) {
        firstBad.focus();
        showStatus("fail", "Please fix the highlighted fields and try again.");
        return;
      }

      var booking = {
        name: form.name.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        room: form.room.value,
        date: form.date.value,
        start: form.start.value,
        end: form.end.value,
        guests: Number(form.guests.value),
        purpose: form.purpose.value.trim()
      };

      // The back-end (Node/Express) checks availability and replies with
      // { success: boolean, message: string }.
      fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (r) {
          var msg = r.data.message || (r.ok ? "Your room is booked." : "That room is not available.");
          showStatus(r.ok && r.data.success !== false ? "success" : "fail", msg);
          if (r.ok && r.data.success !== false) form.reset();
        })
        .catch(function () {
          showStatus("fail", "We couldn't reach the booking server. Please try again in a moment.");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildNav();
    initFaq();
    initBooking();
  });
})();
