// --- MOBILE SIDEBAR LOGIC ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Close sidebar when clicking a lesson (Mobile UX)
function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// --- NAVIGATION LOGIC ---
function goToCategory() { switchView('view-landing', 'view-category'); }
function goToLanguages() { switchView('view-category', 'view-languages'); }

function enterCourse(langId) {
    document.getElementById('current-lang-display').innerText = langId.toUpperCase();
    loadSelectedCourse(langId);
    switchView('view-languages', 'view-content');
}

function switchView(hideId, showId) {
    const hideEl = document.getElementById(hideId);
    const showEl = document.getElementById(showId);
    hideEl.style.opacity = '0';
    setTimeout(() => {
        hideEl.classList.remove('active-view');
        hideEl.classList.add('hidden-view');
        hideEl.style.display = 'none';
        showEl.style.display = 'flex';
        showEl.classList.remove('hidden-view');
        showEl.classList.add('active-view');
        setTimeout(() => { showEl.style.opacity = '1'; }, 50);
    }, 500); // Faster transition for mobile
}

// --- COURSE LOADER ---
async function loadSelectedCourse(courseId) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = "<p style='color:#666; padding:10px'>Deciphering...</p>";
    const configPath = `courses/${courseId}/config.json?v=${new Date().getTime()}`;

    try {
        const response = await fetch(configPath);
        if(!response.ok) throw new Error();
        const data = await response.json();
        renderSidebar(data);
    } catch (error) {
        sidebar.innerHTML = `<p style="color:#d4af37; padding:10px">Artifact Missing.</p>`;
    }
}

function renderSidebar(data) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = ""; 

    data.topics.forEach(topic => {
        const details = document.createElement('details');
        details.open = true; // Keep open on desktop
        const summary = document.createElement('summary');
        summary.innerText = topic.title;
        details.appendChild(summary);

        topic.files.forEach(file => {
            const btn = document.createElement('button');
            btn.className = 'lesson-btn';
            btn.innerText = file.title;
            const fullPath = `${data.base_path}/${topic.folder}/${file.filename}`;
            
            btn.onclick = () => {
                loadLesson(fullPath);
                closeSidebarOnMobile(); // Auto-close menu on phone
            };
            details.appendChild(btn);
        });
        sidebar.appendChild(details);
    });
}

async function loadLesson(path) {
    const content = document.getElementById('content-area');
    content.innerHTML = "<h3 style='color:#666'>Loading...</h3>";
    const cleanPath = path.replace(/\/+/g, '/');
    try {
        const resp = await fetch(`${cleanPath}?v=${new Date().getTime()}`);
        if (!resp.ok) throw new Error();
        const html = await resp.text();
        if (html.includes("<!DOCTYPE html>")) throw new Error("404");
        content.innerHTML = html;
        // Scroll to top on mobile
        content.scrollTop = 0;
    } catch (error) {
        content.innerHTML = `<p style="color:#d4af37; border:1px dashed #d4af37; padding:20px">Fragment Missing: ${cleanPath}</p>`;
    }
}