const {test, expect} = require('@playwright/test');
async function dashboard(page) {
    await page.goto('/');
    await expect(page.locator('.metric-card')).toHaveCount(6);
}
async function go(page,view) {
    await page.evaluate(view => navigateTo(view),view);
}
async function search(page,query,shortcut='Control+k') {
    await page.keyboard.press(shortcut);
    await page.locator('#modal-search-input').fill(query);
}

test('dashboard, repeated themes, persistence, no external assets or runtime errors',async({page})=>{
    const errors=[],external=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3100') && !r.url().startsWith('data:')) external.push(r.url());});
    await dashboard(page);
    await expect(page.locator('#globe-mode')).toHaveText('3D interactive');
    for(let i=0;i<5;i++) await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveClass('dark');
    expect(await page.evaluate(()=>Object.keys(Chart.instances).length)).toBe(3);
    await page.reload();
    await expect(page.locator('html')).toHaveClass('dark');
    await expect(page.locator('.metric-card')).toHaveCount(6);
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
});

test('command palette opens exact actor, IP and onion dossiers with keyboard and click',async({page})=>{
    await dashboard(page);
    await search(page,'USDoD');
    await page.keyboard.press('Enter');
    await expect(page.locator('#persona-modal')).toBeVisible();
    await expect(page.locator('#persona-modal h2')).toContainText('USDoD');
    await page.evaluate(()=>closePersonaModal());
    await search(page,'185.220.101.45','Meta+k');
    await page.keyboard.press('Enter');
    await expect(page.locator('#svc-detail-panel')).toContainText('185.220.101.45');
    await search(page,'shinyforum');
    await page.locator('.search-result-item').first().click();
    await expect(page.locator('#svc-detail-panel')).toContainText('ShinyHunters');
});

test('palette arrow selection, focus trap, Escape and no matches',async({page})=>{
    await dashboard(page);
    await page.locator('#search-trigger-btn').click();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#search-option-1')).toHaveAttribute('aria-selected','true');
    await page.keyboard.press('Tab');
    await expect(page.locator('#modal-close-btn')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#modal-search-input')).toBeFocused();
    await page.locator('#modal-search-input').fill('no-such-entity');
    await expect(page.locator('#modal-search-results')).toContainText('No matching');
    await page.keyboard.press('Enter');
    await expect(page.locator('#search-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-modal')).toBeHidden();
    await expect(page.locator('#search-trigger-btn')).toBeFocused();
});

test('globe rotates, zooms, resizes and is disposed when navigating away',async({page})=>{
    await dashboard(page);
    await expect(page.locator('#globe-mode')).toHaveText('3D interactive');
    const lng=await page.evaluate(()=>activeGlobe.pointOfView().lng);
    await page.waitForTimeout(800);
    expect(await page.evaluate(()=>activeGlobe.pointOfView().lng)).not.toBe(lng);
    await page.locator('#globe-3d-canvas canvas').hover();
    const altitude=await page.evaluate(()=>activeGlobe.pointOfView().altitude);
    await page.mouse.wheel(0,-200);
    await page.waitForTimeout(400);
    expect(await page.evaluate(()=>activeGlobe.pointOfView().altitude)).toBeLessThan(altitude);
    await page.setViewportSize({width:1100,height:900});
    await expect.poll(()=>page.evaluate(()=>Math.abs(activeGlobe.width()-document.getElementById('globe-3d-canvas').clientWidth))).toBeLessThan(2);
    await go(page,'services');
    expect(await page.evaluate(()=>activeGlobe)).toBeNull();
});

test('accurate vector fallback survives unavailable WebGL library and slow geometry',async({page})=>{
    await page.route('**/vendor/globe.gl.min.js',r=>r.abort());
    await dashboard(page);
    await expect(page.locator('#globe-fallback')).toBeVisible();
    expect(await page.locator('#globe-fallback img').evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
    await expect(page.locator('#globe-mode')).toHaveText('Vector map');
    await page.unroute('**/vendor/globe.gl.min.js');
    await page.route('**/assets/land.json',async r=>{await new Promise(resolve=>setTimeout(resolve,6000)); await r.abort();});
    await page.reload();
    await expect(page.locator('#globe-fallback')).toBeVisible();
    await page.waitForTimeout(5500);
    await expect(page.locator('#globe-mode')).toHaveText('Vector map');
});

test('graph freezes, searches, filters, themes, unlocks and opens linked dossier',async({page})=>{
    await dashboard(page);
    await go(page,'graph');
    await expect.poll(()=>page.evaluate(()=>networkInstance?.physics.physicsEnabled)).toBe(false);
    expect(await page.evaluate(()=>graphDataset.nodes.get().every(n=>n.shape==='dot' && n.borderWidth===1.5))).toBe(true);
    await page.locator('#graph-search').fill('IntelBroker');
    await expect(page.locator('#graph-inspector-content')).toContainText('92.4%');
    await expect(page.locator('#graph-inspector-content')).toContainText('PrivateLayer');
    await page.locator('#graph-filter-type').selectOption('WALLET');
    expect(await page.evaluate(()=>graphDataset.nodes.get().every(n=>n.group==='WALLET'))).toBe(true);
    expect(await page.evaluate(()=>graphDataset.edges.length)).toBe(0);
    await page.locator('#graph-filter-type').selectOption('ALL');
    expect(await page.evaluate(()=>graphDataset.nodes.length)).toBe(42);
    await page.locator('#theme-toggle').click();
    expect(await page.evaluate(()=>graphDataset.nodes.get()[0].font.color)).toBe('#e2e8f0');
    await page.locator('#btn-toggle-physics').click();
    await expect(page.locator('#btn-toggle-physics')).toContainText('Physics Active');
    await page.locator('#btn-toggle-physics').click();
    await expect(page.locator('#btn-toggle-physics')).toContainText('Layout Fixed');
    await page.locator('#btn-reset-zoom').click();
    await page.locator('#graph-search').fill('95.173.136.72');
    await expect(page.locator('#graph-inspector-content')).toContainText('LockBit');
    await page.getByRole('button',{name:'Inspect infrastructure',exact:true}).click();
    await expect(page.locator('#svc-detail-panel')).toContainText('95.173.136.72');
});

test('stylometry handles empty input, results, markers and API failures',async({page})=>{
    await dashboard(page); await go(page,'stylometry');
    await page.locator('#btn-analyze').click();
    await expect(page.locator('#stylo-results')).toContainText('Enter or load');
    await page.locator('#stylo-input').fill('Hello members :: The archive is available for purchase. Contact us for details.');
    await page.locator('#btn-analyze').click();
    await expect(page.locator('#stylo-results h4')).toHaveText('IntelBroker');
    await expect(page.locator('.marker-pill').filter({hasText:'::'})).toHaveCount(1);
    await expect(page.locator('.rank-row')).toHaveCount(3);
    expect(await page.locator('#stylo-results').evaluate(el=>getComputedStyle(el).overflowY)).toBe('auto');
    await page.locator('.rank-row').last().scrollIntoViewIfNeeded();
    await expect(page.locator('.rank-row').last()).toBeInViewport();
    await expect(page.locator('#btn-analyze')).toBeEnabled();
    await page.route('**/api/stylometry/match',r=>r.fulfill({status:503,contentType:'application/json',body:'{"error":"Temporarily unavailable"}'}));
    await page.locator('#btn-analyze').click();
    await expect(page.locator('#stylo-results')).toContainText('Temporarily unavailable');
    await expect(page.locator('#btn-analyze')).toBeEnabled();
});

test('all views render without errors and mobile navigation keeps viewport contained',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await dashboard(page);
    for(const size of [1440,768,390]) {
        await page.setViewportSize({width:size,height:900});
        for(const view of ['dashboard','personas','services','infrastructure','graph','investigations','alerts','stylometry','reports','sources','watchlist','discover']) {
            await go(page,view); await page.waitForTimeout(250);
            expect(await page.locator('#main-content').innerText()).not.toContain('Unable to open');
            const overflow=await page.evaluate(()=>{const el=document.getElementById('main-content');return el.scrollWidth-el.clientWidth;});
            expect(overflow,`${view} overflow at ${size}px`).toBeLessThanOrEqual(1);
        }
    }
    await page.locator('#mobile-menu-btn').click();
    await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded','true');
    await page.locator('#sidebar-nav a[href="#dashboard"]').click();
    await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded','false');
    expect(errors).toEqual([]);
});

test('API load failure has a working retry',async({page})=>{
    await page.route('**/api/actors',r=>r.fulfill({status:503,body:'unavailable'}));
    await page.goto('/');
    await expect(page.locator('#main-content')).toContainText('Intelligence data unavailable');
    await page.unroute('**/api/actors');
    await page.getByRole('button',{name:'Retry connection'}).click();
    await expect(page.locator('.metric-card')).toHaveCount(6);
});

test('reduced motion disables globe rotation and pulse animation',async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await dashboard(page);
    await expect(page.locator('#globe-mode')).toHaveText('3D interactive');
    expect(await page.evaluate(()=>activeGlobe.controls().autoRotate)).toBe(false);
    expect(await page.evaluate(()=>activeGlobe.ringsData().length)).toBe(0);
});

test('long onion addresses and wallet hashes stay inside table bounds',async({page})=>{
    await dashboard(page);
    const onion='a'.repeat(56)+'.onion';
    await page.evaluate(onion=>{
        appState.data.infrastructure[0].onion_address=onion;
        appState.data.actors[0].crypto_wallets[0].address='b'.repeat(100);
        navigateTo('services');
    },onion);
    const before=await page.locator('#svc-table-body').evaluate(el=>el.closest('table').getBoundingClientRect().width);
    const cell=page.locator('#svc-table-body tr').first().locator('td').nth(1);
    expect(await cell.evaluate(el=>getComputedStyle(el).textOverflow)).toBe('ellipsis');
    expect(await cell.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('nowrap');
    expect(await cell.evaluate(el=>getComputedStyle(el).overflow)).toBe('hidden');
    await search(page,onion);
    await page.keyboard.press('Enter');
    await expect(page.locator('#svc-detail-panel')).toContainText(onion);
    const after=await page.locator('#svc-table-body').evaluate(el=>el.closest('table').getBoundingClientRect().width);
    expect(after).toBe(before);
});

test('actual WebGL failure keeps vector map visible',async({page})=>{
    await page.addInitScript(()=>{
        const getContext=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(type,...args) {
            if(type==='webgl' || type==='webgl2' || type==='experimental-webgl') return null;
            return getContext.call(this,type,...args);
        };
    });
    await dashboard(page);
    await expect(page.locator('#globe-fallback')).toBeVisible();
    await expect(page.locator('#globe-mode')).toHaveText('Vector map');
    await expect(page.locator('#globe-instructions')).toContainText('Static fallback');
    expect(await page.locator('#globe-fallback img').evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
});
