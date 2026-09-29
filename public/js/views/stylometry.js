function renderStylometry(container) {
    container.innerHTML = `
        <div class="flex flex-wrap gap-3 justify-between items-center mb-5">
            <div>
                <h2 class="text-xl font-bold text-text-main flex items-center">
                    <i class="fa-solid fa-brain mr-2.5 text-primary text-base"></i> Stylometry
                </h2>

            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Input Area -->
            <div class="stat-card flex flex-col h-[540px]">
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-border-color">
                    <h3 class="font-semibold text-text-main text-xs uppercase tracking-wider">Text sample</h3>
                    <span class="text-[11px] text-text-muted"></span>
                </div>
                <textarea id="stylo-input" aria-label="Text corpus for stylometric comparison" class="flex-1 w-full p-3.5 border border-border-color rounded-lg text-xs font-mono text-text-main bg-surface-secondary/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none mb-3" placeholder="Paste sample text here... (e.g. 'We have breached internal servers. All datasets for sale :: 50000$ contact via tox bro')"></textarea>
                <div class="flex flex-wrap gap-2 justify-between items-center pt-2 border-t border-border-color">
                    <button class="btn-secondary text-xs" onclick="document.getElementById('stylo-input').value = 'We have successfully breached the internal database. All records are available for purchase :: contact us on tox. Price is 50000$ bro'"><i class="fa-solid fa-flask text-xs"></i> Load sample</button>
                    <button id="btn-analyze" class="btn-primary text-xs"><i class="fa-solid fa-magnifying-glass-chart text-xs"></i> Analyze</button>
                </div>
            </div>

            <!-- Results Area -->
            <div class="stat-card flex flex-col h-[540px] overflow-y-auto" id="stylo-results" aria-live="polite" aria-busy="false">
                <div class="flex-1 flex flex-col items-center justify-center text-text-muted p-6 text-center">
                    <i class="fa-solid fa-brain text-3xl mb-3 text-text-muted/40"></i>
                    <p class="text-xs font-medium text-text-main mb-1">Add text to compare</p>

                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-analyze').addEventListener('click', async () => {
        const button = container.querySelector('#btn-analyze');
        const text = document.getElementById('stylo-input').value;
        const resultsContainer = document.getElementById('stylo-results');

        if (!text.trim()) {
            resultsContainer.innerHTML = '<p class="text-sm text-text-muted" role="alert">Enter or load sample text to compare linguistic markers.</p>';
            document.getElementById('stylo-input').focus();
            return;
        }

        button.disabled = true;
        resultsContainer.setAttribute('aria-busy', 'true');
        resultsContainer.innerHTML = `
            <div class="flex-1 flex flex-col items-center justify-center text-primary gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <p class="text-xs font-medium text-text-main">Comparing markers…</p>
            </div>
        `;

        try {
            const res = await fetch('/api/stylometry/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Analysis unavailable');
            if (data.error) throw new Error(data.error);

            // Render Results
            resultsContainer.innerHTML = `
                <div class="space-y-4 fade-in">
                    <div class="flex items-center justify-between pb-2 border-b border-border-color">
                        <h3 class="font-semibold text-text-main text-xs uppercase tracking-wider">Results</h3>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Marker comparison</span>
                    </div>

                    <!-- Top Match Card -->
                    <div class="bg-primary/5 border border-primary/25 rounded-xl p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <span class="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">Top match</span>
                                <h4 class="text-lg font-bold text-text-main">${escapeHTML(data.top_match.primary_handle)}</h4>
                                <span class="text-[11px] text-text-muted">${escapeHTML(data.top_match.category || 'Threat Actor')}</span>
                            </div>
                            <div class="text-right">
                                <span class="text-2xl font-bold text-emerald-500">${data.top_match.confidence_score}%</span>
                                <span class="block text-[9px] text-text-muted uppercase tracking-wider">Confidence</span>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="confidence-bar mb-3">
                            <div class="fill high" style="width: ${data.top_match.confidence_score}%"></div>
                        </div>

                        <div class="mt-3">
                            <span class="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Markers</span>
                            <div class="marker-pills mt-2">${data.top_match.matched_features.map(f => `
                                <div class="marker-pill">
                                    <i class="fa-solid fa-check text-emerald-500 mr-2 text-xs flex-shrink-0"></i> 
                                    <span>${escapeHTML(f)}</span>
                                </div>
                            `).join('')}</div>
                        </div>
                    </div>

                    <!-- Input Metrics -->
                    <div class="grid grid-cols-2 gap-2.5">
                        <div class="bg-surface-secondary/60 rounded-lg p-2.5 border border-border-color">
                            <span class="block text-[10px] text-text-muted uppercase font-medium">Word Count</span>
                            <span class="text-base font-bold text-text-main">${data.analyzed_sample.word_count} words</span>
                        </div>
                        <div class="bg-surface-secondary/60 rounded-lg p-2.5 border border-border-color">
                            <span class="block text-[10px] text-text-muted uppercase font-medium">Vocabulary diversity</span>
                            <span class="text-base font-bold text-text-main">${data.analyzed_sample.vocabulary_richness}</span>
                        </div>
                    </div>

                    <!-- Ranked Candidates -->
                    <div>
                        <span class="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-2">Other matches</span>
                        <div class="space-y-1.5">
                            ${data.ranked_candidates.slice(1, 4).map(c => `
                                <div class="rank-row">
                                    <span class="font-medium text-text-main">${escapeHTML(c.primary_handle)}</span>
                                        <div class="confidence-bar">
                                            <div class="fill ${c.confidence_score > 70 ? 'medium' : 'low'}" style="width: ${c.confidence_score}%"></div>
                                        </div>
                                        <span class="font-bold text-xs ${c.confidence_score > 70 ? 'text-warning' : 'text-text-muted'}">${c.confidence_score}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            resultsContainer.innerHTML = `
                <div class="flex-1 flex flex-col items-center justify-center text-danger p-4 text-center">
                    <i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i>
                    <p class="text-xs font-medium">Error analyzing text corpus: ${escapeHTML(err.message)}</p>
                </div>
            `;
        } finally {
            button.disabled = false;
            resultsContainer.setAttribute('aria-busy', 'false');
        }
    });
}