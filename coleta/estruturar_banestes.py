
# ==========================================
# CONCURSOMATCH - ETAPA 16.5
# ESTRUTURAÇÃO DOS CARGOS DO BANESTES
# ==========================================

import json
import re
from pathlib import Path


# Identifica a pasta do próprio script.
PASTA = Path(__file__).parent

# Texto extraído anteriormente do edital.
ARQUIVO_TEXTO = PASTA / "edital_banestes.txt"

# Arquivo que será gerado.
ARQUIVO_JSON = PASTA / "vagas_banestes.json"


# Regras específicas verificadas no edital.
# Por enquanto, os requisitos são cadastrados
# neste modelo de teste. Vamos automatizar
# sua extração em etapas posteriores.
CARGOS = [
    {
        "nome": "Técnico Bancário",
        "area": "Bancária e Financeira",
        "escolaridade": "Ensino médio completo",
        "formacao_especifica": False,
        "requisitos_adicionais": []
    },
    {
        "nome": "Técnico em Segurança do Trabalho",
        "area": "Segurança do Trabalho",
        "escolaridade": "Ensino médio completo",
        "formacao_especifica": True,
        "requisitos_adicionais": [
            "Formação específica em Segurança do Trabalho",
            "Certificado registrado no Ministério do Trabalho e Emprego",
            "CNH categoria B",
            "Disponibilidade para viagens"
        ]
    }
]


# Lê o arquivo de texto do edital.
texto = ARQUIVO_TEXTO.read_text(
    encoding="utf-8"
)

# Analisa inicialmente apenas a primeira página,
# onde fica a tabela de cargos e remunerações.
primeira_pagina = texto.split("\f")[0]

vagas = []


for cargo in CARGOS:

    # Procura a linha da tabela que contém
    # o nome do cargo e o valor da remuneração.
    linhas = [
        linha
        for linha in primeira_pagina.splitlines()
        if cargo["nome"].casefold() in linha.casefold()
        and "R$" in linha
    ]

    # Não inventa valores quando não encontra
    # exatamente uma linha correspondente.
    if len(linhas) != 1:
        print("Não foi possível confirmar:", cargo["nome"])
        continue

    linha = linhas[0]

    # Extrai valores no formato brasileiro.
    salario = re.search(
        r"R\$\s*([\d.]+,\d{2})",
        linha
    )

    # Extrai a jornada semanal.
    jornada = re.search(
        r"\b(\d{2})\s*h\b",
        linha,
        re.IGNORECASE
    )

    if not salario or not jornada:
        print("Dados incompletos:", cargo["nome"])
        continue

    # Converte o salário para formato decimal
    # compatível com o banco de dados.
    salario_formatado = (
        salario.group(1)
        .replace(".", "")
        .replace(",", ".")
    )

    # Monta o registro estruturado.
    vaga = {
        "cargo": cargo["nome"],
        "area": cargo["area"],
        "salario": salario_formatado,
        "jornada_semanal": int(jornada.group(1)),
        "escolaridade": cargo["escolaridade"],
        "formacao_especifica": cargo["formacao_especifica"],
        "requisitos_adicionais": cargo["requisitos_adicionais"],
        "tipo_vaga": "Cadastro de reserva",
        "status_validacao": "Pendente de revisão"
    }

    vagas.append(vaga)


# Só gera o JSON se os dois cargos
# forem identificados corretamente.
if len(vagas) != len(CARGOS):
    raise SystemExit(
        "Extração incompleta. JSON não gerado."
    )


# Estrutura final do concurso.
resultado = {
    "concurso": "Banestes 2026",
    "banca": "FCC",
    "edital": "01/2026 - Retificado",
    "fonte": "https://www.concursosfcc.com.br/concursos/banes126/index.html",
    "vagas": vagas
}


# Grava os dados em JSON.
ARQUIVO_JSON.write_text(
    json.dumps(
        resultado,
        ensure_ascii=False,
        indent=4
    ),
    encoding="utf-8"
)


print("Extração concluída!")
print("Cargos encontrados:", len(vagas))
print("Arquivo criado:", ARQUIVO_JSON.name)

for vaga in vagas:
    print(
        f"- {vaga['cargo']} | "
        f"R$ {vaga['salario']} | "
        f"{vaga['jornada_semanal']}h"
    )
