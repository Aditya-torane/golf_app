// const BASE_URL =
//   window.location.protocol === "file:"
//     ? "http://localhost:5000/api"
//     : `${window.location.origin}/api`;
// let scoreChart;
// let participationChart;

// function showSpinner(show) {
//   const overlay = document.getElementById("spinnerOverlay");
//   if (overlay) overlay.classList.toggle("hidden", !show);
// }

// function toast(message, type = "success") {
//   const container = document.getElementById("toastContainer");
//   if (!container) return;
//   const el = document.createElement("div");
//   el.className = `toast ${type}`;
//   el.textContent = message;
//   container.appendChild(el);
//   setTimeout(() => el.remove(), 3000);
// }

// function saveAuth(data) {
//   localStorage.setItem("token", data.token);
//   localStorage.setItem("role", data.user.role);
// }

// function getToken() {
//   return localStorage.getItem("token");
// }

// function api(path, options = {}) {
//   const token = getToken();
//   const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
//   if (token) headers.Authorization = `Bearer ${token}`;
//   return fetch(`${BASE_URL}${path}`, { ...options, headers });
// }

// function logout(redirect = "login.html") {
//   localStorage.removeItem("token");
//   localStorage.removeItem("role");
//   window.location.href = redirect;
// }

// function generateTransactionId() {
//   return `TX-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`.toUpperCase();
// }

// function getQueryParam(key) {
//   const params = new URLSearchParams(window.location.search);
//   return params.get(key);
// }

// async function handleSignup(e) {
//   e.preventDefault();
//   showSpinner(true);
//   try {
//     const body = {
//       name: document.getElementById("name").value.trim(),
//       email: document.getElementById("email").value.trim(),
//       password: document.getElementById("password").value,
//       role: document.getElementById("role").value
//     };
//     const res = await api("/auth/signup", { method: "POST", body: JSON.stringify(body) });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
//     saveAuth(data);
//     toast("Signup successful");
//     window.location.href = data.user.role === "admin" ? "admin.html" : "dashboard.html";
//   } catch (err) {
//     toast(err.message || "Signup failed", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function handleLogin(e) {
//   e.preventDefault();
//   showSpinner(true);
//   try {
//     const body = {
//       email: document.getElementById("email").value.trim(),
//       password: document.getElementById("password").value
//     };
//     const res = await api("/auth/login", { method: "POST", body: JSON.stringify(body) });
//     const data = await res.json();
//     if (!res.ok) {
//       throw new Error(data.message);
//     }
//     saveAuth(data);
//     toast("Login successful");
//     window.location.href = data.user.role === "admin" ? "admin.html" : "dashboard.html";
//   } catch (err) {
//     toast(err.message || "Login failed", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// function renderScoreList(scores) {
//   const list = document.getElementById("scoreList");
//   if (!list) return;
//   list.innerHTML = scores.length
//     ? scores.map((s) => `<li class="bg-slate-50 p-2 rounded-md border border-slate-100">${s.value} <span class="text-slate-500 text-sm">(${new Date(s.createdAt).toLocaleString()})</span></li>`).join("")
//     : '<li class="text-slate-400">No scores available</li>';
// }

// function renderScoreChart(scores) {
//   const ctx = document.getElementById("scoreChart");
//   if (!ctx || typeof Chart === "undefined") return;
//   if (scoreChart) scoreChart.destroy();
//   const labels = [...scores].reverse().map((_, idx) => `Round ${idx + 1}`);
//   const values = [...scores].reverse().map((s) => s.value);
//   scoreChart = new Chart(ctx, {
//     type: "line",
//     data: { labels, datasets: [{ label: "Golf Scores", data: values, borderColor: "#38bdf8", tension: 0.3 }] },
//     options: { plugins: { legend: { labels: { color: "#cbd5e1" } } }, scales: { x: { ticks: { color: "#94a3b8" } }, y: { ticks: { color: "#94a3b8" }, min: 1, max: 45 } } }
//   });
// }

// function renderParticipationChart(scores, myWin) {
//   const ctx = document.getElementById("participationChart");
//   if (!ctx || typeof Chart === "undefined") return;
//   if (participationChart) participationChart.destroy();
//   participationChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: ["Scores Entered", "Winning Matches"],
//       datasets: [{ data: [scores.length, myWin ? myWin.matchedCount : 0], backgroundColor: ["#0ea5e9", "#22c55e"] }]
//     },
//     options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#94a3b8" } }, y: { ticks: { color: "#94a3b8" } } } }
//   });
// }

// async function loadDashboard() {
//   showSpinner(true);
//   try {
//     const [dashRes, drawRes] = await Promise.all([api("/users/dashboard"), api("/draws/latest/me")]);
//     const data = await dashRes.json();
//     if (!dashRes.ok) throw new Error(data.message);
//     const d = data.dashboard;

//     const drawData = await drawRes.json().catch(() => ({}));
//     let myWin = null;
//     let draw = null;
//     if (drawRes.ok) {
//       myWin = drawData?.myWin || null;
//       draw = drawData?.draw || null;
//     } else if (drawRes.status === 404) {
//       myWin = null;
//       draw = null;
//     } else {
//       throw new Error(drawData?.message || "Failed to load latest draw");
//     }

//     const userNameEl = document.getElementById("userName");
//     const userEmailEl = document.getElementById("userEmail");
//     if (userNameEl) userNameEl.textContent = d.user?.name || "-";
//     if (userEmailEl) userEmailEl.textContent = d.user?.email || "";

//     const subStatus = d.subscription ? d.subscription.status : "inactive";
//     document.getElementById("subscriptionStatus").textContent = subStatus.toUpperCase();
//     document.getElementById("subscriptionPlan").textContent = d.subscription ? `Plan: ${d.subscription.plan}` : "No plan selected";
//     document.getElementById("selectedCharity").textContent = d.selectedCharity?.charity?.name || "Not selected";
//     document.getElementById("drawResult").textContent = myWin
//       ? `${myWin.prize} (${myWin.matchedCount} matches)`
//       : draw
//         ? "No win this draw"
//         : "No draw executed yet";
//     document.getElementById("drawNumbersDashboard").textContent = draw
//       ? `Numbers: ${draw.numbers.join(", ")}`
//       : "No draw numbers available";

//     renderScoreList(d.scores || []);
//   } catch (err) {
//     toast(err.message || "Failed to load dashboard", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function addScore(e) {
//   e.preventDefault();
//   showSpinner(true);
//   try {
//     const value = Number(document.getElementById("score").value);
//     const res = await api("/scores", { method: "POST", body: JSON.stringify({ value }) });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
//     toast("Score added. Only last 5 are kept.");
//     document.getElementById("score").value = "";
//     renderScoreList(data.scores);
//     renderScoreChart(data.scores);
//     renderParticipationChart(data.scores, null);
//   } catch (err) {
//     toast(err.message || "Could not add score", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function activateSubscription(plan) {
//   showSpinner(true);
//   try {
//     const res = await api("/payments/checkout", { method: "POST", body: JSON.stringify({ plan }) });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
//     toast(`${plan} payment successful (simulation)`);
//     loadDashboard();
//   } catch (err) {
//     toast(err.message || "Subscription update failed", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function loadCharitiesPage() {
//   showSpinner(true);
//   try {
//     const res = await api("/charities");
//     const data = await res.json();
//     const list = document.getElementById("charityList");
//     list.innerHTML = (data.charities || []).map((c) => `
//       <div class="dashboard-card">
//         <h3 class="text-lg font-semibold">${c.name}</h3>
//         <p class="text-slate-400 text-sm mt-2">${c.description}</p>
//         <p class="mt-2 text-sky-400">Donation: ${c.donationPercentage}%</p>
//         <button class="btn-primary mt-3 w-full" onclick="selectCharity('${c.id || c._id}')">Select</button>
//       </div>
//     `).join("");
//   } catch (err) {
//     toast("Failed to load charities", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function selectCharity(charityId) {
//   showSpinner(true);
//   try {
//     const res = await api("/charities/select", { method: "POST", body: JSON.stringify({ charityId }) });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
//     toast("Charity selected successfully");
//   } catch (err) {
//     toast(err.message || "Selection failed", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function loadAdminData() {
//   showSpinner(true);
//   try {
//     const userEmail = document.getElementById("adminUserEmailFilter")?.value?.trim() || "";
//     const charityName = document.getElementById("adminCharityNameFilter")?.value?.trim() || "";
//     const scoreEmail = document.getElementById("adminScoreEmailFilter")?.value?.trim() || "";

//     const [usersRes, scoresRes, charitiesRes, paymentsRes, analyticsRes] = await Promise.all([
//       api(userEmail ? `/users?email=${encodeURIComponent(userEmail)}` : "/users"),
//       api(scoreEmail ? `/scores?email=${encodeURIComponent(scoreEmail)}` : "/scores"),
//       api(charityName ? `/charities?name=${encodeURIComponent(charityName)}` : "/charities"),
//       api(userEmail ? `/payments/admin?email=${encodeURIComponent(userEmail)}` : "/payments/admin"),
//       api("/analytics/admin")
//     ]);
//     const usersData = await usersRes.json();
//     const scoresData = await scoresRes.json();
//     const charitiesData = await charitiesRes.json();
//     const paymentsData = await paymentsRes.json();
//     const analyticsData = await analyticsRes.json();

//     document.getElementById("userList").innerHTML = (usersData.users || []).map((u) =>
//       `<div class="bg-slate-50 rounded p-2 space-y-2 border border-slate-100">
//         <div class="flex justify-between gap-2 flex-wrap">
//           <div>
//             <div>${u.name} - ${u.email} <span class="text-sky-400">(${u.role})</span></div>
//             <div class="text-slate-400 text-sm mt-1">
//               Subscription: ${u.plan ? (u.plan + " (" + u.status + ")") : "No subscription"}
//             </div>
//           </div>
//           <div class="flex gap-2">
//             <button class="btn-secondary admin-activate-sub" data-user-id="${u.id}" data-plan="monthly">Monthly</button>
//             <button class="btn-secondary admin-activate-sub" data-user-id="${u.id}" data-plan="yearly">Yearly</button>
//             <button class="btn-danger admin-deactivate-sub" data-user-id="${u.id}">Deactivate</button>
//           </div>
//         </div>
//       </div>`
//     ).join("");

//     document.getElementById("allScoresList").innerHTML = (scoresData.scores || []).map((s) =>
//       `<div class="bg-slate-50 rounded p-2 flex justify-between gap-2 border border-slate-100">
//         <span>${s.user?.name || "User"}: ${s.value}</span>
//         <button class="btn-secondary admin-edit-score" data-score-id="${s.id || s._id}">Edit</button>
//       </div>`).join("");

//     document.getElementById("charityAdminList").innerHTML = (charitiesData.charities || []).map((c) =>
//       `<div class="bg-slate-50 rounded p-3 flex justify-between gap-2 border border-slate-100">
//         <span>${c.name} (${c.donationPercentage}%)</span>
//         <div class="flex gap-2">
//           <button class="btn-secondary admin-edit-charity" data-charity-id="${c.id || c._id}">Edit</button>
//           <button class="btn-danger admin-delete-charity" data-charity-id="${c.id || c._id}">Delete</button>
//         </div>
//       </div>`).join("");

//     document.getElementById("paymentsAdminList").innerHTML = (paymentsData.payments || []).map((p) =>
//       `<div class="bg-slate-50 rounded p-3 space-y-2 border border-slate-100">
//         <div class="flex justify-between gap-2 flex-wrap">
//           <div>
//             <div class="font-semibold">${p.name} <span class="text-sky-400">(${p.email})</span></div>
//             <div class="text-slate-400 text-sm mt-1">Plan: ${p.plan} • ${p.status}</div>
//           </div>
//           <div class="text-right">
//             <div class="text-slate-900 font-semibold">${p.currency || "INR"} ${p.amount}</div>
//             <div class="text-slate-400 text-sm mt-1">${p.paymentMethod}</div>
//           </div>
//         </div>
//         <div class="text-slate-300 text-sm break-all">
//           Tx: ${p.transactionId} • ${p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
//         </div>
//       </div>`
//     ).join("");

//     if (analyticsRes.ok && analyticsData?.analytics) {
//       const a = analyticsData.analytics;
//       document.getElementById("adminTotalUsers").textContent = a.totalUsers ?? 0;
//       document.getElementById("adminActiveSubscriptions").textContent = a.activeSubscriptions ?? 0;
//       document.getElementById("adminRevenue").textContent = `₹${a.revenue ?? 0}`;
//     }
//   } catch (err) {
//     console.error("loadAdminData failed:", err);
//     toast("Failed loading admin data", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function adminActivateSubscriptionForUser(userId, plan) {
//   showSpinner(true);
//   try {
//     const res = await api(`/subscriptions/admin/${userId}`, {
//       method: "POST",
//       body: JSON.stringify({ plan })
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
//     toast("Subscription updated");
//     loadAdminData();
//   } catch (err) {
//     console.error("adminActivateSubscriptionForUser failed:", err);
//     toast(err.message || "Subscription update failed", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function adminDeactivateSubscriptionForUser(userId) {
//   showSpinner(true);
//   try {
//     const res = await api(`/subscriptions/admin/${userId}/deactivate`, { method: "POST" });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
//     toast("Subscription deactivated");
//     loadAdminData();
//   } catch (err) {
//     console.error("adminDeactivateSubscriptionForUser failed:", err);
//     toast(err.message || "Deactivation failed", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function runDraw() {
//   showSpinner(true);
//   try {
//     const res = await api("/draws/run", { method: "POST" });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);
//     document.getElementById("drawNumbers").textContent = `Draw Numbers: ${data.draw.numbers.join(", ")}`;
//     toast("Monthly draw completed");
//   } catch (err) {
//     console.error("runDraw failed:", err);
//     toast(err.message || "Draw failed", "error");
//   } finally {
//     showSpinner(false);
//   }
// }

// async function editScore(id) {
//   const value = prompt("Enter new score (1-45):");
//   if (!value) return;
//   const res = await api(`/scores/${id}`, { method: "PUT", body: JSON.stringify({ value: Number(value) }) });
//   const data = await res.json();
//   if (!res.ok) {
//     console.error("editScore failed:", data);
//     return toast(data.message || "Update failed", "error");
//   }
//   toast("Score updated");
//   loadAdminData();
// }

// async function addCharity(e) {
//   e.preventDefault();
//   const body = {
//     name: document.getElementById("charityName").value.trim(),
//     description: document.getElementById("charityDescription").value.trim(),
//     donationPercentage: Number(document.getElementById("charityPercent").value)
//   };
//   const res = await api("/charities", { method: "POST", body: JSON.stringify(body) });
//   const data = await res.json();
//   if (!res.ok) {
//     console.error("addCharity failed:", data);
//     return toast(data.message || "Create charity failed", "error");
//   }
//   toast("Charity created");
//   e.target.reset();
//   loadAdminData();
// }

// async function editCharity(id) {
//   const name = prompt("New charity name:");
//   if (!name) return;
//   const res = await api(`/charities/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
//   const data = await res.json();
//   if (!res.ok) {
//     console.error("editCharity failed:", data);
//     return toast(data.message || "Update failed", "error");
//   }
//   toast("Charity updated");
//   loadAdminData();
// }

// async function deleteCharity(id) {
//   const res = await api(`/charities/${id}`, { method: "DELETE" });
//   const data = await res.json();
//   if (!res.ok) {
//     console.error("deleteCharity failed:", data);
//     return toast(data.message || "Delete failed", "error");
//   }
//   toast("Charity deleted");
//   loadAdminData();
// }

// // Make admin action handlers available for inline `onclick` attributes.
// // (Some browsers/optimizers can otherwise scope functions unpredictably.)
// window.adminActivateSubscriptionForUser = adminActivateSubscriptionForUser;
// window.adminDeactivateSubscriptionForUser = adminDeactivateSubscriptionForUser;
// window.editScore = editScore;
// window.editCharity = editCharity;
// window.deleteCharity = deleteCharity;

// document.addEventListener("DOMContentLoaded", () => {
//   let page = window.location.pathname.split("/").pop();
//   if (!page) page = "login.html";

//   if (page === "signup.html") {
//     document.getElementById("signupForm")?.addEventListener("submit", handleSignup);
//   }

//   if (page === "login.html") {
//     document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
//   }

//   if (!["login.html", "signup.html"].includes(page) && !getToken()) {
//     return logout("login.html");
//   }

//   async function verifyMe() {
//     const res = await api("/auth/me", { method: "GET" });
//     const data = await res.json().catch(() => ({}));
//     if (!res.ok) throw new Error(data.message || "Unauthorized");
//     return data.user;
//   }

//   if (page === "dashboard.html") {
//     (async () => {
//       try {
//         const me = await verifyMe();
//         if (me.role === "admin") return logout("admin.html");

//         document.getElementById("scoreForm")?.addEventListener("submit", addScore);
//         document.getElementById("subscribeBtn")?.addEventListener("click", () => {
//           window.location.href = "subscription.html";
//         });
//         document.getElementById("logoutBtn")?.addEventListener("click", () => logout("login.html"));
//         loadDashboard();
//       } catch {
//         logout("login.html");
//       }
//     })();
//   }

//   if (page === "subscription.html") {
//     (async () => {
//       let selectedPlan = null;
//       let selectedPlanPrice = 0;
//       let selectedMethod = "UPI";

//       const selectedPlanAmount = document.getElementById("selectedPlanAmount");

//       try {
//         const me = await verifyMe();
//         if (me.role === "admin") return logout("admin.html");

//         document.getElementById("logoutBtn")?.addEventListener("click", () => logout("login.html"));

//         const paymentSection = document.getElementById("paymentOptionsSection");
//         const selectedPlanText = document.getElementById("selectedPlanText");
//         const txOut = document.getElementById("transactionIdOutput");

//         document.getElementById("chooseMonthlyBtn")?.addEventListener("click", () => {
//           selectedPlan = "monthly";
//           selectedPlanPrice = 250;
//           if (selectedPlanText) selectedPlanText.textContent = "Monthly";
//           if (selectedPlanAmount) selectedPlanAmount.textContent = "₹250";
//           paymentSection?.classList.remove("hidden");
//           txOut && (txOut.textContent = "-");
//         });

//         document.getElementById("chooseYearlyBtn")?.addEventListener("click", () => {
//           selectedPlan = "yearly";
//           selectedPlanPrice = 3000;
//           if (selectedPlanText) selectedPlanText.textContent = "Yearly";
//           if (selectedPlanAmount) selectedPlanAmount.textContent = "₹3000";
//           paymentSection?.classList.remove("hidden");
//           txOut && (txOut.textContent = "-");
//         });

//         document.getElementById("methodUPIBtn")?.addEventListener("click", () => (selectedMethod = "UPI"));
//         document.getElementById("methodCardBtn")?.addEventListener("click", () => (selectedMethod = "Card"));
//         document.getElementById("methodNetBtn")?.addEventListener("click", () => (selectedMethod = "NetBanking"));

//         document.getElementById("payNowBtn")?.addEventListener("click", async () => {
//           if (!selectedPlan) return toast("Please choose a plan first", "error");

//           const transactionId = generateTransactionId();
//           if (txOut) txOut.textContent = transactionId;

//           showSpinner(true);
//           try {
//             const res = await api("/payments", {
//               method: "POST",
//               body: JSON.stringify({ plan: selectedPlan, paymentMethod: selectedMethod, transactionId, amount: selectedPlanPrice })
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.message);

//             toast(`Payment successful (simulation): ₹${selectedPlanPrice}`);
//             window.location.href = `receipt.html?transactionId=${encodeURIComponent(transactionId)}`;
//           } catch (err) {
//             toast(err.message || "Payment failed", "error");
//           } finally {
//             showSpinner(false);
//           }
//         });
//       } catch {
//         logout("login.html");
//       }
//     })();
//   }

//   if (page === "receipt.html") {
//     (async () => {
//       try {
//         const me = await verifyMe();
//         document.getElementById("logoutBtn")?.addEventListener("click", () => logout("login.html"));

//         const transactionId = getQueryParam("transactionId");
//         if (!transactionId) throw new Error("Missing transactionId");

//         showSpinner(true);
//         try {
//           const res = await api(`/payments/receipt/${encodeURIComponent(transactionId)}`, { method: "GET" });
//           const data = await res.json();
//           if (!res.ok) throw new Error(data.message);

//           const r = data.receipt;
//           document.getElementById("receiptUserName").textContent = r.name || "-";
//           document.getElementById("receiptUserEmail").textContent = r.email || "-";
//           document.getElementById("receiptPlan").textContent = r.plan || "-";
//           document.getElementById("receiptAmount").textContent = `${r.currency || "INR"} ${r.amount}`;
//           document.getElementById("receiptPaymentMethod").textContent = r.paymentMethod || "-";
//           document.getElementById("receiptTransactionId").textContent = r.transactionId || "-";
//           document.getElementById("receiptCreatedAt").textContent = r.createdAt
//             ? new Date(r.createdAt).toLocaleString()
//             : "-";
//           document.getElementById("receiptStatus").textContent = r.status || "Success";
//         } finally {
//           showSpinner(false);
//         }

//         document.getElementById("printReceiptBtn")?.addEventListener("click", () => window.print());
//         document.getElementById("downloadReceiptBtn")?.addEventListener("click", () => window.print());
//       } catch {
//         logout("login.html");
//       }
//     })();
//   }

//   if (page === "charities.html") {
//     loadCharitiesPage();
//   }

//   if (page === "admin.html") {
//     (async () => {
//       try {
//         const me = await verifyMe();
//         if (me.role !== "admin") return logout("login.html");

//         document.getElementById("runDrawBtn")?.addEventListener("click", runDraw);
//         document.getElementById("applyAdminFiltersBtn")?.addEventListener("click", loadAdminData);
//         document.getElementById("charityForm")?.addEventListener("submit", addCharity);
//         document.getElementById("adminLogoutBtn")?.addEventListener("click", () => logout("login.html"));

//         document.getElementById("userList")?.addEventListener("click", (e) => {
//           const target = e.target;
//           const userId = target?.dataset?.userId;
//           if (!userId) return;

//           if (target.classList.contains("admin-activate-sub")) {
//             adminActivateSubscriptionForUser(userId, target.dataset.plan);
//           } else if (target.classList.contains("admin-deactivate-sub")) {
//             adminDeactivateSubscriptionForUser(userId);
//           }
//         });

//         document.getElementById("charityAdminList")?.addEventListener("click", (e) => {
//           const target = e.target;
//           const charityId = target?.dataset?.charityId;
//           if (!charityId) return;

//           if (target.classList.contains("admin-edit-charity")) {
//             editCharity(charityId);
//           } else if (target.classList.contains("admin-delete-charity")) {
//             deleteCharity(charityId);
//           }
//         });

//         document.getElementById("allScoresList")?.addEventListener("click", (e) => {
//           const target = e.target;
//           const scoreId = target?.dataset?.scoreId;
//           if (!scoreId) return;

//           if (target.classList.contains("admin-edit-score")) {
//             editScore(scoreId);
//           }
//         });

//         loadAdminData();
//       } catch {
//         logout("login.html");
//       }
//     })();
//   }
// });


const BASE_URL = ""; // demo mode

let scoreChart;
let participationChart;

function showSpinner(show) {
const overlay = document.getElementById("spinnerOverlay");
if (overlay) overlay.classList.toggle("hidden", !show);
}

function toast(message, type = "success") {
alert(message);
}

function saveAuth(data) {
localStorage.setItem("token", "demo");
localStorage.setItem("role", data.user.role);
}

function getToken() {
return localStorage.getItem("token");
}

// ✅ FAKE API (NO BACKEND)
async function api(path, options = {}) {
await new Promise(r => setTimeout(r, 200));

if (path === "/auth/login") {
return {
ok: true,
json: async () => ({
token: "demo",
user: { name: "Aditya", email: "[demo@mail.com](mailto:demo@mail.com)", role: "user" }
})
};
}

if (path === "/auth/me") {
return {
ok: true,
json: async () => ({
user: { name: "Aditya", email: "[demo@mail.com](mailto:demo@mail.com)", role: "user" }
})
};
}

if (path === "/users/dashboard") {
return {
ok: true,
json: async () => ({
dashboard: {
user: { name: "Aditya", email: "[demo@mail.com](mailto:demo@mail.com)" },
scores: JSON.parse(localStorage.getItem("scores") || "[]"),
subscription: { status: "active", plan: "monthly" }
}
})
};
}

if (path === "/scores" && options.method === "POST") {
const body = JSON.parse(options.body || "{}");
let scores = JSON.parse(localStorage.getItem("scores") || "[]");

```
scores.unshift({
  value: body.value,
  createdAt: new Date()
});

localStorage.setItem("scores", JSON.stringify(scores));

return {
  ok: true,
  json: async () => ({ scores })
};
```

}

return {
ok: true,
json: async () => ({})
};
}

function logout(redirect = "login.html") {
localStorage.clear();
window.location.href = redirect;
}

// LOGIN
async function handleLogin(e) {
e.preventDefault();
const res = await api("/auth/login");
const data = await res.json();
saveAuth(data);
window.location.href = "dashboard.html";
}

// DASHBOARD
async function loadDashboard() {
const res = await api("/users/dashboard");
const data = await res.json();

document.getElementById("userName").textContent = data.dashboard.user.name;
document.getElementById("userEmail").textContent = data.dashboard.user.email;

renderScores(data.dashboard.scores);
}

// ADD SCORE
async function addScore(e) {
e.preventDefault();

const value = document.getElementById("score").value;

const res = await api("/scores", {
method: "POST",
body: JSON.stringify({ value })
});

const data = await res.json();
renderScores(data.scores);
}

// RENDER SCORES
function renderScores(scores) {
const list = document.getElementById("scoreList");

list.innerHTML = scores.map(s =>
`<li>${s.value}</li>`
).join("");
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
let page = window.location.pathname.split("/").pop() || "login.html";

if (page === "login.html") {
document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
}

if (page === "dashboard.html") {
loadDashboard();
document.getElementById("scoreForm")?.addEventListener("submit", addScore);
document.getElementById("logoutBtn")?.addEventListener("click", () => logout());
}

if (page === "admin.html") {
document.getElementById("adminLogoutBtn")?.addEventListener("click", () => logout());
}
});
