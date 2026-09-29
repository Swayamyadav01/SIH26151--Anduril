function renderDiscover(container) {
    const records = [
        ...appState.data.actors.map(a=>({title:a.primary_handle, sub:a.category, kind:'Actor', terms:[a.primary_handle,a.category,a.id,...a.handles.map(h=>h.handle),...a.crypto_wallets.map(w=>w.address),...a.pgp_fingerprints].join(' '),view:'personas',selection:{actor:a.id}})),
        ...appState.data.infrastructure.map(s=>({title:s.service_name,sub:s.onion_address,kind:'Service',terms:[s.service_name,s.onion_address,s.origin_attribution?.clearnet_ip].join(' '),view:'services',selection:{service:s.onion_address}}))
    ];
    container.innerHTML = `<h1 class="text-xl font-semibold mb-5">Discover</h1>
        <div class="stat-card mb-5"><input id="discover-search" aria-label="Search intelligence" class="w-full bg-surface-secondary border border-border-color rounded-lg px-4 py-3 text-sm" placeholder="Search actors, aliases, IPs, or services"></div>
        <p id="discover-count" class="text-xs text-text-muted mb-3" role="status"></p>
        <div id="discover-results" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"></div>`;
    let matches=[];
    const search=()=>{
        const query=container.querySelector('#discover-search').value.trim().toLowerCase();
        matches=records.filter(r=>r.terms.toLowerCase().includes(query));
        container.querySelector('#discover-count').textContent=`${matches.length} results`;
        container.querySelector('#discover-results').innerHTML=matches.length ? matches.map((r,i)=>`<div class="stat-card flex flex-col gap-3"><span class="text-xs text-text-muted">${r.kind}</span><h2 class="font-semibold text-sm">${escapeHTML(r.title)}</h2><p class="text-xs text-text-muted break-all flex-1">${escapeHTML(r.sub)}</p><button class="btn-secondary self-start text-xs" data-result="${i}">Open dossier <i class="fa-solid fa-arrow-right"></i></button></div>`).join('') : '<p class="text-sm text-text-muted">No matching records.</p>';
    };
    container.querySelector('#discover-search').oninput=search;
    container.querySelector('#discover-results').onclick=e=>{
        const button=e.target.closest('[data-result]');
        if(button) {const r=matches[Number(button.dataset.result)];navigateTo(r.view,r.selection);}
    };
    search();
}
