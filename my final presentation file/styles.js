// Entrepreneur Hub - JavaScript. Linked from index.html with: <script src="styles.js" defer></script>

    // ---------- Saving and loading data on the device ----------
    function defaultData() {
      return {
        streak: 0, bestStreak: 0, lastDone: "",
        onePct: [],              // list of "1% better" notes
        habits: [],              // list of { text, doneDate }
        goal: null,              // { text, target, current }
        challengeDate: "",       // the date the daily challenge was done
        priorities: [],          // list of { text, done }
        deadlines: [],           // list of { text, date }
        skillsDone: [],          // true/false for each business skill learned
        savingsTotal: 0,
        sales: []                // list of { item, amount }
      };
    }
    function reportStorageError(message, error) {
      console.error(message, error);
      var notice = document.getElementById("storageNotice");
      if (notice) {
        notice.textContent = message;
        notice.hidden = false;
      }
    }
    function load() {
      var saved;
      try {
        saved = localStorage.getItem("eh-data");
      } catch (error) {
        reportStorageError("Could not read saved progress. This session will start with fresh progress.", error);
        return defaultData();
      }
      if (!saved) return defaultData();
      try {
        var parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new TypeError("Saved progress must be an object.");
        }
        return parsed;
      } catch (error) {
        reportStorageError("Could not read saved progress. This session will start with fresh progress.", error);
        return defaultData();
      }
    }
    // save() writes the data back to the device.
    function save() {
      try {
        localStorage.setItem("eh-data", JSON.stringify(data));
      } catch (error) {
        reportStorageError("Could not save progress. Your changes may be lost when you close the page.", error);
      }
    }

    // Load the data once when the page opens.
    var data = load();
    var defaults = defaultData();
    Object.keys(defaults).forEach(function (key) {
      if (typeof data[key] === "undefined") data[key] = defaults[key];
    });
    data.streak = Number.isFinite(data.streak) && data.streak >= 0 ? Math.floor(data.streak) : 0;
    data.bestStreak = Number.isFinite(data.bestStreak) && data.bestStreak >= 0 ? Math.max(data.streak, Math.floor(data.bestStreak)) : data.streak;
    data.lastDone = typeof data.lastDone === "string" ? data.lastDone : "";
    data.challengeDate = typeof data.challengeDate === "string" ? data.challengeDate : "";
    data.savingsTotal = Number.isFinite(data.savingsTotal) && data.savingsTotal >= 0 ? Math.floor(data.savingsTotal) : 0;
    data.onePct = Array.isArray(data.onePct) ? data.onePct.filter(function (item) { return typeof item === "string"; }) : [];
    data.habits = Array.isArray(data.habits) ? data.habits.filter(function (habit) { return habit && typeof habit.text === "string"; }).map(function (habit) {
      return { text: habit.text, doneDate: typeof habit.doneDate === "string" ? habit.doneDate : "" };
    }) : [];
    data.priorities = Array.isArray(data.priorities) ? data.priorities.filter(function (priority) { return priority && typeof priority.text === "string"; }).slice(0, 3).map(function (priority) {
      return { text: priority.text, done: priority.done === true };
    }) : [];
    data.deadlines = Array.isArray(data.deadlines) ? data.deadlines.filter(function (deadline) {
      return deadline && typeof deadline.text === "string" && typeof deadline.date === "string";
    }) : [];
    data.skillsDone = Array.isArray(data.skillsDone) ? data.skillsDone.map(function (done) { return done === true; }) : [];
    data.sales = Array.isArray(data.sales) ? data.sales.filter(function (sale) {
      return sale && typeof sale.item === "string" && Number.isFinite(sale.amount) && sale.amount > 0;
    }) : [];
    if (data.goal && (typeof data.goal !== "object" || typeof data.goal.text !== "string" ||
        !Number.isInteger(data.goal.target) || data.goal.target < 1 ||
        !Number.isFinite(data.goal.current) || data.goal.current < 0)) {
      data.goal = null;
    } else if (data.goal) {
      data.goal.current = Math.min(data.goal.current, data.goal.target);
    }

    // ---------- Inline SVG icons (used instead of emojis) ----------
    function svg(paths) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
             'stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
    }
    var ICONS = {
      home: svg('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'),
      grid: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
      menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
      mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
      arrowRight: svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
      arrowLeft: svg('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
      close: svg('<path d="m18 6-12 12M6 6l12 12"/>'),
      flame: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
      target: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
      briefcase: svg('<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
      wallet: svg('<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M17 12h.01"/>'),
      trending: svg('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'),
      trophy: svg('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'),
      check: svg('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
      zap: svg('<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'),
      clock: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
      book: svg('<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>'),
      bulb: svg('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'),
      calc: svg('<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>'),
      dollar: svg('<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
      rocket: svg('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
      moon: svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
      sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>')
    };
    // Put each icon into every element that has a data-icon attribute.
    function paintIcons(root) {
      (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
        el.innerHTML = ICONS[el.getAttribute("data-icon")] || "";
      });
    }

    // The skills shown in Business Skills. They appear in batches of 6 —
    // finish a batch and the next one unlocks.
    var SKILLS = [
      // Level 1
      "Plan a simple business idea", "Price a product fairly", "Sell to your first customer",
      "Make a simple budget", "Spot a real customer need", "Keep basic records",
      // Level 2
      "Handle a tough 'no'", "Give great customer service", "Promote on social media",
      "Set a savings goal", "Work out your profit", "Ask customers for feedback",
      // Level 3
      "Find your first 10 customers", "Manage your time well", "Negotiate a better price",
      "Build a simple brand", "Reinvest your profit", "Lead a small team"
    ];

    // The list of badges and the rule to unlock each one.
    var BADGES = [
      { icon: "check",  name: "First Step", check: function(){ return data.streak >= 1; } },
      { icon: "flame",  name: "On Fire",    check: function(){ return data.streak >= 3; } },
      { icon: "target", name: "CEO",        check: function(){ return data.priorities.some(function(p){ return p.done; }); } },
      { icon: "book",   name: "Learner",    check: function(){ return (data.skillsDone||[]).filter(Boolean).length >= 3; } },
      { icon: "wallet", name: "Saver",      check: function(){ return data.savingsTotal >= 100; } },
      { icon: "dollar", name: "First Sale", check: function(){ return (data.sales||[]).length >= 1; } }
    ];

    // Use the visitor's local date so daily activities change at local midnight.
    function dateKey(date) {
      return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
    }
    function today() { return dateKey(new Date()); }
    function yesterday() {
      var date = new Date();
      date.setDate(date.getDate() - 1);
      return dateKey(date);
    }

    // ---------- Open and close the pop-up ----------
    var lastFeatureKey = "";
    function openFeature(key) {
      lastFeatureKey = key;
      // Titles and subtitles for each feature.
      var info = {
        discipline: ["Discipline", "Mark your habit done each day to grow your streak."],
        ceo:        ["CEO Mode", "Set up to 3 priorities and tick them off."],
        skills:     ["Business Skills", "Tick the skills you have learned."],
        money:      ["Money Habits", "Add your savings toward the KSh 1,000 goal."],
        sales:      ["Sales Tracker", "Record every sale and watch your money grow."],
        badges:     ["Badges", "The rewards you earn as you grow."]
      };
      document.getElementById("featureTitle").textContent = info[key][0];
      document.getElementById("featureSub").textContent = info[key][1];

      // Hide every panel, then show the one we want.
      var panels = document.querySelectorAll(".panel");
      for (var i = 0; i < panels.length; i++) panels[i].classList.remove("active");
      document.getElementById("panel-" + key).classList.add("active");

      // Fill the panel with the latest data.
      if (key === "discipline") { renderStreak(); renderOnePct(); renderHabits(); renderGoal(); renderChallenge(); }
      if (key === "ceo") { renderPriorities(); renderDeadlines(); }
      if (key === "skills") renderSkills();
      if (key === "money") renderMoney();
      if (key === "sales") renderSales();
      if (key === "badges") renderBadges();

      // Hide the home page and show the feature's own page, scrolled to the top.
      document.getElementById("landing").style.display = "none";
      document.getElementById("featurePage").style.display = "block";
      window.scrollTo(0, 0);
      document.getElementById("featureTitle").focus();
    }

    // Go back from a feature page to the home page.
    function goBack() {
      document.getElementById("featurePage").style.display = "none";
      document.getElementById("landing").style.display = "block";
      window.scrollTo(0, 0);
      var featureCard = document.querySelector('[data-feature-key="' + lastFeatureKey + '"]');
      if (featureCard) featureCard.focus();
    }

    // Go to a section on the home page (works even from a feature page).
    function goToSection(id) {
      document.getElementById("featurePage").style.display = "none";
      document.getElementById("landing").style.display = "block";
      var el = document.getElementById(id);
      if (el) el.scrollIntoView();
      if (window.innerWidth < 1000) closeSidebar();
    }

    // ---------- Sidebar controls ----------
    // Open or close the sliding sidebar (used on phones).
    function toggleSidebar() {
      document.getElementById("sidebar").classList.toggle("open");
      document.getElementById("sideBackdrop").classList.toggle("open");
    }
    function closeSidebar() {
      document.getElementById("sidebar").classList.remove("open");
      document.getElementById("sideBackdrop").classList.remove("open");
    }
    // Click a feature in the sidebar: open it, and close the sidebar on small screens.
    function pickFeature(key) {
      openFeature(key);
      if (window.innerWidth < 1000) closeSidebar();
    }
    // Go to the home page (and leave any feature page).
    function goHome() {
      goBack();
      location.hash = "#home";
      if (window.innerWidth < 1000) closeSidebar();
    }

    // ---------- Discipline (streak) ----------
    function renderStreak() {
      document.getElementById("streakNum").textContent = data.streak + " days";
      document.getElementById("bestStreak").textContent = (data.bestStreak || 0);
    }
    function markDay() {
      var msg = document.getElementById("streakMsg");
      if (data.lastDone === today()) {
        msg.textContent = "You already marked today. Come back tomorrow!";
        return;
      }
      if (data.lastDone !== yesterday()) data.streak = 0;
      data.streak = data.streak + 1;
      data.lastDone = today();
      if (data.streak > (data.bestStreak || 0)) data.bestStreak = data.streak; // remember the best
      save();
      var num = document.getElementById("streakNum");
      num.textContent = data.streak + " days";
      num.classList.remove("pulse"); void num.offsetWidth; num.classList.add("pulse"); // replay animation
      document.getElementById("bestStreak").textContent = data.bestStreak;
      msg.textContent = "Nice! Streak is now " + data.streak + " day(s).";
      updateHero();
    }

    // ---------- Motivational quotes (the "New quote" button) ----------
    var QUOTES = [
      ['"Discipline is the bridge between goals and accomplishment."', "— Jim Rohn"],
      ['"The way to get started is to quit talking and begin doing."', "— Walt Disney"],
      ['"Success is the sum of small efforts, repeated day in and day out."', "— Robert Collier"],
      ['"Don’t watch the clock; do what it does. Keep going."', "— Sam Levenson"],
      ['"The secret of getting ahead is getting started."', "— Mark Twain"],
      ['"It always seems impossible until it’s done."', "— Nelson Mandela"],
      ['"A year from now you may wish you had started today."', "— Karen Lamb"],
      ['"Quality means doing it right when no one is looking."', "— Henry Ford"],
      ['"Opportunities don’t happen. You create them."', "— Chris Grosser"],
      ['"Do what you can, with what you have, where you are."', "— Theodore Roosevelt"],
      ['"Fall seven times, stand up eight."', "— Japanese proverb"],
      ['"Little by little, a little becomes a lot."', "— Tanzanian proverb"],
      ['"Hard work beats talent when talent doesn’t work hard."', "— Tim Notke"],
      ['"The best way to predict the future is to create it."', "— Peter Drucker"]
    ];
    function newQuote() {
      var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      document.getElementById("quoteText").textContent = q[0];
      document.getElementById("quoteAuthor").textContent = q[1];
    }

    // ---------- Discipline: 1% better log ----------
    function addOnePct() {
      var input = document.getElementById("onePctInput");
      var text = input.value.trim();
      if (!text) return;
      data.onePct.unshift(text);            // add to the front
      if (data.onePct.length > 5) data.onePct.pop(); // keep only the latest 5
      input.value = "";
      save();
      renderOnePct();
    }
    function renderOnePct() {
      var box = document.getElementById("onePctList");
      box.innerHTML = "";
      data.onePct.forEach(function (t) {
        var div = document.createElement("div");
        div.className = "item done";
        div.innerHTML = '<span class="item-text">' + escapeHtml(t) + '</span>';
        box.appendChild(div);
      });
    }

    // ---------- Discipline: habits ----------
    function addHabit() {
      var input = document.getElementById("habitInput");
      var text = input.value.trim();
      if (!text) return;
      data.habits.push({ text: text, doneDate: "" });
      input.value = "";
      save();
      renderHabits();
    }
    function toggleHabit(i) {
      // Tick it done for today, or untick it.
      data.habits[i].doneDate = (data.habits[i].doneDate === today()) ? "" : today();
      save();
      renderHabits();
    }
    function deleteHabit(i) { data.habits.splice(i, 1); save(); renderHabits(); }
    function renderHabits() {
      var box = document.getElementById("habitList");
      box.innerHTML = "";
      data.habits.forEach(function (h, i) {
        var doneToday = (h.doneDate === today());
        var div = document.createElement("div");
        div.className = "item" + (doneToday ? " done" : "");
        div.innerHTML = '<span class="item-text">' + escapeHtml(h.text) + '</span>';
        var btns = document.createElement("span");
        var tick = document.createElement("button");
        tick.innerHTML = doneToday ? "Done " + ICONS.check : "Do";
        tick.onclick = function () { toggleHabit(i); };
        var del = document.createElement("button");
        del.innerHTML = ICONS.close; del.setAttribute("aria-label", "Delete habit"); del.style.marginLeft = "6px";
        del.onclick = function () { deleteHabit(i); };
        btns.appendChild(tick); btns.appendChild(del);
        div.appendChild(btns);
        box.appendChild(div);
      });
    }

    // ---------- Discipline: goal ----------
    function setGoal() {
      var text = document.getElementById("goalText").value.trim();
      var target = parseInt(document.getElementById("goalTarget").value, 10);
      if (!text || !target || target < 1) return;
      data.goal = { text: text, target: target, current: 0 };
      save();
      renderGoal();
    }
    function addGoalProgress() {
      if (!data.goal) return;
      if (data.goal.current < data.goal.target) data.goal.current++;
      save();
      renderGoal();
    }
    function renderGoal() {
      var box = document.getElementById("goalBox");
      if (!data.goal) { box.innerHTML = ""; return; }
      var pct = Math.min(data.goal.current / data.goal.target * 100, 100);
      box.innerHTML =
        '<p style="margin:10px 0 4px;font-weight:600;">' + escapeHtml(data.goal.text) +
        ' — ' + data.goal.current + ' / ' + data.goal.target + '</p>' +
        '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>';
      var btn = document.createElement("button");
      btn.className = "btn btn-purple"; btn.style.marginTop = "8px";
      btn.innerHTML = data.goal.current >= data.goal.target
        ? 'Goal reached <span class="ico">' + ICONS.trophy + '</span>'
        : "+1 progress";
      btn.onclick = addGoalProgress;
      box.appendChild(btn);
    }

    // ---------- Discipline: daily challenge ----------
    var CHALLENGES = [
      "Message one person about your business idea.",
      "Write down 3 things you're grateful for.",
      "Save KSh 20 today.",
      "Watch one short video about business.",
      "Plan tomorrow's top task tonight.",
      "Ask someone for honest feedback.",
      "Tidy your workspace for 5 minutes.",
      "Write down one new business idea.",
      "Compliment or thank a customer or friend.",
      "Read for 10 minutes.",
      "List 3 things you did well this week.",
      "Learn one new word about money or business.",
      "Spend 10 minutes improving your product or skill.",
      "Set one goal for tomorrow before bed.",
      "Reach out to someone you admire.",
      "Drink water and take a 5-minute walk to think.",
      "Post one thing about what you're building.",
      "Review your spending for today.",
      "Practise saying what your business does in one line.",
      "Help someone with no reward expected.",
      "Write down what's stopping you — and one fix.",
      "Do the task you've been avoiding."
    ];
    function challengeForToday() {
      // Pick one challenge based on the day, so it's the same all day.
      var date = new Date();
      var dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
      return CHALLENGES[dayNumber % CHALLENGES.length];
    }
    function renderChallenge() {
      document.getElementById("challengeText").textContent = challengeForToday();
      var msg = document.getElementById("challengeMsg");
      msg.textContent = (data.challengeDate === today()) ? "Completed today!" : "";
    }
    function doChallenge() {
      data.challengeDate = today();
      save();
      document.getElementById("challengeMsg").textContent = "Completed today!";
    }

    // ---------- CEO: deadlines ----------
    function addDeadline() {
      var text = document.getElementById("dlText").value.trim();
      var date = document.getElementById("dlDate").value;
      if (!text || !date) return;
      data.deadlines.push({ text: text, date: date });
      document.getElementById("dlText").value = "";
      document.getElementById("dlDate").value = "";
      save();
      renderDeadlines();
    }
    function deleteDeadline(i) { data.deadlines.splice(i, 1); save(); renderDeadlines(); }
    function renderDeadlines() {
      var box = document.getElementById("dlList");
      box.innerHTML = "";
      // Sort by date so the soonest is first.
      data.deadlines.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      data.deadlines.forEach(function (d, i) {
        var late = d.date < today();
        var div = document.createElement("div");
        div.className = "item";
        div.innerHTML = '<span class="item-text">' + escapeHtml(d.text) +
          ' <small style="color:' + (late ? '#dc2626' : 'var(--grey)') + '">(' + d.date + (late ? ' · late' : '') + ')</small></span>';
        var del = document.createElement("button");
        del.innerHTML = ICONS.close;
        del.setAttribute("aria-label", "Delete deadline");
        del.onclick = function () { deleteDeadline(i); };
        div.appendChild(del);
        box.appendChild(div);
      });
    }

    // ---------- Skills: idea generator ----------
    var IDEAS = [
      "Design and sell custom phone cases.",
      "Resell thrifted clothes online.",
      "Offer Canva graphic design for local shops.",
      "Start a snack-delivery service at school.",
      "Make beaded jewellery and sell at events.",
      "Tutor younger students in a subject you're great at.",
      "Sell homemade cold juice on hot days.",
      "Create and sell digital study notes.",
      "Do phone photography for small businesses.",
      "Run a weekend car-wash with friends.",
      "Grow herbs or vegetables and sell to neighbours.",
      "Manage a social media page for a local shop.",
      "Fix and resell old electronics.",
      "Bake and sell cookies for school events."
    ];
    function newIdea() {
      document.getElementById("ideaText").textContent =
        IDEAS[Math.floor(Math.random() * IDEAS.length)];
    }

    // ---------- Money: profit calculator ----------
    function calcProfit() {
      var cost = parseFloat(document.getElementById("costInput").value) || 0;
      var price = parseFloat(document.getElementById("priceInput").value) || 0;
      var profit = price - cost;
      var out = document.getElementById("profitText");
      if (cost < 0) {
        out.style.color = "var(--grey)";
        out.textContent = "Enter a cost of zero or more.";
        return;
      }
      if (price <= 0) {
        out.style.color = "var(--grey)";
        out.textContent = "Enter a selling price first.";
        return;
      }
      var margin = Math.round(profit / price * 100);
      out.style.color = profit >= 0 ? "#16a34a" : "#dc2626";
      out.textContent = "Profit: KSh " + profit + "  (margin " + margin + "%)";
    }


    // ---------- CEO Mode (priorities) ----------
    function addPriority() {
      var input = document.getElementById("prioInput");
      var text = input.value.trim();
      if (!text) return;
      if (data.priorities.length >= 3) { return; }
      data.priorities.push({ text: text, done: false });
      input.value = "";
      save();
      renderPriorities();
    }
    function togglePriority(i) {
      data.priorities[i].done = !data.priorities[i].done;
      save();
      renderPriorities();
    }
    function deletePriority(i) {
      data.priorities.splice(i, 1);
      save();
      renderPriorities();
    }
    function renderPriorities() {
      var list = document.getElementById("prioList");
      list.innerHTML = "";
      data.priorities.forEach(function (p, i) {
        var div = document.createElement("div");
        div.className = "item" + (p.done ? " done" : "");
        div.innerHTML = '<span class="item-text">' + escapeHtml(p.text) + '</span>';
        var btns = document.createElement("span");
        var tick = document.createElement("button");
        tick.innerHTML = p.done ? "Done " + ICONS.check : "Do";
        tick.onclick = function () { togglePriority(i); };
        var del = document.createElement("button");
        del.innerHTML = ICONS.close;
        del.setAttribute("aria-label", "Delete priority");
        del.style.marginLeft = "6px";
        del.onclick = function () { deletePriority(i); };
        btns.appendChild(tick); btns.appendChild(del);
        div.appendChild(btns);
        list.appendChild(div);
      });
      var doneCount = data.priorities.filter(function (p) { return p.done; }).length;
      var score = data.priorities.length ? Math.round(doneCount / data.priorities.length * 100) : 0;
      document.getElementById("ceoScore").textContent = score + "%";
    }

    // ---------- Business Skills ----------
    function renderSkills() {
      // make sure the done-list is as long as the skills list
      while (data.skillsDone.length < SKILLS.length) data.skillsDone.push(false);
      // show skills in batches of 6; reveal the next batch once the shown ones are all done
      var visible = 6;
      while (visible < SKILLS.length && allSkillsDone(visible)) visible += 6;
      visible = Math.min(visible, SKILLS.length);

      var list = document.getElementById("skillList");
      list.innerHTML = "";
      for (var i = 0; i < visible; i++) {
        (function (i) {
          var div = document.createElement("div");
          div.className = "item" + (data.skillsDone[i] ? " done" : "");
          div.innerHTML = '<span class="item-text">' + SKILLS[i] + '</span>';
          var btn = document.createElement("button");
          btn.innerHTML = data.skillsDone[i] ? "Learned " + ICONS.check : "Mark";
          btn.onclick = function () { data.skillsDone[i] = !data.skillsDone[i]; save(); renderSkills(); };
          div.appendChild(btn);
          list.appendChild(div);
        })(i);
      }
      var doneVisible = 0;
      for (var j = 0; j < visible; j++) if (data.skillsDone[j]) doneVisible++;
      var currentBatchStart = visible - Math.min(6, visible);
      var currentBatchDone = 0;
      for (var k = currentBatchStart; k < visible; k++) if (data.skillsDone[k]) currentBatchDone++;
      var currentBatchSize = visible - currentBatchStart;
      document.getElementById("skillBar").style.width = (currentBatchDone / currentBatchSize * 100) + "%";
      document.getElementById("skillMsg").innerHTML = allSkillsDone(SKILLS.length)
        ? 'All ' + SKILLS.length + ' skills mastered <span class="ico">' + ICONS.trophy + '</span>'
        : (doneVisible + " of " + visible + " learned — finish them to unlock more.");
    }
    // true if the first n skills are all done
    function allSkillsDone(n) {
      for (var i = 0; i < n; i++) if (!data.skillsDone[i]) return false;
      return true;
    }

    // ---------- Money ----------
    function addSaving() {
      var input = document.getElementById("saveInput");
      var amount = Number(input.value);
      if (!Number.isInteger(amount) || amount < 1) return;
      data.savingsTotal = data.savingsTotal + amount;
      input.value = "";
      save();
      renderMoney();
    }
    function renderMoney() {
      document.getElementById("saveTotal").textContent = "KSh " + data.savingsTotal;
      var pct = Math.min(data.savingsTotal / 1000 * 100, 100);
      document.getElementById("saveBar").style.width = pct + "%";
      var msg = document.getElementById("saveMsg");
      msg.innerHTML = data.savingsTotal >= 1000
        ? 'Goal reached <span class="ico">' + ICONS.trophy + '</span>'
        : "Keep going!";
    }

    // ---------- Sales Tracker ----------
    function recordSale() {
      var item = document.getElementById("saleItem").value.trim();
      var amount = parseFloat(document.getElementById("saleAmount").value) || 0;
      if (!item || amount <= 0) return;
      data.sales.unshift({ item: item, amount: amount });  // newest first
      document.getElementById("saleItem").value = "";
      document.getElementById("saleAmount").value = "";
      save();
      renderSales();
    }
    function deleteSale(i) { data.sales.splice(i, 1); save(); renderSales(); }
    function renderSales() {
      var total = 0;
      data.sales.forEach(function (s) { total += s.amount; });
      document.getElementById("saleTotal").textContent = "KSh " + total;
      document.getElementById("saleCount").textContent = data.sales.length;
      var box = document.getElementById("saleList");
      box.innerHTML = "";
      data.sales.forEach(function (s, i) {
        var div = document.createElement("div");
        div.className = "item done";
        div.innerHTML = '<span class="item-text">' + escapeHtml(s.item) + ' — KSh ' + s.amount + '</span>';
        var del = document.createElement("button");
        del.innerHTML = ICONS.close;
        del.setAttribute("aria-label", "Delete sale");
        del.onclick = function () { deleteSale(i); };
        div.appendChild(del);
        box.appendChild(div);
      });
    }

    // ---------- Badges ----------
    function renderBadges() {
      var grid = document.getElementById("badgeGrid");
      grid.innerHTML = "";
      var count = 0;
      BADGES.forEach(function (b) {
        var unlocked = b.check();
        if (unlocked) count++;
        var box = document.createElement("div");
        box.className = "badge-box" + (unlocked ? " unlocked" : "");
        box.innerHTML = '<div class="badge-icon">' + (ICONS[b.icon] || "") + '</div><div class="badge-name">' + b.name + '</div>';
        grid.appendChild(box);
      });
      document.getElementById("badgeCount").textContent = count + " of " + BADGES.length + " unlocked";
    }

    // ---------- Small helpers ----------
    // Make typed text safe to show (stops broken HTML).
    function escapeHtml(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    // Update the streak number shown in the hero card.
    function updateHero() {
      document.getElementById("heroStreak").textContent = data.streak + " days";
    }

    // ---------- Scroll reveal animation ----------
    // Watch the elements with class "reveal" and add "show" when they scroll into view.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("show"); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

    // ---------- Light / dark mode ----------
    function toggleTheme() {
      var dark = document.body.classList.toggle("dark");
      document.getElementById("themeBtn").innerHTML = ICONS[dark ? "sun" : "moon"];
      try {
        localStorage.setItem("eh-theme", dark ? "dark" : "light");
      } catch (error) {
        reportStorageError("Could not save your theme preference.", error);
      }
    }
    // Apply the saved theme when the page loads.
    (function () {
      var t = "light";
      try {
        t = localStorage.getItem("eh-theme") || "light";
      } catch (error) {
        reportStorageError("Could not read your saved theme preference.", error);
      }
      if (t === "dark") document.body.classList.add("dark");
      document.getElementById("themeBtn").innerHTML = ICONS[t === "dark" ? "sun" : "moon"];
    })();

    // Draw all the inline SVG icons, then show the saved streak.
    paintIcons();
    document.querySelectorAll(".feature-card").forEach(function (card) {
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          card.click();
        }
      });
    });
    updateHero();