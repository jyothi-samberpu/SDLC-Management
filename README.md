# 📋 DevPulse - SDLC Management Dashboard

A high-contrast, high-performance Neo-Brutalist single-page application (SPA) built with a decoupled architecture to manage and optimize software development lifecycle workflows. Features a fully implemented Role-Based Access Control (RBAC) system for Project Managers and Engineers.

🌐 **Live Deployment:** [https://sdlc-project-management.onrender.com/](https://sdlc-project-management.onrender.com/)

---

## 🚀 Core Features

* **Neo-Brutalist Layout UI:** A clean, bold, high-contrast user interface that abandons traditional modern gradients for stark typography, definitive borders, and flat solid aesthetic indicators.
* **Dynamic Kanban Board Workflow:** Real-time state transitions through drag-and-drop operations separating pipeline statuses across *To Do*, *In Progress*, and *Completed*.
* **Role-Based Access Control (RBAC):**
    * **Project Managers:** Retain master read/write access privileges, task creation hooks, team mapping, drag-and-drop column mutators, and access to the analytical telemetry modules.
    * **Employees:** Restrained view matrix limited strictly to tasks explicitly assigned to their active session profile with a locked status-only updates permission filter.
* **Dynamic Multi-View Section Rendering:** Live toggle tracking across three core views with zero-framework Vanilla JS performance profiles:
    * 📋 **Kanban Workflow Board**
    * 📊 **SDLC Lifecycle Analytics:** Aggregated tracking distributions across structural engineering phases (*Requirements*, *Design*, *Development*, *Testing*, *Deployment*).
    * 👥 **Team Overview Allocation:** Real-time resource capacity metrics summarizing active workloads per team asset profile.
* **Self-Healing Embedded Datastore:** Persistent SQLite execution model featuring automatic runtime table validation and mock user seeds upon boot.

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Properties, Neo-Brutalist Grid/Flex Matrix layouts), Vanilla JavaScript (Asynchronous Fetch API, HTML5 Drag and Drop API).
* **Backend REST Layer:** Node.js, Express.js.
* **Database Engine:** SQLite3 (Embedded persistent relational datastore filesystem).
* **Cloud Hosting Infrastructure:** Render Web Services (Mounted with an asynchronous `/var/data` persistent local disk space module).

---

## 💾 Local Machine Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed locally before proceeding.

1. **Clone the repository context:**
   ```bash
   git clone [https://github.com/jyothi-samberpu/SDLC-Management.git](https://github.com/jyothi-samberpu/SDLC-Management.git)
   cd SDLC-Management
