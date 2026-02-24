function switchView(hideId, showId) {
    const hideView = document.getElementById(hideId);
    const showView = document.getElementById(showId);

    hideView.classList.add('hidden');
    setTimeout(() => {
        hideView.style.display = 'none';
        showView.style.display = 'flex';
        if(showId === 'view-content') showView.style.display = 'block';
        setTimeout(() => showView.classList.remove('hidden'), 50);
    }, 400);
}

function goToCategory() { switchView('view-landing', 'view-category'); }
function goToLanguages() { switchView('view-category', 'view-languages'); }

function enterCourse(lang) {
    document.getElementById('current-lang').innerText = lang.toUpperCase();
    switchView('view-languages', 'view-content');
    loadSidebar(lang);
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('active-sidebar');
}

// Logic for your content loading goes here
function loadSidebar(lang) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `<div class="sidebar-item">Loading ${lang} modules...</div>`;
}
