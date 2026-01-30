// --- NAVIGATION LOGIC ---

function goToCategory() {
    switchView('view-landing', 'view-category');
}

function goToLanguages() {
    switchView('view-category', 'view-languages');
}

function enterCourse(langId) {
    console.log("Entering course:", langId);
    
    // 1. Update UI Title
    document.getElementById('current-lang-display').innerText = langId.toUpperCase();
    
    // 2. Load the actual course data
    loadSelectedCourse(langId);

    // 3. Show Main Screen
    switchView('view-languages', 'view-content');
}

// Helper to handle fade transitions
function switchView(hideId, showId) {
    const hideEl = document.getElementById(hideId);
    const showEl = document.getElementById(showId);

    // Fade Out
    hideEl.style.opacity = '0';
    
    setTimeout(() => {
        // Hide completely
        hideEl.classList.remove('active-view');
        hideEl.classList.add('hidden-view');
        hideEl.style.display = 'none'; // Force hide
        
        // Prepare to show
        showEl.style.display = 'flex'; // Force show
        showEl.classList.remove('hidden-view');
        showEl.classList.add('active-view');
        
        // Trigger Fade In
        // Tiny timeout to ensure display:flex applies before opacity change
        setTimeout(() => {
            showEl.style.opacity = '1';
        }, 50);
        
    }, 800); // 800ms wait for fade out
}

// --- COURSE LOADER LOGIC ---
async function loadSelectedCourse(courseId) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = "<p style='color:#666'>Deciphering...</p>";

    // IMPORTANT: Make sure this path exists in your folder!
    const configPath = `courses/${courseId}/config.json`;

    try {
        const response = await fetch(configPath);
        if(!response.ok) throw new Error("Config not found");
        
        const data = await response.json();
        renderSidebar(data);
    } catch (error) {
        sidebar.innerHTML = `
            <p style="color:#d4af37; font-family:'Cinzel'">
                The ${courseId.toUpperCase()} artifact is missing.
            </p>
            <small style="color:#444">
                (Please create courses/${courseId}/config.json)
            </small>
        `;
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
            // Path Construction
            const fullPath = `${data.base_path}/${topic.folder}/${file.filename}`;
            btn.onclick = () => loadLesson(fullPath);
            details.appendChild(btn);
        });
        sidebar.appendChild(details);
    });
}

async function loadLesson(path) {
    const content = document.getElementById('content-area');
    content.innerHTML = "<h3 style='color:#666'>Loading...</h3>";
    try {
        const resp = await fetch(path);
        if(!resp.ok) throw new Error();
        content.innerHTML = await resp.text();
    } catch (error) {
        content.innerHTML = "<p style='color:red'>Fragment missing.</p>";
    }
}