async function buildAssets() {
const fs = require('node:fs');
const path = require('node:path');
const topojson = require('topojson-client');
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), {recursive:true}); fs.copyFileSync(from, to); };
copy('node_modules/chart.js/dist/chart.umd.js', 'public/vendor/chart.umd.js');
copy('node_modules/vis-network/standalone/umd/vis-network.min.js', 'public/vendor/vis-network.min.js');
copy('node_modules/globe.gl/dist/globe.gl.min.js', 'public/vendor/globe.gl.min.js');
copy('node_modules/@fortawesome/fontawesome-free/css/all.min.css', 'public/vendor/fontawesome/css/all.min.css');
fs.cpSync('node_modules/@fortawesome/fontawesome-free/webfonts', 'public/vendor/fontawesome/webfonts', {recursive:true});
for (const [pkg, file] of [['chart.js','LICENSE.md'],['vis-network','LICENSE-MIT'],['globe.gl','LICENSE'],['@fortawesome/fontawesome-free','LICENSE.txt'],['world-atlas','LICENSE']]) {
    copy(`node_modules/${pkg}/${file}`, `public/vendor/licenses/${pkg.replaceAll('/','-')}.txt`);
}
const world = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json'));
const geometry = topojson.feature(world, world.objects.land);
fs.writeFileSync('public/assets/land.json', JSON.stringify(geometry));
const project = ([lon,lat]) => [(lon+180)*2, (90-lat)*2];
const {geoEquirectangular, geoPath} = await import('d3-geo');
const projection = geoEquirectangular().scale(720 / (2 * Math.PI)).translate([360,180]);
const outline = geoPath(projection)(geometry);
const cities = [{lat:44.4323,lng:26.1063,name:'Bucharest · 185.220.101.45'}, {lat:38.9072,lng:-77.0369,name:'Washington DC'}, {lat:48.8566,lng:2.3522,name:'Paris'}, {lat:55.7558,lng:37.6173,name:'Moscow'}];
const [ox,oy] = project([cities[0].lng,cities[0].lat]);
const arcs = cities.slice(1).map(c=>{const [x,y] = project([c.lng,c.lat]); return `<path d="M${x},${y} Q${(x+ox)/2},${Math.min(y,oy)-45} ${ox},${oy}" fill="none" stroke="#14b8a6" stroke-width="1.3" stroke-dasharray="4 3"/>`;}).join('');
const markers = cities.map((c,i)=>{const [x,y]=project([c.lng,c.lat]);return `<circle cx="${x}" cy="${y}" r="${i ? 3:4}" fill="${i ? '#14b8a6':'#f43f5e'}"><title>${c.name}</title></circle>`;}).join('');
fs.writeFileSync('public/assets/world-map.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360" role="img" aria-label="World map with Bucharest origin and routes from Washington DC, Paris and Moscow"><path d="${outline}" fill="#94a3b8" fill-opacity=".25" stroke="#64748b" stroke-width=".45"/>${arcs}${markers}<circle cx="${ox}" cy="${oy}" r="9" fill="none" stroke="#f43f5e" stroke-opacity=".6"/></svg>`);

}
buildAssets().catch(err => { console.error(err); process.exitCode = 1; });
