function renderStylometry(container) {
    container.innerHTML = `
        <div class="flex flex-wrap gap-3 justify-between items-center mb-5">
            <div>
                <h2 class="text-xl font-bold text-text-main flex items-center">
                    <i class="fa-solid fa-brain mr-2.5 text-primary text-base"></i> AI Stylometric Attribution
                </h2>
                <p class="text-xs text-text-muted mt-0.5">Paste dark web forum postings, breach notices, or chat logs to correlate linguistic fingerprint markers to known threat actors.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Input Area -->
            <div class="stat-card flex flex-col h-[540px]">
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-border-color">
                    <h3 class="font-semibold text-text-main text-xs uppercase tracking-wider">Input Corpus Data</h3>
                    <span class="text-[11px] text-text-muted">Target Text / Dump Header</span>
                </div>
                <textarea id="stylo-input" class="flex-1 w-full p-3.5 border border-border-color rounded-lg text-xs font-mono text-text-main bg-surface-secondary/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none mb-3" placeholder="Paste sample text here... (e.g. 'We have breached internal servers. All datasets for sale :: 50000$ contact via tox bro')"></textarea>
                <div class="flex flex-wrap gap-2 justify-between items-center pt-2 border-t border-border-color">
                    <button class="btn-secondary text-xs" onclick="document.getElementById('stylo-input').value = 'We have successfully breached the internal database. All records are available for purchase :: contact us on tox. Price is 50000$ bro'"><i class="fa-solid fa-flask text-xs"></i> Load Sample Text</button>
                    <button id="btn-analyze" class="btn-primary text-xs"><i class="fa-solid fa-magnifying-glass-chart text-xs"></i> Correlate Markers</button>
                </div>
            </div>

            <!-- Results Area -->
            <div class="stat-card flex flex-col h-[540px] overflow-y-auto" id="stylo-results">
                <div class="flex-1 flex flex-col items-center justify-center text-text-muted p-6 text-center">
                    <i class="fa-solid fa-brain text-3xl mb-3 text-text-muted/40"></i>
                    <p class="text-xs font-medium text-text-main mb-1">Awaiting Text Corpus</p>
                    <p class="text-[11px] text-text-muted leading-relaxed max-w-xs">Load a sample text or paste dark web communications to extract vocabulary richness, punctuation habits, and colloquial dialect.</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-analyze').addEventListener('click', async () => {
        const text = document.getElementById('stylo-input').value;
        const resultsContainer = document.getElementById('stylo-results');
        
        if (!text.trim()) {
            alert('Please enter or load some text to analyze.');
            return;
        }

        resultsContainer.innerHTML = `
            <div class="flex-1 flex flex-col items-center justify-center text-primary gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <p class="text-xs font-medium text-text-main">Running NLP feature extraction & actor fingerprinting...</p>
            </div>
        `;

        try {
            const res = await fetch('/api/stylometry/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);

            // Render Results
            resultsContainer.innerHTML = `
                <div class="space-y-4 fade-in">
                    <div class="flex items-center justify-between pb-2 border-b border-border-color">
                        <h3 class="font-semibold text-text-main text-xs uppercase tracking-wider">Forensic Attribution Match</h3>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Corroborated</span>
                    </div>
                    
                    <!-- Top Match Card -->
                    <div class="bg-primary/5 border border-primary/25 rounded-xl p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <span class="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">Top Identified Candidate</span>
                                <h4 class="text-lg font-bold text-text-main">${data.top_match.primary_handle}</h4>
                                <span class="text-[11px] text-text-muted">${data.top_match.category || 'Threat Actor'}</span>
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
                        
                        <div class="space-y-1.5 mt-3">
                            <span class="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Detected Forensic Markers:</span>
                            ${data.top_match.matched_features.map(f => `
                                <div class="flex items-center text-xs text-text-main bg-surface/80 p-2 rounded-lg border border-border-color">
                                    <i class="fa-solid fa-check text-emerald-500 mr-2 text-xs flex-shrink-0"></i> 
                                    <span class="truncate">${f}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Input Metrics -->
                    <div class="grid grid-cols-2 gap-2.5">
                        <div class="bg-surface-secondary/60 rounded-lg p-2.5 border border-border-color">
                            <span class="block text-[10px] text-text-muted uppercase font-medium">Word Count</span>
                            <span class="text-base font-bold text-text-main">${data.analyzed_sample.word_count} words</span>
                        </div>
                        <div class="bg-surface-secondary/60 rounded-lg p-2.5 border border-border-color">
                            <span class="block text-[10px] text-text-muted uppercase font-medium">Vocabulary Diversity (TTR)</span>
                            <span class="text-base font-bold text-text-main">${data.analyzed_sample.vocabulary_richness}</span>
                        </div>
                    </div>

                    <!-- Ranked Candidates -->
                    <div>
                        <span class="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-2">Ranked Candidate Comparison</span>
                        <div class="space-y-1.5">
                            ${data.ranked_candidates.slice(1, 4).map(c => `
                                <div class="flex justify-between items-center p-2 rounded-lg border border-border-color bg-surface-secondary/40 text-xs">
                                    <span class="font-medium text-text-main">${c.primary_handle}</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-16 confidence-bar hidden sm:block">
                                            <div class="fill ${c.confidence_score > 70 ? 'medium' : 'low'}" style="width: ${c.confidence_score}%"></div>
                                        </div>
                                        <span class="font-bold text-xs ${c.confidence_score > 70 ? 'text-warning' : 'text-text-muted'}">${c.confidence_score}%</span>
                                    </div>
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
                    <p class="text-xs font-medium">Error analyzing text corpus: ${err.message}</p>
                </div>
            `;
        }
    });
}