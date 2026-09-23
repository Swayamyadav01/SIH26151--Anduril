function renderStylometry(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fa-solid fa-brain mr-3 text-primary"></i> AI Stylometric Analysis
                </h2>
                <p class="text-sm text-text-muted mt-1">Paste dark web forum posts or chat logs to automatically match linguistic patterns to known threat actors.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Input Area -->
            <div class="stat-card flex flex-col h-[600px]">
                <h3 class="font-semibold text-gray-800 mb-4">Input Corpus Data</h3>
                <textarea id="stylo-input" class="flex-1 w-full p-4 border border-border-color rounded-lg text-sm font-mono text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none mb-4" placeholder="Paste target text here... (e.g., 'We have breached USDoD network. All data is for sale 1000$ bro')"></textarea>
                <div class="flex justify-between items-center">
                    <button class="btn-secondary" onclick="document.getElementById('stylo-input').value = 'We have successfully breached the network. The data is available for download :: contact us via tox. Price is 50000$ bro'"><i class="fa-solid fa-flask"></i> Load Sample Text</button>
                    <button id="btn-analyze" class="btn-primary"><i class="fa-solid fa-magnifying-glass-chart"></i> Analyze Text</button>
                </div>
            </div>

            <!-- Results Area -->
            <div class="stat-card flex flex-col h-[600px] overflow-y-auto" id="stylo-results">
                <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <i class="fa-solid fa-robot text-4xl mb-4 opacity-50"></i>
                    <p class="text-sm">Awaiting text input for analysis.</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-analyze').addEventListener('click', async () => {
        const text = document.getElementById('stylo-input').value;
        const resultsContainer = document.getElementById('stylo-results');
        
        if (!text.trim()) {
            alert('Please enter some text to analyze.');
            return;
        }

        resultsContainer.innerHTML = `
            <div class="flex-1 flex flex-col items-center justify-center text-primary">
                <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
                <p class="text-sm font-medium">Running linguistic extraction and behavioral matching...</p>
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
                <h3 class="font-semibold text-gray-800 mb-4 border-b border-border-color pb-2">Analysis Results</h3>
                
                <!-- Match -->
                <div class="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-5">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <span class="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Top Match Identified</span>
                            <h4 class="text-xl font-bold text-gray-800">${data.top_match.primary_handle}</h4>
                        </div>
                        <div class="text-right">
                            <span class="text-2xl font-bold text-emerald-600">${data.top_match.confidence_score}%</span>
                            <span class="block text-[10px] text-gray-500 uppercase">Confidence</span>
                        </div>
                    </div>
                    
                    <div class="space-y-2 mt-4">
                        <h5 class="text-xs font-semibold text-gray-600 uppercase mb-2">Matched Linguistic Markers:</h5>
                        ${data.top_match.matched_features.map(f => `
                            <div class="flex items-center text-sm text-gray-700 bg-white/60 p-2 rounded border border-white">
                                <i class="fa-solid fa-check text-emerald-500 mr-2"></i> ${f}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Input Metrics -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <span class="block text-xs text-gray-500 mb-1">Word Count</span>
                        <span class="text-lg font-semibold text-gray-800">${data.analyzed_sample.word_count}</span>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <span class="block text-xs text-gray-500 mb-1">Lexical Richness</span>
                        <span class="text-lg font-semibold text-gray-800">${data.analyzed_sample.vocabulary_richness} TTR</span>
                    </div>
                </div>

                <!-- Alternative Candidates -->
                <h5 class="text-xs font-semibold text-gray-600 uppercase mb-3">Other Candidates</h5>
                <div class="space-y-2">
                    ${data.ranked_candidates.slice(1, 4).map(c => `
                        <div class="flex justify-between items-center p-3 border border-border-color rounded-lg bg-white">
                            <span class="text-sm font-medium text-gray-700">${c.primary_handle}</span>
                            <span class="text-sm font-bold ${c.confidence_score > 70 ? 'text-warning' : 'text-gray-500'}">${c.confidence_score}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (err) {
            resultsContainer.innerHTML = `
                <div class="flex-1 flex flex-col items-center justify-center text-danger">
                    <i class="fa-solid fa-triangle-exclamation text-4xl mb-4"></i>
                    <p class="text-sm font-medium">Error analyzing text: ${err.message}</p>
                </div>
            `;
        }
    });
}
