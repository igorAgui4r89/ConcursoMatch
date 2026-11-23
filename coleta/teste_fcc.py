
# ==========================================
# CONCURSOMATCH - ETAPA 16.1
# TESTE DE COLETA DE CONCURSOS DA FCC
# ==========================================

from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse
from urllib.error import HTTPError, URLError
from html.parser import HTMLParser
from pathlib import Path
import json


# Página oficial da Fundação Carlos Chagas.
URL = "https://www.concursosfcc.com.br/"


# Classe responsável por encontrar links HTML.
class ColetorFCC(HTMLParser):

    def __init__(self):
        super().__init__()
        self.links = set()

    def handle_starttag(self, tag, attrs):

        # Analisa apenas elementos <a>.
        if tag != "a":
            return

        atributos = dict(attrs)
        href = atributos.get("href")

        if not href:
            return

        # Transforma links relativos em absolutos.
        link = urljoin(URL, href)
        endereco = urlparse(link)

        # Seleciona páginas individuais de concursos.
        if (
            endereco.hostname == "www.concursosfcc.com.br"
            and endereco.path.startswith("/concursos/")
            and endereco.path.endswith(".html")
        ):
            self.links.add(link.split("?")[0].split("#")[0])


try:

    print("Consultando o site da FCC...")

    # Realiza uma única requisição HTTP.
    requisicao = Request(
        URL,
        headers={
            "User-Agent": "ConcursoMatch-Piloto/0.1"
        }
    )

    with urlopen(requisicao, timeout=15) as resposta:
        html = resposta.read().decode(
            resposta.headers.get_content_charset() or "utf-8",
            errors="replace"
        )

    # Localiza os links no HTML recebido.
    coletor = ColetorFCC()
    coletor.feed(html)

    links = sorted(coletor.links)

    # Salva o resultado em formato JSON.
    destino = Path(__file__).with_name("links_fcc.json")

    destino.write_text(
        json.dumps(
            {
                "fonte": "Fundação Carlos Chagas",
                "pagina_origem": URL,
                "quantidade": len(links),
                "links": links
            },
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    print("\nColeta concluída!")
    print("Concursos encontrados:", len(links))
    print("Arquivo:", destino.name)

    # Exibe até cinco endereços encontrados.
    for link in links[:5]:
        print("-", link)

except (HTTPError, URLError) as erro:
    print("Não foi possível acessar a FCC.")
    print("Detalhes:", erro)
