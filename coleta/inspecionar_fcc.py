
# ==========================================
# CONCURSOMATCH - ETAPA 16.2
# IDENTIFICAR EDITAIS E LINKS DIRETOS DA FCC
# ==========================================

import json
import sys

from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse, parse_qs
from urllib.error import HTTPError, URLError
from html.parser import HTMLParser


# Classe que identifica documentos nos links HTML.
class ExtratorDocumentos(HTMLParser):

    def __init__(self):
        super().__init__()
        self.documentos = []
        self.link_atual = None
        self.texto_atual = []
        self.base = ""

    def handle_starttag(self, tag, attrs):

        if tag == "a":
            self.link_atual = dict(attrs).get("href")
            self.texto_atual = []

    def handle_data(self, texto):

        if self.link_atual is not None:
            self.texto_atual.append(texto)

    def handle_endtag(self, tag):

        if tag != "a" or self.link_atual is None:
            return

        titulo = " ".join(self.texto_atual).strip()
        endereco = urljoin(self.base, self.link_atual)
        caminho = urlparse(endereco).path.lower()

        # Seleciona arquivos PDF ou links de editais.
        if caminho.endswith(".pdf") or "edital" in titulo.lower():

            if urlparse(endereco).scheme in ("http", "https"):
                self.documentos.append({
                    "titulo": titulo,
                    "url": endereco
                })

        self.link_atual = None
        self.texto_atual = []

    def analisar(self, html, base):

        self.base = base
        self.feed(html)


# ==========================================
# LEITURA DOS LINKS COLETADOS ANTERIORMENTE
# ==========================================

pasta = Path(__file__).parent

dados = json.loads(
    (pasta / "links_fcc.json").read_text(
        encoding="utf-8"
    )
)


# ==========================================
# ETAPA 16.8 - ESCOLHER QUAL CONCURSO ANALISAR
# ==========================================

# Lê o número informado no terminal.
# Se nenhum número for informado, utiliza o primeiro.
indice = int(sys.argv[1]) if len(sys.argv) > 1 else 0

# Impede selecionar um concurso inexistente.
if indice < 0 or indice >= len(dados["links"]):
    raise SystemExit("Índice de concurso inválido.")

# Seleciona a página correspondente.
url = dados["links"][indice]


print("Inspecionando:", url)


# ==========================================
# CONSULTA DA PÁGINA
# ==========================================

try:

    # Solicita a página oficial do concurso.
    requisicao = Request(
        url,
        headers={"User-Agent": "ConcursoMatch-Piloto/0.1"}
    )

    with urlopen(requisicao, timeout=15) as resposta:

        html = resposta.read().decode(
            resposta.headers.get_content_charset() or "utf-8",
            errors="replace"
        )

    # Identifica os documentos.
    extrator = ExtratorDocumentos()
    extrator.analisar(html, url)

    # Remove documentos repetidos.
    documentos = list({
        item["url"]: item
        for item in extrator.documentos
    }.values())

    print("Documentos encontrados:", len(documentos))

    # ==========================================
    # IDENTIFICA OS LINKS DIRETOS DOS PDFs
    # ==========================================

    for documento in documentos[:10]:

        # Recupera o link encontrado.
        link = documento["url"]

        # Separa os componentes da URL.
        endereco = urlparse(link)

        # Identifica os parâmetros da URL.
        parametros = parse_qs(endereco.query)

        # Se houver um parâmetro "file",
        # recupera o endereço direto do PDF.
        link_pdf = parametros.get("file", [link])[0]

        print("\nTítulo:", documento["titulo"])
        print("PDF direto:", link_pdf)


# Trata possíveis problemas de conexão.
except (HTTPError, URLError) as erro:

    print("Erro ao consultar a página:", erro)
