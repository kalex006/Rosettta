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

    // --- VIEW LOGIC ---
    switchView(targetKey) {
        Object.values(this.views).forEach(v => {
            v.classList.add('hidden-view');
            v.classList.remove('active-view');
        });
        const target = this.views[targetKey];
        target.classList.remove('hidden-view');
        target.classList.add('active-view');
        this.sidebar.classList.remove('mobile-open');
    },

    // --- DATA ENGINE ---
    async loadCourse(id) {
        this.sidebar.innerHTML = "<p>Loading Archives...</p>";
        this.langDisplay.innerText = id.toUpperCase();

        try {
            const resp = await fetch(`courses/${id}/config.json?v=${Date.now()}`);
            if(!resp.ok) throw new Error();
            const data = await resp.json();
            this.renderSidebar(data);
        } catch (e) {
            this.sidebar.innerHTML = "<p style='color:red'>Vault Error</p>";
        }
    },

    renderSidebar(data) {
        this.sidebar.innerHTML = "";
        data.topics.forEach(topic => {
            const det = document.createElement('details');
            det.open = true;
            const sum = document.createElement('summary');
            sum.innerText = topic.title;
            det.appendChild(sum);

            topic.files.forEach(file => {
                const btn = document.createElement('button');
                btn.className = 'lesson-btn';
                btn.innerText = file.title;
                const path = `${data.base_path}/${topic.folder}/${file.filename}`.replace(/\/+/g, '/');
                btn.onclick = () => {
                    this.loadLesson(path);
                    if(window.innerWidth < 900) this.sidebar.classList.remove('mobile-open');
                };
                det.appendChild(btn);
            });
            this.sidebar.appendChild(det);
        });
    },

    async loadLesson(path) {
        this.contentArea.innerHTML = "<p>Deciphering...</p>";
        try {
            const resp = await fetch(`${path}?v=${Date.now()}`);
            const html = await resp.text();
            this.contentArea.innerHTML = html;
            this.contentArea.scrollTo(0,0);
        } catch (e) {
            this.contentArea.innerHTML = "<h2>Fragment Missing</h2>";
        }
    }
};

// Global Bridge
function goToCategory() { Rosetta.switchView('category'); }
function goToLanguages() { Rosetta.switchView('languages'); }
function toggleSidebar() { Rosetta.sidebar.classList.toggle('mobile-open'); }
function enterCourse(id) { Rosetta.loadCourse(id); Rosetta.switchView('content'); }
