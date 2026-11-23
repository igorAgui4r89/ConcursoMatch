
# ==========================================
# CONCURSOMATCH - ETAPA 16.7.3
# CLASSIFICAÇÃO PRELIMINAR DOS REQUISITOS
# ==========================================

import json
import re
from pathlib import Path


# Localiza a pasta onde está o script.
PASTA = Path(__file__).parent

ORIGEM = PASTA / "vagas_candidatas_fcc.json"
DESTINO = PASTA / "requisitos_classificados.json"


# Carrega os cargos e os trechos do edital.
dados = json.loads(
    ORIGEM.read_text(encoding="utf-8")
)


def limpar_contexto(contexto):
    """
    Remove ruídos administrativos evidentes,
    preservando as linhas relevantes do edital.
    """

    linhas_limpas = []

    for item in contexto:

        texto = item["texto"].strip()

        # Remove informações que aparecem em
        # outra coluna, como taxas de inscrição.
        texto = re.split(
            r"\s{2,}(?=Valor da Taxa|inscri[cç][aã]o:)",
            texto,
            maxsplit=1,
            flags=re.IGNORECASE
        )[0].strip()

        # Ignora linhas exclusivamente administrativas.
        if re.match(
            r"^(Valor da Taxa|inscri[cç][aã]o:)",
            texto,
            re.IGNORECASE
        ):
            continue

        # Ignora cabeçalhos de tabela.
        if re.match(
            r"^(Cargo\s+Remunera[cç][aã]o|Cadastro de Reserva)",
            texto,
            re.IGNORECASE
        ):
            continue

        if texto:
            linhas_limpas.append({
                "linha": item["linha"],
                "texto": texto
            })

    return linhas_limpas


# Expressões que queremos identificar.
PADROES = {
    "ensino_medio": (
        r"\bensino\s+m[ée]dio\b"
    ),

    "formacao_especifica": (
        r"\bcurso(?:\s+de\s+especializa[cç][aã]o"
        r"|\s+t[ée]cnico)\s+em\b"
    ),

    "registro_profissional": (
        r"certificado\s+registrado\s+no\s+"
        r"minist[ée]rio\s+do\s+trabalho"
    ),

    "cnh_categoria_b": (
        r"(?:CNH|carteira\s+nacional\s+de\s+"
        r"habilita[cç][aã]o).{0,90}"
        r"categoria\s*B"
    )
}


resultados = []

for registro in dados["registros"]:

    # Recupera e limpa o contexto do cargo.
    contexto = limpar_contexto(
        registro["contexto_requisitos"]
    )

    # Junta as linhas para identificar frases
    # que foram quebradas durante a extração.
    texto = " ".join(
        item["texto"] for item in contexto
    )

    # Normaliza espaços em branco.
    texto = re.sub(r"\s+", " ", texto)

    # Detecta possíveis requisitos.
    detectados = {}

    for nome, padrao in PADROES.items():

        detectados[nome] = bool(
            re.search(
                padrao,
                texto,
                re.IGNORECASE
            )
        )

    # Monta o registro preliminar.
    resultado = {
        "cargo": registro["cargo"],

        "requisitos_detectados": detectados,

        # Mantém os trechos do edital
        # para revisão posterior.
        "evidencias": contexto,

        "status_validacao": "pendente"
    }

    resultados.append(resultado)


# Salva os resultados.
DESTINO.write_text(
    json.dumps(
        {
            "origem": dados["origem"],
            "registros": resultados
        },
        ensure_ascii=False,
        indent=4
    ),
    encoding="utf-8"
)


# Mostra uma síntese no terminal.
print("\nCLASSIFICAÇÃO PRELIMINAR CONCLUÍDA")

for resultado in resultados:

    print("\nCargo:", resultado["cargo"])

    for requisito, encontrado in (
        resultado["requisitos_detectados"].items()
    ):

        print(f"  {requisito}: {encontrado}")

    print("Validação: pendente")

print("\nArquivo gerado:", DESTINO.name)
