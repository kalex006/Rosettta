/**
 * ROSETTA ENGINE v2.0
 * Pure Vanilla Logic | Zero-Backend Architecture
 */

const Rosetta = {
    // --- UI REGISTRY ---
    views: {
        landing: document.getElementById('view-landing'),
        category: document.getElementById('view-category'),
        languages: document.getElementById('view-languages'),
        content: document.getElementById('view-content')
    },
    sidebar: document.getElementById('sidebar'),
    contentArea: document.getElementById('content-area'),
    langDisplay: document.getElementById('current-lang-display'),

    // --- VIEW CONTROLLER ---
    switchView(targetKey) {
        // Hide all views
        Object.values(this.views).forEach(view => {
            view.classList.remove('active-view');
            view.classList.add('hidden-view');
        });

        // Show target view
        const target = this.views[targetKey];
        target.classList.remove('hidden-view');
        target.classList.add('active-view');
        
        // Ensure sidebar closes on view change (Mobile)
        this.sidebar.classList.remove('mobile-open');
    },

    // --- MOBILE INTERFACE ---
    toggleSidebar() {
        this.sidebar.classList.toggle('mobile-open');
    },

    // --- DATA PIPELINE ---
    async loadCourse(courseId) {
        this.sidebar.innerHTML = `<div class="loader-text">Decrypting ${courseId}...</div>`;
        this.langDisplay.innerText = courseId.toUpperCase();

        const configPath = `courses/${courseId}/config.json?t=${Date.now()}`;

        try {
            const response = await fetch(configPath);
            if (!response.ok) throw new Error("Artifact Configuration Missing");
            
            const data = await response.json();
            this.renderSidebar(data);
        } catch (error) {
            this.sidebar.innerHTML = `<div class="error-msg">Failed to load ${courseId}</div>`;
            console.error("Architectural Error:", error);
        }
    },

    renderSidebar(data) {
        this.sidebar.innerHTML = ""; // Clear loader
        
        const fragment = document.createDocumentFragment();

        data.topics.forEach(topic => {
            const details = document.createElement('details');
            details.open = true;
            
            const summary = document.createElement('summary');
            summary.innerText = topic.title;
            
            details.appendChild(summary);

            topic.files.forEach(file => {
                const btn = document.createElement('button');
                btn.className = 'lesson-btn';
                btn.innerText = file.title;

                // Build path: base/folder/file
                const path = `${data.base_path}/${topic.folder}/${file.filename}`.replace(/\/+/g, '/');
                
                btn.onclick = () => {
                    this.loadLesson(path);
                    // Close sidebar on click for mobile users
                    if (window.innerWidth < 900) this.toggleSidebar();
                };
                
                details.appendChild(btn);
            });

            fragment.appendChild(details);
        });

        this.sidebar.appendChild(fragment);
    },

    async loadLesson(path) {
        this.contentArea.innerHTML = `<div class="loader-text">Unrolling Scroll...</div>`;

        try {
            const response = await fetch(`${path}?t=${Date.now()}`);
            if (!response.ok) throw new Error("Lesson Fragment Not Found");

            const html = await response.text();
            
            // Security Check: Block raw HTML 404 responses from GitHub
            if (html.includes("<!DOCTYPE html>") && html.includes("404")) {
                throw new Error("Target artifact does not exist on server.");
            }

            this.contentArea.innerHTML = html;
            this.contentArea.scrollTo(0, 0); // Reset scroll position

        } catch (error) {
            this.contentArea.innerHTML = `
                <div class="error-box">
                    <h2 class="artifact-title">Fragment Missing</h2>
                    <p>The neural link to this artifact is broken.</p>
                    <code>Path: ${path}</code>
                </div>`;
        }
    }
};

// --- GLOBAL BRIDGE (Direct HTML Callbacks) ---
function goToCategory() { Rosetta.switchView('category'); }
function goToLanguages() { Rosetta.switchView('languages'); }
function toggleSidebar() { Rosetta.toggleSidebar(); }
function enterCourse(id) { 
    Rosetta.loadCourse(id); 
    Rosetta.switchView('content'); 
}

// Initializing event listeners for better device support
window.addEventListener('load', () => {
    console.log("ROSETTA CORE INITIALIZED");
});
