function renderReports(container) {
    const actors=appState.data.actors;
    container.innerHTML=`<div class="flex flex-wrap items-center justify-between gap-3 mb-5"><h1 class="text-xl font-semibold">Reports</h1>
        <div id="report-actions" class="flex flex-wrap gap-2"><button id="btn-download-csv" class="btn-secondary text-xs">Download CSV</button><button id="btn-download-json" class="btn-secondary text-xs">Download JSON</button><button id="btn-print-report" class="btn-primary text-xs"><i class="fa-solid fa-print"></i>Print / PDF</button></div></div>
        <section id="report-preview" class="stat-card"><div class="flex justify-between gap-3 items-center mb-5"><div><p class="eyebrow mb-1">ANDURIL</p><h2 class="font-semibold">Actor intelligence brief</h2></div><span class="text-xs text-text-muted">${actors.length} records · ${new Date().toLocaleDateString()}</span></div>
        <div class="overflow-x-auto"><table class="data-table"><thead><tr><th>Actor</th><th>Threat</th><th>Confidence</th><th>Origin IP</th><th>Location</th></tr></thead><tbody>${actors.map(a=>`<tr><td title="${escapeHTML(a.primary_handle)}">${escapeHTML(a.primary_handle)}</td><td>${escapeHTML(a.threat_level)}</td><td>${a.attribution_confidence}%</td><td>${escapeHTML(a.suspect_real_entity?.clearnet_ip || '—')}</td><td title="${escapeHTML(a.suspect_real_entity?.location)}">${escapeHTML(a.suspect_real_entity?.location || '—')}</td></tr>`).join('')}</tbody></table></div></section>`;
    container.querySelector('#btn-download-csv').onclick=()=>{
        const headers=['ID','Handle','Category','Threat Level','Confidence','Origin IP','Location'];
        const rows=actors.map(a=>[a.id,a.primary_handle,a.category,a.threat_level,a.attribution_confidence,a.suspect_real_entity?.clearnet_ip,a.suspect_real_entity?.location]);
        const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\r\n');
        downloadArtifact('anduril-actors.csv',csv,'text/csv;charset=utf-8');
    };
    container.querySelector('#btn-download-json').onclick=()=>downloadArtifact('anduril-actors.json',JSON.stringify(actors,null,2));
    container.querySelector('#btn-print-report').onclick=()=>window.print();
}
