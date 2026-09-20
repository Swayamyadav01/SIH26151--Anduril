"""
Passive Technical Audit - Advanced Multi-Engine Dork Builder (Shodan, FOFA & Censys)
SIH Problem Statement 26151: Targeted Dark Web De-Anonymization Platform

Generates validated, production-grade search dorks for unmasking Clearnet Origin IPs
behind Tor hidden services via SSL/TLS certificates, status pages, favicon hashes,
JARM signatures, SSH host keys, custom HTTP headers, and HTML title/body fingerprints.
"""
import base64
import urllib.parse

def mmh3_hash(data: bytes, seed: int = 0) -> int:
    """
    Pure-Python 32-bit Murmur3 hash implementation matching Shodan / FOFA favicon hashing.
    No C-extensions required; fully cross-platform.
    """
    c1 = 0xcc9e2d51
    c2 = 0x1b873593
    length = len(data)
    h1 = seed
    rounded_end = (length & 0xfffffffc)

    for i in range(0, rounded_end, 4):
        k1 = (data[i] & 0xff) | ((data[i + 1] & 0xff) << 8) | \
             ((data[i + 2] & 0xff) << 16) | (data[i + 3] << 24)
        k1 = (k1 * c1) & 0xffffffff
        k1 = ((k1 << 15) | (k1 >> 17)) & 0xffffffff
        k1 = (k1 * c2) & 0xffffffff

        h1 ^= k1
        h1 = ((h1 << 13) | (h1 >> 19)) & 0xffffffff
        h1 = (h1 * 5 + 0xe6546b64) & 0xffffffff

    k1 = 0
    val = length & 0x03
    if val == 3:
        k1 = (data[rounded_end + 2] & 0xff) << 16
    if val in (2, 3):
        k1 |= (data[rounded_end + 1] & 0xff) << 8
    if val in (1, 2, 3):
        k1 |= (data[rounded_end] & 0xff)
        k1 = (k1 * c1) & 0xffffffff
        k1 = ((k1 << 15) | (k1 >> 17)) & 0xffffffff
        k1 = (k1 * c2) & 0xffffffff
        h1 ^= k1

    h1 ^= length
    h1 ^= (h1 >> 16)
    h1 = (h1 * 0x85ebca6b) & 0xffffffff
    h1 ^= (h1 >> 13)
    h1 = (h1 * 0xc2b2ae35) & 0xffffffff
    h1 ^= (h1 >> 16)

    # Convert unsigned 32-bit to signed 32-bit (Shodan / FOFA format)
    if h1 & 0x80000000:
        return -((h1 ^ 0xffffffff) + 1)
    return h1

class DorkBuilder:
    """
    Builds structured, categorized search queries (dorks) for Shodan, FOFA, and Censys.
    """

    @staticmethod
    def normalize_serial(serial_val):
        """Convert hex (e.g. 0x4F89A10B) or decimal serial to both representation formats."""
        if not serial_val:
            return None, None
        s = str(serial_val).strip()
        try:
            if s.lower().startswith("0x"):
                dec_val = int(s, 16)
                hex_val = s.lower()
            else:
                dec_val = int(s)
                hex_val = hex(dec_val).lower()
            return dec_val, hex_val
        except ValueError:
            return None, s

    @staticmethod
    def build_ssl_dorks(domain=None, serial=None, sha256_fp=None, issuer_org=None):
        """Generate comprehensive SSL/TLS certificate dorks."""
        dorks = []
        
        # 1. Domain / SAN Match
        if domain:
            shodan_q = f'ssl:"{domain}"'
            fofa_q = f'cert="{domain}"'
            censys_q = f'services.tls.certificates.leaf_data.subject.common_name: "{domain}"'
            dorks.append({
                "category": "SSL / TLS Certificate",
                "indicator": "Domain / Subject Alternative Name (SAN)",
                "target": domain,
                "confidence_weight": 85,
                "shodan": shodan_q,
                "fofa": fofa_q,
                "censys": censys_q,
                "description": f"Locates IPv4 servers presenting certificates issued to {domain}"
            })

        # 2. Strict Unique Certificate Serial Number
        if serial:
            dec_s, hex_s = DorkBuilder.normalize_serial(serial)
            shodan_q = f"ssl.cert.serial:{dec_s}" if dec_s is not None else f"ssl.cert.serial:{serial}"
            fofa_q = f'cert.serial="{hex_s}"' if hex_s else f'cert.serial="{serial}"'
            censys_q = f'services.tls.certificates.leaf_data.serial_number: "{str(serial).replace("0x", "")}"'
            dorks.append({
                "category": "SSL / TLS Certificate",
                "indicator": "Certificate Serial Number (Unique Crypto ID)",
                "target": str(serial),
                "confidence_weight": 98,
                "shodan": shodan_q,
                "fofa": fofa_q,
                "censys": censys_q,
                "description": "1-to-1 unique cryptographic match across IPv4 space sharing this exact certificate"
            })

        # 3. Certificate SHA-256 Fingerprint
        if sha256_fp:
            clean_fp = sha256_fp.replace(":", "").lower().strip()
            dorks.append({
                "category": "SSL / TLS Certificate",
                "indicator": "Certificate SHA-256 Fingerprint",
                "target": sha256_fp,
                "confidence_weight": 99,
                "shodan": f'ssl.cert.fingerprint:"{clean_fp}"',
                "fofa": f'cert="{clean_fp}"',
                "censys": f'services.tls.certificates.leaf_data.fingerprint: "{clean_fp}"',
                "description": "Exact SHA-256 digest match against globally indexed X.509 certificates"
            })

        # 4. Issuer Organization (for private CA / self-signed tracking)
        if issuer_org:
            dorks.append({
                "category": "SSL / TLS Certificate",
                "indicator": "Certificate Issuer Organization",
                "target": issuer_org,
                "confidence_weight": 40,
                "shodan": f'ssl.cert.issuer.O:"{issuer_org}"',
                "fofa": f'cert.issuer="{issuer_org}"',
                "censys": f'services.tls.certificates.leaf_data.issuer.organization: "{issuer_org}"',
                "description": f"Tracks certificates signed by custom CA entity: {issuer_org}"
            })

        return dorks

    @staticmethod
    def build_status_page_dorks(domain=None, status_type="apache"):
        """Generate dorks for exposed server status and monitoring pages."""
        dorks = []
        if status_type.lower() == "apache":
            if domain:
                dorks.append({
                    "category": "Exposed Status Pages",
                    "indicator": "Apache /server-status VirtualHost Leak",
                    "target": domain,
                    "confidence_weight": 95,
                    "shodan": f'http.title:"Apache Status" "{domain}"',
                    "fofa": f'title="Apache Status" && body="{domain}"',
                    "censys": f'services.http.response.html_title: "Apache Status" and services.http.response.body: "{domain}"',
                    "description": f"Exposed Apache scoreboard leaking internal server name '{domain}' and client IPs"
                })
            dorks.append({
                "category": "Exposed Status Pages",
                "indicator": "Apache /server-status Scoreboard",
                "target": "/server-status",
                "confidence_weight": 80,
                "shodan": 'http.title:"Apache Status" "Scoreboard"',
                "fofa": 'title="Apache Status" && body="Scoreboard"',
                "censys": 'services.http.response.html_title: "Apache Status" and services.http.response.body: "Scoreboard"',
                "description": "Locates open Apache status pages leaking server vitals, vhosts, and PID tables"
            })
        elif status_type.lower() == "nginx":
            dorks.append({
                "category": "Exposed Status Pages",
                "indicator": "Nginx /nginx_status Stub Page",
                "target": "/nginx_status",
                "confidence_weight": 80,
                "shodan": 'http.html:"Active connections" "server accepts handled requests"',
                "fofa": 'body="Active connections" && body="server accepts handled requests"',
                "censys": 'services.http.response.body: "Active connections" and services.http.response.body: "server accepts handled requests"',
                "description": "Open Nginx stub status leaking active connection counts and throughput"
            })
        elif status_type.lower() == "php-fpm":
            dorks.append({
                "category": "Exposed Status Pages",
                "indicator": "PHP-FPM /status Page",
                "target": "/status",
                "confidence_weight": 85,
                "shodan": 'http.html:"accepted conn" "active processes"',
                "fofa": 'body="accepted conn" && body="active processes"',
                "censys": 'services.http.response.body: "accepted conn" and services.http.response.body: "active processes"',
                "description": "Exposed PHP-FPM process pool status leaking server load and script paths"
            })

        return dorks

    @staticmethod
    def build_favicon_dorks(favicon_hash=None, favicon_bytes=None):
        """Generate dorks for Favicon Murmur3 (MMH3) 32-bit hash."""
        dorks = []
        h = None
        if favicon_bytes:
            b64_fav = base64.encodebytes(favicon_bytes)
            h = mmh3_hash(b64_fav)
        elif favicon_hash is not None:
            h = int(favicon_hash)

        if h is not None:
            dorks.append({
                "category": "Asset Fingerprinting",
                "indicator": "Favicon Murmur3 (MMH3) Hash",
                "target": str(h),
                "confidence_weight": 88,
                "shodan": f"http.favicon.hash:{h}",
                "fofa": f'icon_hash="{h}"',
                "censys": f'services.http.response.favicons.hashes: "{h}"',
                "description": "Locates clearnet IPv4 servers hosting the exact identical website icon binary"
            })
        return dorks

    @staticmethod
    def build_jarm_dorks(jarm_hash):
        """Generate dorks for JARM TLS cipher negotiation fingerprint."""
        if not jarm_hash:
            return []
        j = str(jarm_hash).strip()
        return [{
            "category": "Network & TLS Stack",
            "indicator": "JARM TLS Fingerprint",
            "target": j,
            "confidence_weight": 70,
            "shodan": f'ssl.jarm:"{j}"',
            "fofa": f'jarm="{j}"',
            "censys": f'services.jarm.fingerprint: "{j}"',
            "description": "Matches custom TLS cipher negotiation stack characteristics across IPv4 space"
        }]

    @staticmethod
    def build_etag_dorks(etag_value):
        """Generate dorks for Apache / Nginx ETag filesystem inode leaks."""
        if not etag_value:
            return []
        clean_etag = etag_value.replace('"', '').strip()
        parts = clean_etag.split('-')
        inode_prefix = parts[0] if parts else clean_etag

        return [{
            "category": "Server Headers",
            "indicator": "ETag Filesystem Inode Match",
            "target": clean_etag,
            "confidence_weight": 75,
            "shodan": f'http.header:"ETag: \\"{inode_prefix}-"',
            "fofa": f'header="ETag: \\"{inode_prefix}-"',
            "censys": f'services.http.response.headers.etag: "{clean_etag}"',
            "description": f"Tracks unique disk filesystem inode ({inode_prefix}) exposed in HTTP ETag headers"
        }]

    @staticmethod
    def build_custom_header_dorks(headers):
        """Generate dorks for unique or custom HTTP response headers."""
        if not headers:
            return []
        dorks = []
        for name, val in headers.items():
            if not name or not val:
                continue
            clean_name = name.strip()
            clean_val = str(val).strip()
            dorks.append({
                "category": "Server Headers",
                "indicator": f"Custom Header Match ({clean_name})",
                "target": f"{clean_name}: {clean_val}",
                "confidence_weight": 86,
                "shodan": f'http.header:"{clean_name}: {clean_val}"',
                "fofa": f'header="{clean_name}: {clean_val}"',
                "censys": f'services.http.response.headers.{clean_name.lower().replace("-", "_")}: "{clean_val}"',
                "description": f"Matches servers broadcasting unique proprietary header '{clean_name}'"
            })
        return dorks

    @staticmethod
    def build_ssh_dorks(ssh_key=None, ssh_fingerprint=None, ssh_banner=None):
        """Generate dorks for reused SSH host keys and OpenSSH server signatures."""
        dorks = []
        if ssh_key or ssh_fingerprint:
            k = (ssh_key or ssh_fingerprint).strip()
            dorks.append({
                "category": "Host & Remote Access",
                "indicator": "SSH Host Key Fingerprint Match",
                "target": k,
                "confidence_weight": 97,
                "shodan": f'ssh.key:"{k}"',
                "fofa": f'ssh.key="{k}"',
                "censys": f'services.ssh.server_host_key.fingerprint_sha256: "{k}"',
                "description": "1-to-1 match against clearnet servers sharing the identical public SSH host key"
            })
        if ssh_banner:
            b = ssh_banner.strip()
            dorks.append({
                "category": "Host & Remote Access",
                "indicator": "SSH Daemon Banner",
                "target": b,
                "confidence_weight": 65,
                "shodan": f'ssh.banner:"{b}"',
                "fofa": f'ssh.banner="{b}"',
                "censys": f'services.ssh.endpoint_id.raw: "{b}"',
                "description": f"Tracks unique OpenSSH server compilation banner string '{b}'"
            })
        return dorks

    @staticmethod
    def build_html_content_dorks(title=None, body_marker=None):
        """Generate dorks for unique HTML titles and distinctive page markers."""
        dorks = []
        if title:
            t = title.strip()
            dorks.append({
                "category": "Web Content & Markup",
                "indicator": "HTML Page Title Match",
                "target": t,
                "confidence_weight": 82,
                "shodan": f'http.title:"{t}"',
                "fofa": f'title="{t}"',
                "censys": f'services.http.response.html_title: "{t}"',
                "description": f"Searches for clearnet web servers serving pages titled '{t}'"
            })
        if body_marker:
            m = body_marker.strip()
            dorks.append({
                "category": "Web Content & Markup",
                "indicator": "Distinctive Body String / Tracking Code",
                "target": m,
                "confidence_weight": 85,
                "shodan": f'http.html:"{m}"',
                "fofa": f'body="{m}"',
                "censys": f'services.http.response.body: "{m}"',
                "description": f"Tracks unique source code phrases, tracking IDs, or copyright signatures"
            })
        return dorks

    @classmethod
    def generate_all_dorks(cls, profile):
        """
        Compile the full multi-engine suite of Shodan, FOFA, and Censys search dorks.
        Attaches FOFA Base64 encoded payload and direct clickable search URLs.
        """
        all_dorks = []
        domain = profile.get("domain")
        serial = profile.get("cert_serial")
        sha256_fp = profile.get("cert_sha256")
        issuer_org = profile.get("issuer_org")
        favicon_hash = profile.get("favicon_hash")
        favicon_bytes = profile.get("favicon_bytes")
        jarm = profile.get("jarm")
        etag = profile.get("etag")
        has_status = profile.get("has_status_page", False)
        status_type = profile.get("status_type", "apache")
        headers = profile.get("custom_headers")
        ssh_key = profile.get("ssh_key")
        ssh_fingerprint = profile.get("ssh_fingerprint")
        ssh_banner = profile.get("ssh_banner")
        html_title = profile.get("html_title")
        body_marker = profile.get("body_marker")

        # 1. SSL/TLS
        all_dorks.extend(cls.build_ssl_dorks(domain=domain, serial=serial, sha256_fp=sha256_fp, issuer_org=issuer_org))

        # 2. Status Pages
        if has_status or domain:
            all_dorks.extend(cls.build_status_page_dorks(domain=domain, status_type=status_type))

        # 3. Favicon Hash
        if favicon_hash or favicon_bytes:
            all_dorks.extend(cls.build_favicon_dorks(favicon_hash=favicon_hash, favicon_bytes=favicon_bytes))

        # 4. JARM
        if jarm:
            all_dorks.extend(cls.build_jarm_dorks(jarm))

        # 5. ETag
        if etag:
            all_dorks.extend(cls.build_etag_dorks(etag))

        # 6. Custom HTTP Headers
        if headers:
            all_dorks.extend(cls.build_custom_header_dorks(headers))

        # 7. SSH Host Keys
        if ssh_key or ssh_fingerprint or ssh_banner:
            all_dorks.extend(cls.build_ssh_dorks(ssh_key=ssh_key, ssh_fingerprint=ssh_fingerprint, ssh_banner=ssh_banner))

        # 8. HTML Title / Body
        if html_title or body_marker:
            all_dorks.extend(cls.build_html_content_dorks(title=html_title, body_marker=body_marker))

        # Enrich each dork with FOFA Base64 payload and direct search URLs
        for d in all_dorks:
            fofa_raw = d["fofa"]
            qbase64 = base64.b64encode(fofa_raw.encode("utf-8")).decode("utf-8")
            d["fofa_qbase64"] = qbase64
            
            # Direct clickable research links
            shodan_encoded = urllib.parse.quote(d["shodan"])
            d["shodan_search_url"] = f"https://www.shodan.io/search?query={shodan_encoded}"
            d["fofa_search_url"] = f"https://fofa.info/result?qbase64={qbase64}"
            
            if "censys" in d:
                censys_encoded = urllib.parse.quote(d["censys"])
                d["censys_search_url"] = f"https://search.censys.io/search?q={censys_encoded}"

        return all_dorks
