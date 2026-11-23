
# ==========================================
# CONCURSOMATCH - ETAPA 16.1
# PRIMEIRO TESTE DE COLETA - FGV
# ==========================================

from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse
from urllib.error import HTTPError, URLError
from html.parser import HTMLParser
from pathlib import Path
import json


# Página oficial utilizada no teste.
URL = "https://conhecimento.fgv.br/concursos"


# Identifica links para páginas individuais
# de concursos dentro do HTML.
class ColetorFGV(HTMLParser):

    def __init__(self):
        super().__init__()
        self.links = set()

    def handle_starttag(self, tag, attrs):

        if tag != "a":
            return

        atributos = dict(attrs)
        href = atributos.get("href", "")

        if not href:
            return

        # Converte links relativos em URLs completas.
        link = urljoin(URL, href)
        endereco = urlparse(link)

        # Mantém apenas páginas de concursos da FGV.
        if (
            endereco.hostname == "conhecimento.fgv.br"
            and endereco.path.startswith("/concursos/")
        ):
            self.links.add(
                link.split("?")[0].split("#")[0]
            )


try:

    # Faz uma única consulta à página oficial.
    requisicao = Request(
        URL,
        headers={
            "User-Agent": "ConcursoMatch-Piloto/0.1"
        }
    )

    with urlopen(requisicao, timeout=15) as resposta:
        html = resposta.read().decode(
            "utf-8",
            errors="replace"
        )

    # Analisa o HTML retornado.
    coletor = ColetorFGV()
    coletor.feed(html)

    links = sorted(coletor.links)

    # Salva os links encontrados em um arquivo JSON.
    destino = Path(__file__).with_name(
        "links_fgv.json"
    )

    destino.write_text(
        json.dumps(
            {
                "fonte": "FGV",
                "pagina_origem": URL,
                "links": links
            },
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    print("Coleta de links concluída!")
    print("Links encontrados:", len(links))
    print("Arquivo criado:", destino.name)

    # Mostra uma amostra para conferência.
    for link in links[:5]:
        print("-", link)

except (HTTPError, URLError) as erro:
    print("Não foi possível acessar a página.")
    print("Detalhes:", erro)
    print("Vamos verificar as condições de acesso antes de prosseguir.")
