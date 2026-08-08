#!/bin/bash
# ============================================================================
# init-firewall.sh
# Firewall default-deny para o dev container.
# Bloqueia TODA saida de rede e libera apenas uma allowlist de dominios.
# Baseado na referencia oficial do Claude Code (anthropics/claude-code).
# ============================================================================
set -euo pipefail
IFS=$'\n\t'

echo "[firewall] Iniciando configuracao..."

# --- Limpa regras e ipsets antigos --------------------------------------------
iptables -F
iptables -X
iptables -t nat -F 2>/dev/null || true
iptables -t nat -X 2>/dev/null || true
iptables -t mangle -F 2>/dev/null || true
iptables -t mangle -X 2>/dev/null || true
ipset destroy allowed-domains 2>/dev/null || true

# --- Permite DNS, SSH e localhost ANTES de qualquer bloqueio ------------------
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT  -p udp --sport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT
iptables -A INPUT  -p tcp --sport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT  -p tcp --sport 22 -j ACCEPT
iptables -A INPUT  -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# --- Modo: OUTPUT livre (saida sem restricao) ----------------------------------
# A politica abaixo e default-allow na saida. O container pode acessar
# qualquer host externo. Apenas entrada nao solicitada e bloqueada.
# Para voltar ao modo restrito (allowlist), comente a linha abaixo e
# descomente o bloco ALLOWED_DOMAINS + ipset mais abaixo.
OPEN_OUTPUT=true

# --- Dominios de referencia (usados apenas no modo restrito / allowlist) ------
# >>> Nao tem efeito enquanto OPEN_OUTPUT=true <<<
ALLOWED_DOMAINS=(
    # Claude Code / Anthropic (necessarios para o Claude funcionar)
    "api.anthropic.com"
    "statsig.anthropic.com"
    "sentry.io"

    # Gerenciadores de pacote
    "registry.npmjs.org"
    "pypi.org"
    "files.pythonhosted.org"

    # --- Resolutores e DOI -------------------------------------------------------
    "doi.org"
    "dx.doi.org"

    # --- Agregadores / buscadores de literatura ----------------------------------
    "api.crossref.org"
    "doi.crossref.org"
    "api.semanticscholar.org"
    "pdfs.semanticscholar.org"
    "www.semanticscholar.org"
    "api.openalex.org"
    "openalex.org"
    "api.unpaywall.org"
    "core.ac.uk"
    "api.core.ac.uk"
    "lens.org"
    "api.lens.org"
    "base-search.net"
    "dimensions.ai"
    "app.dimensions.ai"
    "opencitations.net"
    "api.opencitations.net"

    # --- arXiv -------------------------------------------------------------------
    "arxiv.org"
    "export.arxiv.org"
    "ar5iv.labs.arxiv.org"

    # --- PubMed / NCBI -----------------------------------------------------------
    "eutils.ncbi.nlm.nih.gov"
    "pubmed.ncbi.nlm.nih.gov"
    "pmc.ncbi.nlm.nih.gov"
    "ncbi.nlm.nih.gov"
    "europepmc.org"
    "www.europepmc.org"

    # --- Zenodo / HAL / preprints ------------------------------------------------
    "zenodo.org"
    "biorxiv.org"
    "www.biorxiv.org"
    "medrxiv.org"
    "www.medrxiv.org"
    "ssrn.com"
    "papers.ssrn.com"
    "hal.science"
    "api.archives-ouvertes.fr"
    "hal.archives-ouvertes.fr"
    "osf.io"
    "api.osf.io"
    "chemrxiv.org"
    "edarxiv.org"
    "psyarxiv.com"
    "eartharxiv.org"
    "techrxiv.org"

    # --- IEEE --------------------------------------------------------------------
    "ieeexplore.ieee.org"
    "ieee.org"

    # --- ACM Digital Library -----------------------------------------------------
    "dl.acm.org"
    "acm.org"
    "aclanthology.org"

    # --- Springer / Nature -------------------------------------------------------
    "link.springer.com"
    "springer.com"
    "springeropen.com"
    "nature.com"
    "www.nature.com"
    "api.springernature.com"

    # --- Elsevier / ScienceDirect / Scopus ---------------------------------------
    "sciencedirect.com"
    "www.sciencedirect.com"
    "api.elsevier.com"
    "scopus.com"
    "www.scopus.com"

    # --- Wiley -------------------------------------------------------------------
    "onlinelibrary.wiley.com"
    "wiley.com"

    # --- Taylor & Francis --------------------------------------------------------
    "tandfonline.com"
    "www.tandfonline.com"

    # --- Cambridge University Press ----------------------------------------------
    "cambridge.org"
    "www.cambridge.org"

    # --- Oxford University Press -------------------------------------------------
    "academic.oup.com"
    "oup.com"

    # --- SAGE --------------------------------------------------------------------
    "journals.sagepub.com"
    "sagepub.com"

    # --- Science (AAAS) ----------------------------------------------------------
    "science.org"
    "www.science.org"

    # --- Open access publishers --------------------------------------------------
    "plos.org"
    "journals.plos.org"
    "plosone.org"
    "frontiersin.org"
    "www.frontiersin.org"
    "biomedcentral.com"
    "www.biomedcentral.com"
    "mdpi.com"
    "www.mdpi.com"
    "peerj.com"
    "www.peerj.com"
    "f1000research.com"
    "elifesciences.org"
    "www.elifesciences.org"
    "pensoft.net"
    "riojournal.com"

    # --- Web of Science / Clarivate ----------------------------------------------
    "webofscience.com"
    "www.webofscience.com"
    "wos.clarivate.com"
    "clarivate.com"

    # --- JSTOR -------------------------------------------------------------------
    "jstor.org"
    "www.jstor.org"

    # --- ResearchGate / Academia -------------------------------------------------
    "researchgate.net"
    "www.researchgate.net"
    "academia.edu"
    "www.academia.edu"

    # --- Google Scholar ----------------------------------------------------------
    "scholar.google.com"

    # --- NASA ADS (astronomia / fisica) ------------------------------------------
    "ui.adsabs.harvard.edu"
    "api2.adsabs.harvard.edu"

    # --- DBLP (ciencia da computacao) --------------------------------------------
    "dblp.org"
    "dblp.uni-trier.de"
    "dblp2.uni-trier.de"

    # --- Computer vision / ML / AI -----------------------------------------------
    "openaccess.thecvf.com"
    "openreview.net"
    "api.openreview.net"
    "paperswithcode.com"
    "huggingface.co"

    # --- SciELO / bases latino-americanas ----------------------------------------
    "scielo.br"
    "www.scielo.br"
    "scielo.org"
    "www.scielo.org"
    "redalyc.org"
    "www.redalyc.org"
    "dialnet.unirioja.es"
    "latindex.org"
    "www.latindex.org"

    # --- Periodicos CAPES (proxy de acesso para pesquisadores brasileiros) --------
    "periodicos.capes.gov.br"
    "www.periodicos.capes.gov.br"
    "sucupira.capes.gov.br"
    "capes.gov.br"

    # --- Repositorios institucionais brasileiros / IBICT -------------------------
    "ibict.br"
    "bdtd.ibict.br"
    "oasisbr.ibict.br"
    "dominiopublico.gov.br"

    # --- ORCID -------------------------------------------------------------------
    "orcid.org"
    "pub.orcid.org"
    "api.orcid.org"

    # --- Plataforma Lattes / CNPq ------------------------------------------------
    "lattes.cnpq.br"
    "buscatextual.cnpq.br"
    "cnpq.br"
    "www.cnpq.br"

    # --- Saude / medicina --------------------------------------------------------
    "cochranelibrary.com"
    "www.cochranelibrary.com"
    "clinicaltrials.gov"
    "who.int"
    "www.who.int"

    # --- Educacao ----------------------------------------------------------------
    "eric.ed.gov"
    "psycnet.apa.org"
    "apa.org"

    # --- Overleaf (compilacao via git) -------------------------------------------
    # "www.overleaf.com"
    # "git.overleaf.com"
)

for domain in "${ALLOWED_DOMAINS[@]}"; do
    echo "[firewall] Resolvendo $domain ..."
    ips=$(dig +short A "$domain" 2>/dev/null || true)
    for ip in $ips; do
        # adiciona apenas linhas que sejam IPv4
        if [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            ipset add allowed-domains "$ip" 2>/dev/null || true
        fi
    done
done

# --- Permite a rede do host (necessario para o VS Code Server) ----------------
HOST_IP=$(ip route | grep default | awk '{print $3}' | head -n1 || true)
if [ -n "$HOST_IP" ]; then
    HOST_NETWORK=$(echo "$HOST_IP" | sed 's/\.[0-9]*$/.0\/24/')
    iptables -A INPUT  -s "$HOST_NETWORK" -j ACCEPT
    iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT
    echo "[firewall] Rede do host liberada: $HOST_NETWORK"
fi

# --- Politica de saida --------------------------------------------------------
iptables -P FORWARD DROP

if [ "${OPEN_OUTPUT:-false}" = "true" ]; then
    # Modo aberto: INPUT bloqueado por padrao (exceto respostas), OUTPUT livre
    iptables -P INPUT  DROP
    iptables -P OUTPUT ACCEPT
    iptables -A INPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
    echo "[firewall] Modo ABERTO: saida livre, entrada bloqueada."
else
    # Modo restrito: allowlist de dominios
    iptables -P INPUT   DROP
    iptables -P OUTPUT  DROP
    iptables -A INPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
    iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
    iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT
    echo "[firewall] Modo RESTRITO: saida apenas para allowlist."
fi

echo "[firewall] Configuracao concluida. Saida liberada somente para a allowlist."

# --- Verificacao rapida -------------------------------------------------------
echo "[firewall] Teste: api.anthropic.com deve responder..."
if curl -s --max-time 5 -o /dev/null -w "%{http_code}" https://api.anthropic.com/ | grep -qE '^[0-9]'; then
    echo "[firewall] OK: trafego para a allowlist funciona."
else
    echo "[firewall] AVISO: nao consegui validar api.anthropic.com (pode ser normal)."
fi

echo "[firewall] Teste: example.com deve ser BLOQUEADO..."
if curl -s --max-time 5 -o /dev/null https://example.com 2>/dev/null; then
    echo "[firewall] ATENCAO: example.com respondeu, o bloqueio pode nao estar ativo!"
else
    echo "[firewall] OK: example.com bloqueado, como esperado."
fi
