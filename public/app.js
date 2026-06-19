let currentUser = { username: 'manager1', role: 'Project Manager' };

document.addEventListener("DOMContentLoaded", () => {
    setupIdentitySwitcher();
    setupTabNavigation();
    loadDashboardData();
    setupFormSubmission();
    setupDragAndDrop();

    document.getElementById("close-modal").addEventListener("click", () => {
        document.getElementById("task-modal").classList.add("hidden");
    });
});

// Dynamic Client View Navigation Tab Controller
function setupTabNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Do not allow employees to open restricted views
            if (currentUser.role !== 'Project Manager' && link.classList.contains('manager-only')) {
                return;
            }

            // Toggle active tracking classes
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            // Toggle viewport views hidden flags
            const targetViewId = link.getAttribute("data-target");
            document.querySelectorAll(".view-section").forEach(view => {
                view.classList.add("hidden");
            });
            document.getElementById(targetViewId).classList.remove("hidden");
        });
    });
}

function setupIdentitySwitcher() {
    const headerProfile = document.querySelector(".user-profile");
    headerProfile.innerHTML = `
        <select id="role-switcher" style="background:#334155; color:#fff; border:1px solid #475569; padding:0.4rem; border-radius:4px; margin-right:1rem; cursor:pointer;">
            <option value="manager1">Sign In: manager1 (Manager)</option>
            <option value="alex_dev">Sign In: alex_dev (Employee)</option>
            <option value="sam_qa">Sign In: sam_qa (Employee)</option>
        </select>
        <span id="user-badge" class="count-badge" style="background:#2563eb; color:#fff; padding:0.4rem 0.8rem;">Project Manager</span>
    `;

    document.getElementById("role-switcher").addEventListener("change", async (e) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: e.target.value })
        });
        currentUser = await response.json();
        
        document.body.setAttribute('data-role', currentUser.role === 'Project Manager' ? 'manager' : 'employee');
        document.getElementById("user-badge").textContent = currentUser.role;
        
        // Reset view back to Kanban Board upon role switching context
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        document.querySelector('[data-target="kanban-view"]').classList.add("active");
        document.querySelectorAll(".view-section").forEach(v => v.classList.add("hidden"));
        document.getElementById("kanban-view").classList.remove("hidden");

        loadDashboardData();
    });
}

async function loadDashboardData() {
    document.getElementById("todo-tasks").innerHTML = "";
    document.getElementById("inprogress-tasks").innerHTML = "";
    document.getElementById("completed-tasks").innerHTML = "";

    const response = await fetch(`/api/tasks?username=${currentUser.username}&role=${currentUser.role}`);
    const tasks = await response.json();

    // Metrics Objects for Analytics computation mapping
    const phasesCount = { Requirements: 0, Design: 0, Development: 0, Testing: 0, Deployment: 0 };
    const teamAllocation = {};

    tasks.forEach(task => {
        // Collect analytical counts
        if (phasesCount[task.phase] !== undefined) phasesCount[task.phase]++;
        
        // Collect workload data mappings
        const owner = task.assigned_to || 'Unassigned';
        if (!teamAllocation[owner]) {
            teamAllocation[owner] = { total: 0, todo: 0, inprogress: 0, completed: 0 };
        }
        teamAllocation[owner].total++;
        if (task.status === "To Do") teamAllocation[owner].todo++;
        if (task.status === "In Progress") teamAllocation[owner].inprogress++;
        if (task.status === "Completed") teamAllocation[owner].completed++;

        // Render card node elements
        const card = document.createElement("div");
        card.className = "task-card";
        card.id = `task-${task.id}`;
        card.dataset.taskData = JSON.stringify(task);

        if (currentUser.role === "Project Manager") {
            card.draggable = true;
            card.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", task.id);
            });
        }

        card.innerHTML = `
            <div class="sdlc-tag" data-phase="${task.phase}">${task.phase}</div>
            <h4>${task.title}</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">👤 Owner: ${task.assigned_to || 'Unassigned'}</p>
        `;

        card.addEventListener("click", () => openTaskModal(task));

        if (task.status === "To Do") document.getElementById("todo-tasks").appendChild(card);
        if (task.status === "In Progress") document.getElementById("inprogress-tasks").appendChild(card);
        if (task.status === "Completed") document.getElementById("completed-tasks").appendChild(card);
    });

    updateMetricsAndCounters();
    populateAnalyticsAndTeamViews(phasesCount, teamAllocation);
}

function openTaskModal(task) {
    const modal = document.getElementById("task-modal");
    modal.dataset.editingId = task.id;
    modal.classList.remove("hidden");

    document.getElementById("modal-headline-title").textContent = task.id ? "Edit Task Context" : "Create New Task Node";
    document.getElementById("task-name").value = task.title || "";
    document.getElementById("task-phase").value = task.phase || "Requirements";
    document.getElementById("task-status").value = task.status || "To Do";
    document.getElementById("task-assignee").value = task.assigned_to || "Unassigned";
}

function setupFormSubmission() {
    document.getElementById("add-task-btn").addEventListener("click", () => {
        openTaskModal({ id: null, title: "", phase: "Requirements", status: "To Do", assigned_to: "Unassigned" });
    });

    document.getElementById("task-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const modal = document.getElementById("task-modal");
        const taskId = modal.dataset.editingId;

        // FIXED payload mapping: using 'status' field key to align with database column target definitions
        const payload = {
            title: document.getElementById("task-name").value,
            phase: document.getElementById("task-phase").value,
            status: document.getElementById("task-status").value,
            assigned_to: document.getElementById("task-assignee").value,
            userRole: currentUser.role
        };

        const isUpdate = taskId && taskId !== "null";
        await fetch(isUpdate ? `/api/tasks/${taskId}` : '/api/tasks', {
            method: isUpdate ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        modal.classList.add("hidden");
        loadDashboardData();
    });
}

function setupDragAndDrop() {
    document.querySelectorAll(".task-list").forEach(list => {
        list.addEventListener("dragenter", () => currentUser.role === "Project Manager" && list.classList.add("drag-over"));
        list.addEventListener("dragleave", (e) => e.target === list && list.classList.remove("drag-over"));
        list.addEventListener("dragover", (e) => currentUser.role === "Project Manager" && e.preventDefault());

        list.addEventListener("drop", async (e) => {
            if (currentUser.role !== "Project Manager") return;
            e.preventDefault();
            list.classList.remove("drag-over");
            
            const taskId = e.dataTransfer.getData("text/plain");
            const targetStatus = list.parentElement.getAttribute("data-status");
            const cardNode = document.getElementById(`task-${taskId}`);
            if (!cardNode) return;
            const cardData = JSON.parse(cardNode.dataset.taskData);

            await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cardData, status: targetStatus, userRole: currentUser.role })
            });
            loadDashboardData();
        });
    });
}

function updateMetricsAndCounters() {
    let total = 0, completed = 0;
    document.querySelectorAll(".kanban-column").forEach(col => {
        const count = col.querySelectorAll(".task-card").length;
        col.querySelector(".count-badge").textContent = count;
        total += count;
        if (col.getAttribute("data-status") === "Completed") completed = count;
    });

    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById("dashboard-progress-bar").style.width = `${pct}%`;
    document.getElementById("progress-percentage-text").textContent = `${pct}%`;
}

// Populate structural metric cards dynamically
function populateAnalyticsAndTeamViews(phases, team) {
    document.getElementById("stat-req").textContent = phases.Requirements;
    document.getElementById("stat-design").textContent = phases.Design;
    document.getElementById("stat-dev").textContent = phases.Development;
    document.getElementById("stat-test").textContent = phases.Testing;
    document.getElementById("stat-deploy").textContent = phases.Deployment;

    const tableBody = document.getElementById("team-table-body");
    tableBody.innerHTML = "";

    Object.keys(team).forEach(member => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${member}</strong></td>
            <td><span class="count-badge">${team[member].total} Total Tasks</span></td>
            <td>
                <span style="color:#eab308"> ToDo: ${team[member].todo}</span> | 
                <span style="color:#38bdf8"> InProgress: ${team[member].inprogress}</span> | 
                <span style="color:#22c55e"> Done: ${team[member].completed}</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}