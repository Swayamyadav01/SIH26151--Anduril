function renderReports(container) {
    const actors = appState.data.actors || [];
    let selectedIds = new Set(actors.map(a => a.id));

    function getSelectedActors() {
        const selected = actors.filter(a => selectedIds.has(a.id));
        return selected.length > 0 ? selected : actors;
    }

    function updateSelectionUI() {
        const count = selectedIds.size;
        const total = actors.length;
        const countBadge = container.querySelector('#selected-count-badge');
        if (countBadge) {
            countBadge.textContent = `${count} of ${total} selected`;
        }

        const masterCb = container.querySelector('#select-all-actors');
        if (masterCb) {
            masterCb.checked = count === total && total > 0;
            masterCb.indeterminate = count > 0 && count < total;
        }

        const btnCsv = container.querySelector('#btn-download-csv');
        if (btnCsv) btnCsv.innerHTML = `<i class="fa-solid fa-file-csv mr-1.5 text-teal-500"></i>Download CSV (${count})`;

        const btnPdf = container.querySelector('#btn-download-pdf');
        if (btnPdf) btnPdf.innerHTML = `<i class="fa-solid fa-file-pdf mr-1.5 text-rose-500"></i>Download PDF (${count})`;

        const btnJson = container.querySelector('#btn-download-json');
        if (btnJson) btnJson.innerHTML = `<i class="fa-solid fa-code mr-1.5 text-blue-500"></i>Download JSON (${count})`;

        container.querySelectorAll('tbody tr[data-actor-id]').forEach(tr => {
            const id = tr.getAttribute('data-actor-id');
            const cb = tr.querySelector('.actor-select-cb');
            const isSelected = selectedIds.has(id);
            if (cb) cb.checked = isSelected;
            tr.classList.toggle('bg-teal-500/10', isSelected);
            tr.classList.toggle('dark:bg-teal-950/20', isSelected);
        });
    }

    container.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
                <h1 class="text-xl font-semibold">Reports</h1>
                <p class="text-xs text-text-muted mt-0.5">Select specific threat actors below to generate customized CSV or PDF dossiers</p>
            </div>
            <div id="report-actions" class="flex flex-wrap items-center gap-2">
                <span id="selected-count-badge" class="text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                    ${selectedIds.size} of ${actors.length} selected
                </span>
                <button id="btn-toggle-all" class="btn-secondary text-xs" title="Select or Deselect All">
                    Toggle All
                </button>
                <button id="btn-download-csv" class="btn-secondary text-xs" title="Export CSV of selected actors">
                    <i class="fa-solid fa-file-csv mr-1.5 text-teal-500"></i>Download CSV (${selectedIds.size})
                </button>
                <button id="btn-download-pdf" class="btn-secondary text-xs font-medium" title="Generate and download PDF of selected actors">
                    <i class="fa-solid fa-file-pdf mr-1.5 text-rose-500"></i>Download PDF (${selectedIds.size})
                </button>
                <button id="btn-download-json" class="btn-secondary text-xs" title="Export JSON of selected actors">
                    <i class="fa-solid fa-code mr-1.5 text-blue-500"></i>Download JSON (${selectedIds.size})
                </button>
                <button id="btn-print-report" class="btn-primary text-xs" title="Print or Save to PDF">
                    <i class="fa-solid fa-print mr-1.5"></i>Print / PDF
                </button>
            </div>
        </div>

        <section id="report-preview" class="stat-card">
            <div class="flex flex-wrap justify-between gap-3 items-center mb-5 pb-3 border-b border-border-color">
                <div>
                    <p class="eyebrow mb-1">ANDURIL FORENSICS</p>
                    <h2 class="font-semibold text-base">Customized Actor Intelligence Brief</h2>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-text-muted">${actors.length} cataloged entities · ${new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="w-10 text-center">
                                <input type="checkbox" id="select-all-actors" class="cursor-pointer rounded border-border-color text-teal-600 focus:ring-teal-500" checked title="Select / Deselect All">
                            </th>
                            <th>Actor</th>
                            <th>Category</th>
                            <th>Threat Level</th>
                            <th>Confidence</th>
                            <th>Origin IP</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${actors.map(a => `
                            <tr data-actor-id="${a.id}" class="cursor-pointer transition-colors duration-150 bg-teal-500/10 dark:bg-teal-950/20">
                                <td class="text-center" onclick="event.stopPropagation()">
                                    <input type="checkbox" class="actor-select-cb cursor-pointer rounded border-border-color text-teal-600 focus:ring-teal-500" data-id="${a.id}" checked>
                                </td>
                                <td class="font-medium" title="${escapeHTML(a.primary_handle)}">
                                    <span class="inline-block w-2 h-2 rounded-full mr-2 ${a.threat_level === 'CRITICAL' ? 'bg-rose-500' : a.threat_level === 'HIGH' ? 'bg-amber-500' : 'bg-teal-500'}"></span>
                                    ${escapeHTML(a.primary_handle)}
                                </td>
                                <td class="text-xs text-text-muted" title="${escapeHTML(a.category)}">
                                    ${escapeHTML(a.category)}
                                </td>
                                <td>
                                    <span class="badge ${a.threat_level === 'CRITICAL' ? 'badge-high' : a.threat_level === 'HIGH' ? 'badge-med' : 'badge-low'}">
                                        ${escapeHTML(a.threat_level)}
                                    </span>
                                </td>
                                <td class="font-mono text-xs font-semibold">
                                    ${a.attribution_confidence}%
                                </td>
                                <td class="font-mono text-xs font-medium text-teal-700 dark:text-teal-400" title="${escapeHTML(a.suspect_real_entity?.clearnet_ip || '—')}">
                                    ${escapeHTML(a.suspect_real_entity?.clearnet_ip || '—')}
                                </td>
                                <td class="text-xs text-text-muted" title="${escapeHTML(a.suspect_real_entity?.location || '—')}">
                                    ${escapeHTML(a.suspect_real_entity?.location || '—')}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </section>
    `;

    // Row click selection
    container.querySelectorAll('tbody tr[data-actor-id]').forEach(tr => {
        const id = tr.getAttribute('data-actor-id');
        tr.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return;
            if (selectedIds.has(id)) {
                selectedIds.delete(id);
            } else {
                selectedIds.add(id);
            }
            updateSelectionUI();
        });
    });

    // Individual checkbox selection
    container.querySelectorAll('.actor-select-cb').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            if (e.target.checked) {
                selectedIds.add(id);
            } else {
                selectedIds.delete(id);
            }
            updateSelectionUI();
        });
    });

    // Master select all / deselect all
    const masterCb = container.querySelector('#select-all-actors');
    if (masterCb) {
        masterCb.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedIds = new Set(actors.map(a => a.id));
            } else {
                selectedIds.clear();
            }
            updateSelectionUI();
        });
    }

    // Toggle button
    const btnToggle = container.querySelector('#btn-toggle-all');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            if (selectedIds.size === actors.length) {
                selectedIds.clear();
            } else {
                selectedIds = new Set(actors.map(a => a.id));
            }
            updateSelectionUI();
        });
    }

    // Download CSV of Selected Actors
    container.querySelector('#btn-download-csv').onclick = () => {
        const targetActors = getSelectedActors();
        const headers = ['ID', 'Handle', 'Category', 'Threat Level', 'Confidence', 'Origin IP', 'Location', 'Wallets', 'Infrastructure'];
        const rows = targetActors.map(a => [
            a.id,
            a.primary_handle,
            a.category,
            a.threat_level,
            a.attribution_confidence,
            a.suspect_real_entity?.clearnet_ip,
            a.suspect_real_entity?.location,
            (a.crypto_wallets || []).map(w => `${w.currency}:${w.address}`).join('; '),
            (a.infrastructure || []).join('; ')
        ]);
        const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
        const fname = targetActors.length === actors.length ? 'anduril-actors.csv' : `anduril-selected-actors-${targetActors.length}.csv`;
        downloadArtifact(fname, csv, 'text/csv;charset=utf-8');
    };

    // Download JSON of Selected Actors
    container.querySelector('#btn-download-json').onclick = () => {
        const targetActors = getSelectedActors();
        const fname = targetActors.length === actors.length ? 'anduril-actors.json' : `anduril-selected-actors-${targetActors.length}.json`;
        downloadArtifact(fname, JSON.stringify(targetActors, null, 2));
    };

    // Download PDF of Selected Actors (Pure Client-Side PDF Generation)
    container.querySelector('#btn-download-pdf').onclick = () => {
        const targetActors = getSelectedActors();
        const pdfBinary = generateActorDossierPdf(targetActors);
        const fname = `anduril-threat-report-${targetActors.length}-actors.pdf`;
        downloadArtifact(fname, pdfBinary, 'application/pdf');
    };

    // Print / PDF via Browser Dialog
    container.querySelector('#btn-print-report').onclick = () => {
        window.print();
    };

    updateSelectionUI();
}

// Pure Client-Side PDF 1.4 Document Generator
function generateActorDossierPdf(targetActors) {
    const sanitize = str => String(str || '').replace(/[()\\]/g, '\\$&').replace(/[\r\n]+/g, ' ');
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    const pageSize = 4;
    const pages = [];
    for (let i = 0; i < targetActors.length; i += pageSize) {
        pages.push(targetActors.slice(i, i + pageSize));
    }
    if (pages.length === 0) pages.push([]);

    const pageCount = pages.length;
    const contentObjects = [];

    pages.forEach((pageActors, pageIdx) => {
        const lines = [
            'BT',
            '/F1 16 Tf',
            '50 740 Td',
            '(' + sanitize('ANDURIL FORENSICS — THREAT INTELLIGENCE DOSSIER') + ') Tj',
            '/F2 8 Tf',
            '0 -14 Td',
            '(' + sanitize(`CONFIDENTIAL // TLP:AMBER | Generated: ${now} | Page ${pageIdx + 1} of ${pageCount}`) + ') Tj',
            '0 -10 Td',
            '(' + sanitize('========================================================================================') + ') Tj',
            '0 -20 Td'
        ];

        pageActors.forEach((a, aIdx) => {
            const num = pageIdx * pageSize + aIdx + 1;
            lines.push(
                '/F1 11 Tf',
                '(' + sanitize(`[${num}] ${a.primary_handle || 'Unknown'} — Threat: ${a.threat_level || 'INFO'} (Confidence: ${a.attribution_confidence || 0}%)`) + ') Tj',
                '/F2 9 Tf',
                '0 -13 Td',
                '(' + sanitize(`     Category: ${a.category || 'N/A'}`) + ') Tj',
                '0 -12 Td',
                '(' + sanitize(`     Origin IP: ${a.suspect_real_entity?.clearnet_ip || 'Unattributed'} | Location: ${a.suspect_real_entity?.location || 'Unknown'}`) + ') Tj',
                '0 -12 Td',
                '(' + sanitize(`     Exposure Vector: ${a.suspect_real_entity?.exposed_via || 'Passive OSINT & Network Probing'}`) + ') Tj'
            );

            if (a.infrastructure && a.infrastructure.length > 0) {
                lines.push(
                    '0 -12 Td',
                    '(' + sanitize(`     Onion Infrastructure: ${a.infrastructure.slice(0, 2).join(', ')}`) + ') Tj'
                );
            }
            if (a.crypto_wallets && a.crypto_wallets.length > 0) {
                const w = a.crypto_wallets[0];
                lines.push(
                    '0 -12 Td',
                    '(' + sanitize(`     Primary Wallet: [${w.currency}] ${w.address} (${w.total_received || 'Active'})`) + ') Tj'
                );
            }
            lines.push('0 -20 Td');
        });

        lines.push('ET');
        contentObjects.push(lines.join('\n'));
    });

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    const addObj = str => {
        offsets.push(pdf.length);
        pdf += str + '\n';
    };

    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

    const kidRefs = [];
    for (let i = 0; i < pageCount; i++) {
        kidRefs.push(`${3 + i * 2} 0 R`);
    }
    addObj(`2 0 obj\n<< /Type /Pages /Kids [${kidRefs.join(' ')}] /Count ${pageCount} >>\nendobj`);

    for (let i = 0; i < pageCount; i++) {
        const pageObjNum = 3 + i * 2;
        const contentObjNum = pageObjNum + 1;
        const content = contentObjects[i];
        const contentLen = content.length;

        addObj(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 ${3 + pageCount * 2} 0 R /F2 ${4 + pageCount * 2} 0 R >> >> >>\nendobj`);
        addObj(`${contentObjNum} 0 obj\n<< /Length ${contentLen} >>\nstream\n${content}\nendstream\nendobj`);
    }

    const f1Num = 3 + pageCount * 2;
    const f2Num = f1Num + 1;
    addObj(`${f1Num} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
    addObj(`${f2Num} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

    const totalObjs = f2Num;
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
        pdf += String(off).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return pdf;
}