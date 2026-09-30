const { execFile } = require('child_process');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const auditService = require('./backend/modules/passive_audit/audit_service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, 'public')));


// Load datasets
const threatActors = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/threat_actors.json'), 'utf-8'));
const hiddenServices = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/hidden_services.json'), 'utf-8'));
const stylometricCorpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/stylometric_corpus.json'), 'utf-8'));
const events = fs.existsSync(path.join(__dirname, 'data/events.json'))
  ? JSON.parse(fs.readFileSync(path.join(__dirname, 'data/events.json'), 'utf-8'))
  : [];

// ==================== API ENDPOINTS ====================

// 1. Overview Telemetry
app.get('/api/stats', (req, res) => {
  const totalActors = threatActors.length;
  const deAnonymizedIDs = hiddenServices.filter(s => s.origin_attribution && s.origin_attribution.clearnet_ip).length;
  const totalLeaks = threatActors.reduce((acc, curr) => acc + (curr.total_leaks_count || 0), 0);
  const avgConfidence = (threatActors.reduce((acc, curr) => acc + curr.attribution_confidence, 0) / totalActors).toFixed(1);

  res.json({
    total_threat_actors: totalActors,
    deanonymized_origin_ips: deAnonymizedIDs,
    total_leaks_indexed: totalLeaks,
    avg_attribution_confidence: parseFloat(avgConfidence),
    monitored_onion_services: hiddenServices.length,
    active_scanners: 4,
    last_system_update: new Date().toISOString()
  });
});

// 2. Query Threat Actors
app.get('/api/actors', (req, res) => {
  let { query, category, threat_level, min_confidence } = req.query;
  let results = threatActors;

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(a => 
      a.primary_handle.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.suspect_real_entity && a.suspect_real_entity.name && a.suspect_real_entity.name.toLowerCase().includes(q)) ||
      (a.suspect_real_entity && a.suspect_real_entity.clearnet_ip && a.suspect_real_entity.clearnet_ip.includes(q)) ||
      a.handles.some(h => h.handle.toLowerCase().includes(q)) ||
      a.pgp_fingerprints.some(p => p.toLowerCase().includes(q)) ||
      a.crypto_wallets.some(w => w.address.toLowerCase().includes(q))
    );
  }

  if (category) results = results.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
  if (threat_level) results = results.filter(a => a.threat_level.toLowerCase() === threat_level.toLowerCase());
  if (min_confidence) results = results.filter(a => a.attribution_confidence >= parseFloat(min_confidence));

  res.json(results);
});

// 3. Specific Threat Actor Profile
app.get('/api/actors/:id', (req, res) => {
  const actor = threatActors.find(a => a.id.toLowerCase() === req.params.id.toLowerCase() || a.primary_handle.toLowerCase() === req.params.id.toLowerCase());
  if (!actor) return res.status(404).json({ error: 'Threat actor not found' });
  const relatedInfrastructure = hiddenServices.filter(s => s.associated_actor_id === actor.id || actor.infrastructure.includes(s.onion_address));
  res.json({ actor, infrastructure_details: relatedInfrastructure });
});

// 4. Infrastructure Endpoints
app.get('/api/infrastructure', (req, res) => {
  res.json(hiddenServices);
});

// 5. Timeline Events
app.get('/api/timeline', (req, res) => {
  const { actor_id, from, to } = req.query;
  let filtered = events;

  if (actor_id) {
    const q = actor_id.toLowerCase();
    filtered = filtered.filter(e => e.actor_id.toLowerCase().includes(q) || e.actor_name.toLowerCase().includes(q));
  }

  if (from) {
    filtered = filtered.filter(e => e.timestamp.split('T')[0] >= from);
  }

  if (to) {
    filtered = filtered.filter(e => e.timestamp.split('T')[0] <= to);
  }

  res.json(filtered);
});

// 6. Relationship Link Graph (Professional Enterprise Topology)
app.get('/api/graph', (req, res) => {
  const nodes = [];
  const edges = [];
  const addedNodes = new Set();

  threatActors.forEach(actor => {
    const actorNodeId = 'actor_' + actor.id;
    if (!addedNodes.has(actorNodeId)) {
      nodes.push({
        id: actorNodeId,
        label: actor.primary_handle,
        group: 'ACTOR',
        category: actor.category,
        threat_level: actor.threat_level,
        confidence: actor.attribution_confidence,
        shape: 'dot',
        size: 22,
        color: {
          background: actor.threat_level === 'CRITICAL' ? '#A3CFCD' : '#82A0AA',
          border: actor.threat_level === 'CRITICAL' ? '#82A0AA' : '#677381',
          highlight: { background: '#A3CFCD', border: '#82A0AA' }
        },
        borderWidth: 2
      });
      addedNodes.add(actorNodeId);
    }

    actor.handles.forEach(h => {
      const handleId = 'handle_' + h.platform.replace(/[^a-zA-Z0-9]/g, '_') + '_' + h.handle;
      if (!addedNodes.has(handleId)) {
        nodes.push({
          id: handleId,
          label: h.platform + ': ' + h.handle,
          group: 'HANDLE',
          shape: 'dot',
          size: 11,
          color: { background: '#677381', border: '#4B4A54', highlight: { background: '#82A0AA', border: '#677381' } },
          borderWidth: 1.5
        });
        addedNodes.add(handleId);
      }
      edges.push({
        from: actorNodeId,
        to: handleId,
        label: 'alias',
        color: { color: '#677381', highlight: '#82A0AA' },
        arrows: { to: { enabled: true, scaleFactor: 0.4 } },
        dashes: true
      });
    });

    actor.pgp_fingerprints.forEach((pgp, idx) => {
      const pgpId = 'pgp_' + actor.id + '_' + idx;
      if (!addedNodes.has(pgpId)) {
        nodes.push({
          id: pgpId,
          label: 'PGP: ' + pgp.slice(0, 10) + '...',
          group: 'PGP',
          shape: 'dot',
          size: 11,
          color: { background: '#4B4A54', border: '#2A272A', highlight: { background: '#677381', border: '#4B4A54' } },
          borderWidth: 1.5
        });
        addedNodes.add(pgpId);
      }
      edges.push({
        from: actorNodeId,
        to: pgpId,
        label: 'signed_by',
        color: { color: '#677381', highlight: '#4B4A54' },
        arrows: { to: { enabled: true, scaleFactor: 0.4 } }
      });
    });

    actor.crypto_wallets.forEach(w => {
      const walletId = 'wallet_' + w.currency + '_' + w.address.slice(0, 10);
      if (!addedNodes.has(walletId)) {
        nodes.push({
          id: walletId,
          label: w.currency + ': ' + w.address.slice(0, 8) + '...',
          group: 'WALLET',
          shape: 'dot',
          size: 11,
          color: { background: '#A3CFCD', border: '#82A0AA', highlight: { background: '#A3CFCD', border: '#82A0AA' } },
          borderWidth: 1.5
        });
        addedNodes.add(walletId);
      }
      edges.push({
        from: actorNodeId,
        to: walletId,
        label: 'funds',
        color: { color: '#677381', highlight: '#A3CFCD' },
        arrows: { to: { enabled: true, scaleFactor: 0.4 } }
      });
    });

    if (actor.suspect_real_entity && actor.suspect_real_entity.clearnet_ip) {
      const ipId = 'ip_' + actor.suspect_real_entity.clearnet_ip;
      if (!addedNodes.has(ipId)) {
        nodes.push({
          id: ipId,
          label: 'ORIGIN IP: ' + actor.suspect_real_entity.clearnet_ip,
          group: 'CLEARNET_IP',
          shape: 'box',
          margin: 8,
          size: 14,
          color: { background: '#82A0AA', border: '#677381', highlight: { background: '#A3CFCD', border: '#82A0AA' } },
          font: { color: '#ffffff', size: 10, face: 'JetBrains Mono' },
          borderWidth: 2
        });
        addedNodes.add(ipId);
      }
      edges.push({
        from: actorNodeId,
        to: ipId,
        label: 'UNMASKED (' + actor.attribution_confidence + '%)',
        color: { color: '#82A0AA', highlight: '#A3CFCD' },
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.6 } }
      });
    }
  });

  res.json({ nodes, edges });
});

// 7. AI Stylometric Comparator Engine
app.post('/api/stylometry/match', (req, res) => {
  const { sample_text, text } = req.body;
  const input = sample_text || text;
  if (!input || input.trim().length === 0) return res.status(400).json({ error: 'Text sample is required' });

  const cleaned = input.trim();
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLen = sentences.length > 0 ? (words.length / sentences.length).toFixed(1) : '14.0';
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const ttr = words.length > 0 ? (uniqueWords.size / words.length).toFixed(2) : '0.75';

  const hasSeparatorColons = cleaned.includes('::');
  const hasBroFam = /\b(bro|fam|yo|pls)\b/i.test(cleaned);
  const hasFrenchQuotes = cleaned.includes('«') || cleaned.includes('»');
  const hasDollarAfter = /\d+\$/.test(cleaned);

  const rankings = threatActors.map(actor => {
    let score = 50;
    if (actor.primary_handle === 'IntelBroker' && hasSeparatorColons) score += 44;
    if (actor.primary_handle === 'USDoD' && hasBroFam) score += 46;
    if (actor.primary_handle === 'ShinyHunters' && hasFrenchQuotes) score += 42;
    if (actor.primary_handle === 'LockBitSupp' && (hasDollarAfter || cleaned.includes('!'))) score += 41;
    score = Math.min(Math.round(score + Math.random() * 3), 98);

    return {
      actor_id: actor.id,
      primary_handle: actor.primary_handle,
      category: actor.category,
      threat_level: actor.threat_level,
      confidence_score: score,
      matched_features: [
        'Sentence Length Match (' + avgSentenceLen + ' words/sent)',
        'Vocabulary Richness Similarity (TTR ' + ttr + ')',
        hasSeparatorColons ? 'Signature Delimiter Habit (::)' : null,
        hasBroFam ? 'Informal Slang Words (bro/fam)' : null,
        hasFrenchQuotes ? 'Guillemet Quotes (» »)' : null,
        hasDollarAfter ? 'Postfix Currency Sign (1000$)' : null
      ].filter(Boolean)
    };
  });

  rankings.sort((a, b) => b.confidence_score - a.confidence_score);

  res.json({
    analyzed_sample: {
      word_count: words.length,
      sentence_count: sentences.length,
      avg_sentence_length: parseFloat(avgSentenceLen),
      vocabulary_richness: parseFloat(ttr),
      detected_markers: [
        hasSeparatorColons ? 'Double Colon Separator (::)' : null,
        hasBroFam ? 'Colloquial Dialect (bro/fam)' : null,
        hasFrenchQuotes ? 'French Guillemet Quotes' : null,
        hasDollarAfter ? 'Postfixed Currency Formatting' : null
      ].filter(Boolean)
    },
    top_match: rankings[0],
    ranked_candidates: rankings
  });
});

// 8. Passive Infrastructure Scan (Certs & Status Leaks)
app.post('/api/scan', (req, res) => {
  const { onion_address } = req.body;
  if (!onion_address) return res.status(400).json({ error: 'onion_address is required' });

  const existing = hiddenServices.find(s => s.onion_address.toLowerCase() === onion_address.toLowerCase());
  if (existing) {
    return res.json({
      status: 'SCAN_COMPLETE',
      onion_address: existing.onion_address,
      service_name: existing.service_name,
      scan_timestamp: new Date().toISOString(),
      misconfigurations: existing.misconfigurations,
      origin_attribution: existing.origin_attribution
    });
  }

  res.json({
    status: 'SCAN_COMPLETE',
    onion_address,
    service_name: 'Target Onion Service (' + onion_address.slice(0, 12) + '...)',
    scan_timestamp: new Date().toISOString(),
    misconfigurations: [
      {
        type: 'SSL_CERTIFICATE_CLEARNET_MATCH',
        description: 'Exposed TLS Certificate links to Clearnet Host',
        severity: 'HIGH',
        evidence: 'Cert SAN match discovered on clearnet host 185.220.101.45'
      }
    ],
    origin_attribution: {
      clearnet_ip: '185.220.101.45',
      confidence_score: 88.5,
      country: 'Romania',
      isp: 'PrivateLayer Romania',
      matching_indicators: ['SSL Cert SAN', 'Server-Status Scoreboard']
    }
  });
});

// 9. Active Web Vulnerability Probing (origin-only-6: SSRF OOB, SQLi-OOB, LFI)
app.post('/api/scan/active', (req, res) => {
  const { onion_address } = req.body;
  const target = (onion_address || '').toLowerCase();

  if (target.includes('clean') || target.includes('vault88')) {
    return res.json({
      status: 'NO_ORIGIN_VULNS',
      onion_address: target || 'cleanvault88jshduw73jsndk29shdu39s83hd.onion',
      scan_profile: 'origin-only-6 (Simulated Acunetix + Proxify)',
      scan_timestamp: new Date().toISOString(),
      origin_attribution: {
        clearnet_ip: 'Protected by Tor',
        confidence_score: '0.0%',
        isp: 'Zero Egress Callback'
      },
      vulns: []
    });
  }

  // Default Vulnerable IntelBroker Lab Clone
  res.json({
    status: 'ORIGIN_DE_ANONYMIZED',
    onion_address: target || 'intelbrk83jdhx7923hskduw73jsndk29shdu39s.onion',
    alias_label: 'IntelBroker Official Leak Portal (Lab Clone)',
    scan_profile: 'origin-only-6 (Simulated Acunetix + Proxify)',
    scan_timestamp: new Date().toISOString(),
    origin_attribution: {
      clearnet_ip: '185.220.101.45',
      hostname: 'api.privatelayer-ro.net',
      country: 'Romania',
      isp: 'PrivateLayer Romania (AS208323)',
      confidence_score: '96.8%',
      primary_vector: 'Blind SSRF Out-of-Band (AcuMonitor Callback)'
    },
    vulns: [
      {
        id: 'VULN-01',
        type: 'SSRF (Blind / Out-of-Band)',
        param: '/api/fetch_report?url=',
        severity: 'CRITICAL',
        evidence: 'AcuMonitor HTTP Egress Callback',
        oob_hit: {
          ip: '185.220.101.45',
          port: '48921',
          timestamp: '12:30:18 UTC',
          raw_listener_packet: 'HTTP/1.1 Inbound from 185.220.101.45:48921\nGET /oob-probe-739284 HTTP/1.1\nHost: listener.acumonitor.internal:8080\nUser-Agent: curl/7.88.1'
        },
        de_anon_explanation: 'Backend fetched external listener directly over Clearnet, bypassing Tor and exposing true origin IP.'
      },
      {
        id: 'VULN-02',
        type: 'SQLi (Out-of-Band DNS Exfiltration)',
        param: '/market/item.php?id=',
        severity: 'HIGH',
        evidence: 'Database xp_dirtree DNS Callback',
        oob_hit: {
          ip: '185.220.101.45',
          port: '5353',
          timestamp: '12:30:21 UTC',
          raw_listener_packet: 'DNS A-Query from 185.220.101.45:5353\nQuery: db-token.oob.security-lab.internal'
        },
        de_anon_explanation: 'Database backend executed a query forcing public DNS resolution over clearnet.'
      }
    ]
  });
});

// Start Server

// =========================================================================
// Track 1: Passive Technical Audit Endpoint (Shodan & FOFA Dorks)
// =========================================================================
app.post('/api/audit/passive', (req, res) => {
  const body = req.body || {};
  const onion_address = body.onion_address || body.onion || body.target;
  const domain = body.domain;
  const serial = body.serial;
  const target = onion_address || 'intelbrk83jdhx7923hskduw73jsndk29shdu39s.onion';

  // If running on Vercel (or python3 is unavailable), use native JS auditor
  if (process.env.VERCEL) {
    return res.json(auditService.audit(target, domain, serial));
  }

  const scriptPath = path.join(__dirname, 'backend/modules/passive_audit/passive_auditor.py');
  const args = [scriptPath, '--onion', target, '--json'];
  if (domain) args.push('--domain', domain);
  if (serial) args.push('--serial', serial);

  execFile('python3', args, { timeout: 15000 }, (error, stdout, stderr) => {
    if (error) {
      return res.json(auditService.audit(target, domain, serial));
    }
    try {
      const data = JSON.parse(stdout);
      return res.json(data);
    } catch (parseErr) {
      return res.json(auditService.audit(target, domain, serial));
    }
  });
});

app.get('/api/audit/dorks', (req, res) => {
  const { domain, serial } = req.query;
  const targetDomain = domain || 'api.privatelayer-ro.net';
  const targetSerial = serial || '0x4F89A10B';

  if (process.env.VERCEL) {
    const dorks = auditService.generateAllDorks({ domain: targetDomain, cert_serial: targetSerial, favicon_hash: -1204891102, jarm: '27d27d27d00000000d27d27d27d27d', has_status_page: true });
    return res.json({ dorks });
  }

  const pyCode = `import sys, json; sys.path.append('${path.join(__dirname, "backend/modules/passive_audit")}'); from dork_builder import DorkBuilder; print(json.dumps(DorkBuilder.generate_all_dorks({'domain': '${targetDomain}', 'cert_serial': '${targetSerial}', 'favicon_hash': -1204891102, 'jarm': '27d27d27d00000000d27d27d27d27d', 'has_status_page': True})))`;

  execFile('python3', ['-c', pyCode], { timeout: 5000 }, (error, stdout, stderr) => {
    if (error) {
      const dorks = auditService.generateAllDorks({ domain: targetDomain, cert_serial: targetSerial, favicon_hash: -1204891102, jarm: '27d27d27d00000000d27d27d27d27d', has_status_page: true });
      return res.json({ dorks });
    }
    try {
      res.json({ dorks: JSON.parse(stdout) });
    } catch (e) {
      const dorks = auditService.generateAllDorks({ domain: targetDomain, cert_serial: targetSerial, favicon_hash: -1204891102, jarm: '27d27d27d00000000d27d27d27d27d', has_status_page: true });
      return res.json({ dorks });
    }
  });
});

if (require.main === module) {
  const host = '0.0.0.0';
  app.listen(3000, host, () => {
    console.log('Backend running on http://' + host + ':3000');
  });
  try {
    const s2 = require('http').createServer(app);
    s2.listen(3100, host, () => {
      console.log('Backend also listening on http://' + host + ':3100');
    });
  } catch (err) {}
}

module.exports = app;
