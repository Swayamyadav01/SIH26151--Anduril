function renderPersonas(container) {
    const actors = appState.data.actors;
    container.innerHTML = `
        <div class="flex items-center justify-between mb-5"><h1 class="text-xl font-semibold">Personas</h1><span class="badge badge-gray">${actors.length} actors</span></div>
        <div class="stat-card !p-0">
            <div class="flex flex-wrap gap-3 p-4 border-b border-border-color">
                <input id="persona-search" aria-label="Search personas" class="flex-1 min-w-0 bg-surface-secondary border border-border-color rounded-lg px-3 py-2 text-sm" placeholder="Search handle, alias, wallet, or PGP">
                <select id="risk-filter" aria-label="Threat level" class="bg-surface border border-border-color rounded-lg px-3 py-2 text-sm"><option value="">All threat levels</option><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
            </div>
            <div class="overflow-x-auto"><table class="data-table"><thead><tr><th>Actor</th><th>Aliases</th><th>Threat</th><th>Confidence</th><th>Last active</th><th>Actions</th></tr></thead><tbody id="personas-tbody"></tbody></table></div>
        </div>
        <dialog id="persona-modal" aria-labelledby="persona-modal-title"></dialog>`;
    function filter() {
        const query = container.querySelector('#persona-search').value.trim().toLowerCase();
        const risk = container.querySelector('#risk-filter').value;
        const matches = actors.filter(a => (!risk || a.threat_level === risk) && [a.primary_handle,a.id,
            ...a.handles.map(h=>h.handle),...a.crypto_wallets.map(w=>w.address),...a.pgp_fingerprints].join(' ').toLowerCase().includes(query));
        container.querySelector('#personas-tbody').innerHTML = matches.length ? matches.map(a=>`<tr>
            <td class="font-semibold" title="${escapeHTML(a.primary_handle)}">${escapeHTML(a.primary_handle)}</td>
            <td title="${escapeHTML(a.handles.map(h=>h.handle).join(', '))}">${a.handles.length} aliases</td>
            <td>${getRiskBadge(a.threat_level)}</td><td>${a.attribution_confidence}%</td>
            <td>${a.last_active ? new Date(a.last_active).toLocaleDateString() : '—'}</td>
            <td><button class="btn-secondary text-xs" data-actor="${escapeHTML(a.id)}">View</button></td></tr>`).join('') : '<tr><td colspan="6">No matching personas.</td></tr>';
    }
    container.querySelector('#persona-search').oninput = filter;
    container.querySelector('#risk-filter').onchange = filter;
    container.querySelector('#personas-tbody').onclick = e => {
        const button = e.target.closest('[data-actor]');
        if (button) openPersonaDetail(button.dataset.actor);
    };
    filter();
    if (appState.selection?.actor) openPersonaDetail(appState.selection.actor);
}
function getRiskBadge(level) {
    return `<span class="badge ${['HIGH','CRITICAL'].includes(level) ? 'badge-high' : level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}">${escapeHTML(level || 'Unknown')}</span>`;
}
function openPersonaDetail(actorId) {
    const actor = appState.data.actors.find(a=>a.id===actorId);
    const modal = document.getElementById('persona-modal');
    if (!actor || !modal) return;
    const services = appState.data.infrastructure.filter(s=>s.associated_actor_id===actorId);
    const entity = actor.suspect_real_entity || {};
    const list = items => items.length ? `<ul>${items.map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>` : '<p class="text-xs text-text-muted">None recorded</p>';
    modal.innerHTML = `
        <div class="flex flex-wrap gap-3 items-center justify-between p-5 border-b border-border-color">
            <div><h2 id="persona-modal-title" class="text-xl font-semibold">${escapeHTML(actor.primary_handle)}</h2><p class="text-xs text-text-muted mt-1">${escapeHTML(actor.id)} · ${escapeHTML(actor.category)}</p></div>
            <div class="flex gap-2"><button id="persona-export" class="btn-secondary text-xs"><i class="fa-solid fa-download"></i>Export evidence</button><button id="persona-close" class="btn-secondary" aria-label="Close dossier"><i class="fa-solid fa-xmark"></i></button></div>
        </div>
        <div class="persona-details">
            <section><h3>Attribution</h3><dl class="dossier-fields">${[
                ['Threat',actor.threat_level],['Confidence',actor.attribution_confidence+'%'],['Origin IP',entity.clearnet_ip],['ISP',entity.isp],['Location',entity.location],['Evidence',entity.exposed_via]
            ].map(([key,value])=>`<div><dt>${key}</dt><dd>${escapeHTML(value || 'Not recorded')}</dd></div>`).join('')}</dl></section>
            <section><h3>Aliases</h3>${list(actor.handles.map(h=>`${h.platform} · ${h.handle}`))}</section>
            <section><h3>Identifiers</h3>${list([...actor.pgp_fingerprints.map(p=>'PGP · '+p),...actor.crypto_wallets.map(w=>w.currency+' · '+w.address)])}</section>
            <section><h3>Services</h3>${services.length ? services.map((s,i)=>`<div class="mb-3"><p class="text-xs break-all mb-2">${escapeHTML(s.onion_address)}</p><button class="btn-secondary text-xs" data-service-index="${i}">Inspect service</button></div>`).join('') : '<p class="text-xs text-text-muted">None recorded</p>'}</section>
        </div>`;
    modal.querySelector('#persona-close').onclick = closePersonaModal;
    modal.querySelector('#persona-export').onclick = () => downloadArtifact(`anduril-${actor.id}-evidence.json`,JSON.stringify({actor,services},null,2));
    modal.querySelectorAll('[data-service-index]').forEach(button=>button.onclick=()=>{
        const service = services[Number(button.dataset.serviceIndex)];
        closePersonaModal(); navigateTo('services',{service:service.onion_address});
    });
    modal.onclick = e => { if(e.target===modal) {const r=modal.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) closePersonaModal();} };
    if (!modal.open) modal.showModal();
}
function closePersonaModal() { document.getElementById('persona-modal')?.close(); }
