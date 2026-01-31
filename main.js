// --- NAVIGATION LOGIC ---
function goToCategory() { switchView('view-landing', 'view-category'); }
function goToLanguages() { switchView('view-category', 'view-languages'); }

function enterCourse(langId) {
    console.log("Entering course:", langId);
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
    }, 800);
}

// --- COURSE LOADER LOGIC ---
async function loadSelectedCourse(courseId) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = "<p style='color:#666'>Deciphering...</p>";

    // FIX: Added timestamp to bypass browser cache for config.json
    const configPath = `courses/${courseId}/config.json?v=${new Date().getTime()}`;

    try {
        const response = await fetch(configPath);
        if(!response.ok) throw new Error(`Config not found at ${configPath}`);
        
        const data = await response.json();
        renderSidebar(data);
    } catch (error) {
        console.error("Course Load Error:", error);
        sidebar.innerHTML = `<p style="color:#d4af37;">Artifact ${courseId} missing.</p>`;
    }
}

function renderSidebar(data) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = ""; 

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

            // FIX: Robust path construction
            const fullPath = `${data.base_path}/${topic.folder}/${file.filename}`;
            btn.onclick = () => loadLesson(fullPath);
            details.appendChild(btn);
        });
        sidebar.appendChild(details);
    });
}

async function loadLesson(path) {
    const content = document.getElementById('content-area');
    content.innerHTML = "<h3 style='color:#666'>Unrolling Scroll...</h3>";

    // 1. CLEAN THE PATH: Remove any accidental double slashes
    // This ensures 'lessons//topic-1' becomes 'lessons/topic-1'
    const cleanPath = path.replace(/\/+/g, '/');

    try {
        // 2. FETCH with Cache Buster
        const fetchUrl = `${cleanPath}?v=${new Date().getTime()}`;
        console.log("Fetching from:", fetchUrl); // Check this in F12 Console!

        const resp = await fetch(fetchUrl);
        
        if (!resp.ok) {
            throw new Error(`Server responded with ${resp.status}: ${resp.statusText}`);
        }
        
        const html = await resp.text();

        // 3. VALIDATION: Ensure we didn't just get a 404 page text
        if (html.includes("<!DOCTYPE html>") && html.includes("404")) {
             throw new Error("File not found (GitHub 404 page returned)");
        }

        content.innerHTML = html;

    } catch (error) {
        console.error("Critical Load Error:", error);
        content.innerHTML = `
            <div style="padding: 20px; border: 1px dashed #d4af37; color: #ff4d4d;">
                <h3 style="font-family: 'Cinzel'">Fragment Missing</h3>
                <p style="font-size: 0.8rem; color: #888;">The path provided was invalid or the file does not exist on the server.</p>
                <code style="background: #1a1a1a; padding: 5px; display: block;">${cleanPath}</code>
            </div>
        `;
    }
}