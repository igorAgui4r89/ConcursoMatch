
# ==========================================
# CONCURSOMATCH - ETAPA 16.6
# DETECÇÃO AUTOMÁTICA DE POSSÍVEIS CARGOS
# ==========================================

import re
import json
from pathlib import Path

# Localiza o texto do edital.
pasta = Path(__file__).parent
arquivo = pasta / "edital_banestes.txt"

# Lê o conteúdo extraído do PDF.
texto = arquivo.read_text(encoding="utf-8")

# Para este primeiro teste, usamos o início
# do edital, onde encontramos a tabela de cargos.
linhas = texto.splitlines()[:150]

candidatos = []

for numero, linha in enumerate(linhas, start=1):

    # Procura valores monetários no formato brasileiro.
    salario = re.search(
        r"R\$\s*[\d.]+,\d{2}",
        linha
    )

    # Procura a jornada semanal, como 30h ou 40h.
    jornada = re.search(
        r"\b\d{1,2}\s*h\b",
        linha,
        re.IGNORECASE
    )

    # Linhas que possuem salário e jornada
    # podem representar registros de cargos.
    if salario and jornada:

        # Recupera o texto anterior ao salário.
        possivel_cargo = linha[:salario.start()].strip()

        candidatos.append({
            "linha": numero,
            "possivel_cargo": possivel_cargo,
            "salario": salario.group(),
            "jornada": jornada.group()
        })

# Apresenta as correspondências para conferência.
print("Possíveis cargos encontrados:", len(candidatos))


# ==========================================
# ETAPA 16.7 - ANALISAR REQUISITOS PRÓXIMOS
# ==========================================

for candidato in candidatos:

    print("\n" + "=" * 55)

    # Exibe os dados identificados automaticamente.
    print("Cargo:", candidato["possivel_cargo"])
    print("Salário:", candidato["salario"])
    print("Jornada:", candidato["jornada"])

    # Recupera o número da linha do cargo.
    numero_linha = candidato["linha"]

    # Seleciona até 15 linhas anteriores
    # e 3 posteriores à linha encontrada.
    inicio = max(0, numero_linha - 16)
    fim = min(len(linhas), numero_linha + 3)

    print("\nTRECHO DO EDITAL PARA ANÁLISE:")

    # Mostra o contexto original do documento
    # para identificarmos escolaridade e requisitos.
    for indice in range(inicio, fim):

        conteudo = linhas[indice].strip()

        # Ignora linhas completamente vazias.
        if conteudo:
            print(f"{indice + 1}: {conteudo}")

    print("=" * 55)

























# ==========================================
# ETAPA 16.7.1 - ASSOCIAR REQUISITOS AOS CARGOS
# ==========================================

registros = []

for candidato in candidatos:

    # Identifica a posição do cargo no texto.
    posicao_cargo = candidato["linha"] - 1

    # Procura, nas 35 linhas anteriores,
    # o cabeçalho da seção de requisitos.
    inicio_requisitos = None

    for indice in range(
        posicao_cargo - 1,
        max(-1, posicao_cargo - 36),
        -1
    ):

        linha_atual = linhas[indice].strip()

        # Exemplos:
        # CARGO DE NÍVEL MÉDIO
        # CARGO DE NÍVEL TÉCNICO
        if re.search(
            r"^CARGOS?\s+DE\s+N[ÍI]VEL\b",
            linha_atual,
            re.IGNORECASE
        ):
            inicio_requisitos = indice
            break

    # Guarda o texto original e o número
    # das linhas, sem inventar exigências.
    contexto = []

    if inicio_requisitos is not None:

        for indice in range(
            inicio_requisitos + 1,
            posicao_cargo
        ):

            conteudo = linhas[indice].strip()

            if conteudo:
                contexto.append({
                    "linha": indice + 1,
                    "texto": conteudo
                })

    # Monta o registro preliminar.
    registro = {
        "cargo": candidato["possivel_cargo"],
        "salario_original": candidato["salario"],
        "jornada": candidato["jornada"],
        "linha_cargo": candidato["linha"],

        # Texto bruto encontrado próximo ao cargo.
        "contexto_requisitos": contexto,

        # Ainda não calculamos a elegibilidade.
        "elegibilidade": "nao_avaliada",

        # Exige validação dos requisitos.
        "status_validacao": "pendente"
    }

    registros.append(registro)


# ==========================================
# SALVAR RESULTADO EM JSON
# ==========================================

destino = pasta / "vagas_candidatas_fcc.json"

destino.write_text(
    json.dumps(
        {
            "origem": "edital_banestes.txt",
            "registros": registros
        },
        ensure_ascii=False,
        indent=4
    ),
    encoding="utf-8"
)

print("\n================================")
print("ASSOCIAÇÃO PRELIMINAR CONCLUÍDA")
print("================================")

for registro in registros:

    print("\nCargo:", registro["cargo"])

    print(
        "Linhas de contexto encontradas:",
        len(registro["contexto_requisitos"])
    )

    print(
        "Situação:",
        registro["status_validacao"]
    )

print("\nArquivo gerado:", destino.name)


