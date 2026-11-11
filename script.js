// =========================================================
// CONCURSOMATCH
// Primeiro motor de matching do MVP
// =========================================================
//
// IMPORTANTE:
// Todos os concursos deste arquivo são DADOS FICTÍCIOS.
// Eles existem apenas para testar a lógica do projeto.
//
// Regras desta versão:
// - filtros opcionais vazios = critério indiferente;
// - se o usuário marcou um filtro, o concurso precisa atender;
// - cargos desejados NÃO eliminam resultados: eles dão bônus;
// - formações ajudam a compor a compatibilidade;
// - o resultado mostra os motivos do match.



// =========================================================
// CONEXÃO COM O SUPABASE
// =========================================================

// Endereço do projeto
const SUPABASE_URL =
    "https://ohoxtfmnkaihzmzcfjlp.supabase.co";

// Chave pública de acesso
const SUPABASE_KEY =
    "sb_publishable_sndA8M3INb4AxiVsfiW1BA_Zkt2iTS1";

// Inicializa o cliente Supabase
const clienteSupabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================================================
// CONCURSOMATCH
// ADAPTAÇÃO DOS DADOS DO SUPABASE
// =========================================================

// Converte a sigla do estado para a região brasileira.
function identificarRegiao(estado) {

    const regioes = {
        AC: "Norte",
        AP: "Norte",
        AM: "Norte",
        PA: "Norte",
        RO: "Norte",
        RR: "Norte",
        TO: "Norte",

        AL: "Nordeste",
        BA: "Nordeste",
        CE: "Nordeste",
        MA: "Nordeste",
        PB: "Nordeste",
        PE: "Nordeste",
        PI: "Nordeste",
        RN: "Nordeste",
        SE: "Nordeste",

        DF: "Centro-Oeste",
        GO: "Centro-Oeste",
        MT: "Centro-Oeste",
        MS: "Centro-Oeste",

        ES: "Sudeste",
        MG: "Sudeste",
        RJ: "Sudeste",
        SP: "Sudeste",

        PR: "Sul",
        RS: "Sul",
        SC: "Sul"
    };

    // Retorna a região ou "Não informada".
    return regioes[estado?.toUpperCase()] ??
        "Não informada";
}


// Converte uma vaga do banco para o formato
// utilizado pelo algoritmo atual.
function adaptarVagaSupabase(vaga) {

    // Padroniza os nomes das áreas.
    const areas = {
        "Tecnologia": "Tecnologia da Informação",
        "Administracao": "Administrativa",
        "Administração": "Administrativa"
    };

    // Padroniza o nível de escolaridade.
    const escolaridades = {
        "Tecnico": "Técnico",
        "Técnico": "Técnico",
        "Superior": "Superior"
    };

    // Padroniza o regime de contratação.
    const regimes = {
        "Estatutario": "Estatutário",
        "Estatutário": "Estatutário",
        "CLT": "CLT",
        "Temporario": "Temporário"
    };

    // Obtém o texto da formação exigida.
    const formacao = vaga.formacao_exigida ?? "";

    return {

        // Mantém o identificador original do banco.
        id: vaga.id,

  
// Categoria utilizada pelo filtro de instituições.
// Ex.: "Secretarias Estaduais".
institution:
    vaga.concursos?.categoria_instituicao ?? "",

// Nome completo do órgão responsável.
// Será utilizado na apresentação do resultado.
agency:
    vaga.concursos?.instituicao ?? "",


        // Cargo oferecido.
        role: vaga.cargo,

        // Área profissional.
        area: areas[vaga.area] ?? vaga.area,

        // Converte MG, RJ, SP etc. em regiões.
        region: identificarRegiao(vaga.estado),

        // Esfera administrativa.
        governmentLevel:
            vaga.concursos?.esfera ?? "",

        // Regime de contratação.
        employmentRegime:
            regimes[vaga.regime] ?? vaga.regime,

        // Escolaridade exigida.
        educationLevel:
            escolaridades[vaga.escolaridade] ??
            vaga.escolaridade,

        // Converte o salário para número.
        salary: vaga.salario === null
            ? null
            : Number(vaga.salario),

        // Palavras utilizadas pelo algoritmo
        // atual para comparar formações.
        // Esta é uma aproximação inicial.
        formationKeywords: formacao
            ? [formacao]
            : [],

        // Informações adicionais do Supabase.
        city: vaga.cidade,
        state: vaga.estado,
        contestName: vaga.concursos?.nome ?? ""

    };
}





const educationList = document.getElementById("educationList");
const addEducationButton = document.getElementById("addEducation");

const targetRoleList = document.getElementById("targetRoleList");
const addTargetRoleButton = document.getElementById("addTargetRole");

const profileForm = document.getElementById("profileForm");
const formMessage = document.getElementById("formMessage");

const resultsGrid = document.getElementById("resultsGrid");
const resultsSummary = document.getElementById("resultsSummary");



// =========================================================
// 2. CAMPOS DINÂMICOS
// =========================================================

function updateRemoveButtons(listElement) {
    const rows = listElement.querySelectorAll("[data-dynamic-row]");

    rows.forEach((row) => {
        const removeButton = row.querySelector("[data-remove-row]");

        // Mantemos pelo menos uma linha disponível.
        removeButton.disabled = rows.length === 1;
    });
}


function addDynamicRow({
    listElement,
    inputName,
    inputIdPrefix,
    labelText,
    placeholder
}) {
    const rowCount =
        listElement.querySelectorAll("[data-dynamic-row]").length + 1;

    const row = document.createElement("div");
    row.className = "dynamic-row";
    row.dataset.dynamicRow = "";

    const field = document.createElement("div");
    field.className = "field field-grow";

    const label = document.createElement("label");
    label.setAttribute("for", `${inputIdPrefix}-${rowCount}`);
    label.textContent = labelText;

    const input = document.createElement("input");
    input.id = `${inputIdPrefix}-${rowCount}`;
    input.name = inputName;
    input.type = "text";
    input.placeholder = placeholder;
    input.autocomplete = "off";

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.type = "button";
    removeButton.dataset.removeRow = "";
    removeButton.textContent = "Remover";
    removeButton.setAttribute(
        "aria-label",
        `Remover ${labelText.toLowerCase()}`
    );


// Adiciona o campo de texto à nova linha.
field.append(label, input);

// ==========================================
// NÍVEL ACADÊMICO DAS FORMAÇÕES
// ==========================================

// Verifica se estamos criando uma linha de formação.
// A função também é utilizada para cargos desejados,
// portanto não devemos adicionar níveis nesses campos.
if (listElement === educationList) {

    // Cria o contêiner do novo seletor.
    const levelField = document.createElement("div");

    levelField.className =
        "field education-level-field";

    // Cria o rótulo do seletor.
    const levelLabel = document.createElement("label");

    levelLabel.textContent = "Nível da formação";

    levelLabel.setAttribute(
        "for",
        `education-level-${rowCount}`
    );

    // Cria o elemento SELECT.
    const levelSelect = document.createElement("select");

    levelSelect.id = `education-level-${rowCount}`;
    levelSelect.name = "educationDegree[]";

    // Define as opções disponíveis.
    const niveis = [
        ["Não informado", "Selecione o nível"],
        ["Técnico", "Técnico"],
        ["Tecnólogo", "Tecnólogo"],
        ["Bacharelado", "Bacharelado"],
        ["Licenciatura", "Licenciatura"],
        ["Especialização", "Especialização"],
        ["Mestrado", "Mestrado"],
        ["Doutorado", "Doutorado"],
        ["Outro", "Outro"]
    ];

    // Transforma cada opção em um elemento OPTION.
    niveis.forEach(([valor, descricao]) => {

        const option = document.createElement("option");

        option.value = valor;
        option.textContent = descricao;

        levelSelect.appendChild(option);
    });

    // Acrescenta o seletor à nova linha.
    levelField.append(levelLabel, levelSelect);

    // Monta a linha com formação, nível e remoção.
    row.append(field, levelField, removeButton);

} else {

    // Para cargos desejados, preserva
    // exatamente o comportamento anterior.
    row.append(field, removeButton);

}

    listElement.appendChild(row);

    updateRemoveButtons(listElement);

    input.focus();
}


addEducationButton.addEventListener("click", () => {
    addDynamicRow({
        listElement: educationList,
        inputName: "education[]",
        inputIdPrefix: "education",
        labelText: "Formação",
        placeholder: "Ex.: Análise e Desenvolvimento de Sistemas"
    });
});


addTargetRoleButton.addEventListener("click", () => {
    addDynamicRow({
        listElement: targetRoleList,
        inputName: "targetRole[]",
        inputIdPrefix: "target-role",
        labelText: "Cargo desejado",
        placeholder: "Ex.: Analista de Tecnologia da Informação"
    });
});


document.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-row]");

    if (!removeButton) {
        return;
    }

    const row = removeButton.closest("[data-dynamic-row]");
    const listElement = row.parentElement;

    row.remove();

    updateRemoveButtons(listElement);
});


// =========================================================
// 3. FUNÇÕES AUXILIARES
// =========================================================

// Normaliza texto para facilitar comparações.
// Ex.: "Tecnologia da Informação" -> "tecnologia da informacao"
function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


// Converte um campo numérico opcional.
// Campo vazio vira null, e não zero.
function optionalNumber(value) {
    if (value === null || String(value).trim() === "") {
        return null;
    }

    return Number(value);
}


// Formata salários como moeda brasileira.
function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0
    }).format(value);
}


// Retorna true quando o usuário não ativou o filtro
// OU quando o valor do concurso está entre os selecionados.
function passesListFilter(selectedValues, contestValue) {
    if (selectedValues.length === 0) {
        return true;
    }

    const normalizedContestValue = normalizeText(contestValue);

    return selectedValues.some(
        (value) => normalizeText(value) === normalizedContestValue
    );
}


// Área possui um caso especial:
// "Jurídica e Direito" também conversa com alguns cargos de Tribunais.
function passesInterestFilter(selectedInterests, contest) {
    if (selectedInterests.length === 0) {
        return true;
    }

    const area = normalizeText(contest.area);

    return selectedInterests.some((interest) => {
        const normalizedInterest = normalizeText(interest);

        if (normalizedInterest === area) {
            return true;
        }

        if (
            normalizedInterest === "juridica e direito" &&
            area === "tribunais"
        ) {
            return true;
        }

        return false;
    });
}


// Verifica se o salário passa pela faixa definida.
// Se um dos extremos estiver vazio, somente o outro é considerado.
function passesSalaryFilter(salaryRange, contestSalary) {
    const { min, max } = salaryRange;

    if (min === null && max === null) {
        return true;
    }

    if (min !== null && contestSalary < min) {
        return false;
    }

    if (max !== null && contestSalary > max) {
        return false;
    }

    return true;
}


// Formação não é um filtro textual rígido nesta fase.
// Ela é usada para pontuação e transparência.
function matchesFormation(profileEducations, contest) {
    if (contest.formationKeywords.includes("*")) {
        return {
            matched: true,
            reason: "O cargo demonstrativo aceita formação superior ampla."
        };
    }

    if (profileEducations.length === 0) {
        return {
            matched: false,
            reason: null
        };
    }

    const normalizedEducations =
        profileEducations.map(normalizeText);

    const matched = contest.formationKeywords.some((keyword) => {
        const normalizedKeyword = normalizeText(keyword);

        return normalizedEducations.some(
            (education) => education.includes(normalizedKeyword)
        );
    });

    return {
        matched,
        reason: matched
            ? "Sua formação possui correspondência com a área exigida no exemplo."
            : null
    };
}


// Cargo desejado funciona como bônus, nunca como filtro.
function matchesTargetRole(targetRoles, contestRole) {
    if (targetRoles.length === 0) {
        return false;
    }

    const normalizedContestRole = normalizeText(contestRole);

    return targetRoles.some((targetRole) => {
        const normalizedTargetRole = normalizeText(targetRole);

        return (
            normalizedContestRole.includes(normalizedTargetRole) ||
            normalizedTargetRole.includes(normalizedContestRole)
        );
    });
}


// =========================================================
// 4. FILTROS
// =========================================================

// Aplica somente filtros que o usuário realmente ativou.
// Lista vazia = "tanto faz".
function passesActiveFilters(profile, contest) {
    return (
        passesInterestFilter(profile.interests, contest) &&
        passesListFilter(profile.regions, contest.region) &&
        passesListFilter(profile.institutions, contest.institution) &&
        passesListFilter(
            profile.governmentLevels,
            contest.governmentLevel
        ) &&
        passesListFilter(
            profile.employmentRegimes,
            contest.employmentRegime
        ) &&
        passesListFilter(
            profile.educationLevels,
            contest.educationLevel
        ) &&
        passesSalaryFilter(profile.salaryRange, contest.salary)
    );
}


// =========================================================
// 5. PONTUAÇÃO DE COMPATIBILIDADE
// =========================================================
//
// O percentual é calculado apenas com critérios ativos.
// Assim, deixar um filtro vazio não reduz a pontuação.

function calculateCompatibility(profile, contest) {
    let points = 0;
    let possiblePoints = 0;

    const reasons = [];

    // Formação recebe peso alto quando o usuário informou formação.
    // Para vagas do Supabase, não pontuamos
// formação até validar os requisitos do edital.
if (
    profile.educations.length > 0 &&
    !contest.fromSupabase
) {
        possiblePoints += 35;

        const formationResult =
            matchesFormation(profile.educations, contest);

        if (formationResult.matched) {
            points += 35;
            reasons.push(formationResult.reason);
        }
    }

    // Área de interesse.
    if (profile.interests.length > 0) {
        possiblePoints += 20;

        if (passesInterestFilter(profile.interests, contest)) {
            points += 20;
            reasons.push("Área alinhada aos seus interesses.");
        }
    }

    // Região.
    if (profile.regions.length > 0) {
        possiblePoints += 10;
        points += 10;
        reasons.push(`Localizado na região ${contest.region}.`);
    }

    // Instituição.
    if (profile.institutions.length > 0) {
        possiblePoints += 8;
        points += 8;
        reasons.push("Instituição dentro das suas preferências.");
    }

    // Esfera.
    if (profile.governmentLevels.length > 0) {
        possiblePoints += 7;
        points += 7;
        reasons.push(`Esfera ${contest.governmentLevel.toLowerCase()}.`);
    }

    // Regime.
    if (profile.employmentRegimes.length > 0) {
        possiblePoints += 5;
        points += 5;
        reasons.push(`Regime ${contest.employmentRegime}.`);
    }

    // Escolaridade da vaga.
    if (profile.educationLevels.length > 0) {
        possiblePoints += 5;
        points += 5;
        reasons.push(
            `Vaga de nível ${contest.educationLevel.toLowerCase()}.`
        );
    }

    // Salário.
    if (
        profile.salaryRange.min !== null ||
        profile.salaryRange.max !== null
    ) {
        possiblePoints += 10;
        points += 10;
        reasons.push(
            `Salário de ${formatCurrency(contest.salary)} dentro da faixa escolhida.`
        );
    }

    // Cargo desejado: bônus, mas não entra como filtro.
    const targetRoleMatched =
        matchesTargetRole(profile.targetRoles, contest.role);

    if (profile.targetRoles.length > 0) {
        possiblePoints += 15;

        if (targetRoleMatched) {
            points += 15;
            reasons.push("O cargo corresponde ao cargo que você quer acompanhar.");
        }
    }

    // Se o usuário não ativou nenhum critério que gere pontuação,
    // apresentamos uma compatibilidade neutra.
    if (possiblePoints === 0) {
        return {
            score: 50,
            reasons: [
                "Nenhum filtro foi ativado; o concurso foi exibido como oportunidade ampla."
            ]
        };
    }

    const score = Math.round((points / possiblePoints) * 100);

    return {
        score,
        reasons
    };
}



/* ==========================================
   ETAPA 15.1 - PROTEÇÃO CONTRA HTML INDEVIDO
   ========================================== */

// Converte caracteres especiais em entidades HTML.
// Assim, textos provenientes do banco não são
// interpretados como elementos HTML pelo navegador.

function escapeHtml(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        (caractere) => {

            const entidades = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entidades[caractere];
        }
    );
}















// =========================================================
// 6. RENDERIZAÇÃO DOS RESULTADOS
// =========================================================

function createResultCard(result) {
    const { contest, score, reasons } = result;

    const card = document.createElement("article");
    card.className = "result-card";

    const reasonsHtml = reasons
        .slice(0, 5)
        .map((reason) => `<li>${escapeHtml(reason)}</li>`)
        .join("");

    card.innerHTML = `
        <div class="result-card-top">
            <div class="result-card-title">
                <span>${escapeHtml(contest.agency)}</span>
                <h3>${escapeHtml(contest.role)}</h3>
            </div>

            <div class="score-badge" aria-label="${score}% de compatibilidade">
                <strong>${score}%</strong>
                <span>match</span>
            </div>
        </div>

        <div class="result-meta">
            <div class="result-meta-item">
                <span>Área</span>
                <strong>${escapeHtml(contest.area)}</strong>
            </div>

            <div class="result-meta-item">
                <span>Salário</span>
                <strong>${formatCurrency(contest.salary)}</strong>
            </div>

            <div class="result-meta-item">
                <span>Região</span>
                <strong>${escapeHtml(contest.region)}</strong>
            </div>

            <div class="result-meta-item">
                <span>Esfera / Regime</span>
                <strong>	${escapeHtml(contest.governmentLevel)} • ${escapeHtml(contest.employmentRegime)}</strong>
            </div>
        </div>

        <ul class="match-reasons">
            ${reasonsHtml}
        </ul>

        <div class="result-card-footer">
            Dado fictício criado exclusivamente para testar o algoritmo do MVP.
        </div>
    `;

    return card;
}


// Recebe o perfil e a lista de vagas carregadas do Supabase.
function renderResults(profile, concursosDoBanco) {
    resultsGrid.innerHTML = "";

    // Primeiro aplicamos os filtros ativos.
    const filteredContests = concursosDoBanco.filter(
        (contest) => passesActiveFilters(profile, contest)
    );

    // Depois calculamos o score e ordenamos do maior para o menor.
    const rankedResults = filteredContests
        .map((contest) => {
            const compatibility =
                calculateCompatibility(profile, contest);

            return {
                contest,
                score: compatibility.score,
                reasons: compatibility.reasons
            };
        })
        .sort((a, b) => b.score - a.score);

    if (rankedResults.length === 0) {
        resultsSummary.textContent =
            "Nenhum concurso demonstrativo passou pelos filtros selecionados.";

        const emptyState = document.createElement("div");
        emptyState.className = "no-results";
        emptyState.textContent =
            "Tente remover algum filtro para ampliar as recomendações.";

        resultsGrid.appendChild(emptyState);

        return;
    }

    resultsSummary.innerHTML =
        `<strong>${rankedResults.length}</strong> concurso(s) demonstrativo(s) ` +
        `compatível(is) com os filtros atuais, ordenado(s) por relevância.`;

    rankedResults.forEach((result) => {
        resultsGrid.appendChild(createResultCard(result));
    });

    // Leva o usuário até os resultados após o cálculo.
    document.getElementById("resultados").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}




/* =========================================================
   CONCURSOMATCH
   SALVAMENTO COMPLETO DO PERFIL - ETAPA 15.3.2
   ========================================================= */

async function salvarPreferenciasPerfil(profile) {

    // 1. Identifica o usuário autenticado.
    const { data, error: erroAuth } =
        await clienteSupabase.auth.getUser();

    // Verifica possíveis erros de autenticação.
    if (erroAuth) {
        throw erroAuth;
    }

    const usuario = data.user;

    // Sem uma conta autenticada,
    // não podemos salvar um perfil individual.
    if (!usuario) {
        return false;
    }

    // 2. Verifica se a lista completa de formações
    // foi capturada corretamente pelo formulário.
    if (!Array.isArray(profile.educationDetails)) {

        throw new Error(
            "Os dados das formações estão incompletos."
        );
    }

    // 3. Recupera o nome do usuário cadastrado.
    const nomeUsuario =
        usuario.user_metadata?.full_name ||
        usuario.email?.split("@")[0] ||
        "Usuário";

    // 4. Envia todo o perfil em uma única operação
    // para a função PostgreSQL criada no Supabase.
    const { data: perfilId, error: erroSalvamento } =
        await clienteSupabase.rpc(
            "salvar_perfil_completo",
            {
                p_nome: nomeUsuario,
                p_perfil: profile
            }
        );

    // 5. Se qualquer parte da operação falhar,
    // o PostgreSQL reverterá a transação.
    if (erroSalvamento) {
        throw erroSalvamento;
    }

    // 6. Confirma o salvamento completo.
    console.log(
        "Perfil completo salvo com sucesso!",
        perfilId
    );

    return true;
}


/* =========================================================
   CONCURSOMATCH
   RECUPERAÇÃO DAS PREFERÊNCIAS DO USUÁRIO
   ========================================================= */

// Restaura os valores de um grupo de checkboxes.
function restaurarCheckboxes(nomeCampo, valores) {

    // Garante que temos uma lista de valores.
    const selecionados = valores ?? [];

    // Localiza os checkboxes do grupo.
    const campos = profileForm.querySelectorAll(
        `input[name="${nomeCampo}"]`
    );

    // Marca as opções anteriormente salvas.
    campos.forEach((campo) => {
        campo.checked = selecionados.includes(campo.value);
    });
}


// Limpa o formulário para evitar misturar
// preferências de usuários diferentes.
function limparFormularioPerfil() {

    profileForm.reset();

    // Mantém apenas a primeira linha de cada
    // grupo de campos dinâmicos.
    [educationList, targetRoleList].forEach((lista) => {

        const linhas = Array.from(
            lista.querySelectorAll("[data-dynamic-row]")
        );

        linhas.slice(1).forEach((linha) => linha.remove());

        updateRemoveButtons(lista);
    });

    // Limpa resultados calculados anteriormente.
    resultsGrid.innerHTML = "";

    resultsSummary.textContent =
        "Preencha o perfil para gerar recomendações.";

    formMessage.textContent = "";
}


// Recupera as preferências do usuário autenticado.
async function carregarPreferenciasPerfil() {

    try {

        // 1. Identifica o usuário conectado.
        const { data: authData, error: authError } =
            await clienteSupabase.auth.getUser();

        if (authError) {
            throw authError;
        }

        if (!authData.user) {
            return false;
        }

        // 2. Busca somente o perfil desse usuário.
        const { data: perfil, error } =
            await clienteSupabase
                .from("perfis")
                .select("*")
                .eq("usuario_id", authData.user.id)
                .maybeSingle();

        if (error) {
            throw error;
        }

        // Limpa os campos antes de restaurar os dados.
        limparFormularioPerfil();

        // O usuário pode ter conta, mas ainda não
        // ter preenchido um perfil profissional.
        if (!perfil) {
            console.log("Usuário sem perfil salvo.");
            return false;
        }

        // 3. Recupera a faixa salarial.
        document.getElementById("salaryMin").value =
            perfil.salario_minimo ?? "";

        document.getElementById("salaryMax").value =
            perfil.salario_maximo ?? "";

        // 4. Restaura todas as opções selecionadas.
        restaurarCheckboxes(
            "interest[]", perfil.areas_interesse
        );

        restaurarCheckboxes(
            "region[]", perfil.regioes
        );

        restaurarCheckboxes(
            "institution[]", perfil.instituicoes
        );

        restaurarCheckboxes(
            "governmentLevel[]", perfil.esferas
        );

        restaurarCheckboxes(
            "employmentRegime[]", perfil.regimes
        );

        restaurarCheckboxes(
            "educationLevel[]", perfil.niveis_escolaridade
        );

        // 5. Recupera os cargos desejados.
        const cargos = perfil.cargos_desejados ?? [];

        cargos.forEach((cargo, indice) => {

            // A primeira linha já existe no HTML.
            if (indice > 0) {

                // Reutiliza nossa função atual para
                // criar campos dinâmicos.
                addDynamicRow({
                    listElement: targetRoleList,
                    inputName: "targetRole[]",
                    inputIdPrefix: "target-role",
                    labelText: "Cargo desejado",
                    placeholder: "Ex.: Gerente de Projetos de TI"
                });
            }

            // Preenche o campo correspondente.
            const campos = targetRoleList.querySelectorAll(
                'input[name="targetRole[]"]'
            );

            campos[indice].value = cargo;
        });

            

        // ==========================================
        // RECUPERAR AS FORMAÇÕES ACADÊMICAS
        // ==========================================

        // Busca as formações relacionadas ao
        // perfil do usuário autenticado.
        const {
            data: formacoes,
            error: erroFormacoes
        } = await clienteSupabase
            .from("formacoes")
            .select("curso, nivel")
            .eq("perfil_id", perfil.id)
            .order("criado_em", {
                ascending: true
            });

        // Verifica possíveis erros na consulta.
        if (erroFormacoes) {
            throw erroFormacoes;
        }

        // Recria os campos de formação na página.
        formacoes.forEach((formacao, indice) => {

            // O primeiro campo já existe no HTML.
            // Criamos outros apenas quando necessário.
            if (indice > 0) {

                addDynamicRow({
                    listElement: educationList,
                    inputName: "education[]",
                    inputIdPrefix: "education",
                    labelText: "Formação",
                    placeholder:
                        "Ex.: Análise e Desenvolvimento de Sistemas"
                });

            }

            // Identifica os campos existentes.
            const campos = educationList.querySelectorAll(
                'input[name="education[]"]'
            );

            // Preenche cada campo com o curso salvo.
            campos[indice].value = formacao.curso;

// ==========================================
// RESTAURAR O NÍVEL ACADÊMICO
// ==========================================

// Identifica a linha correspondente ao curso.
const linhas = educationList.querySelectorAll(
    "[data-dynamic-row]"
);

const linhaAtual = linhas[indice];

// Localiza o seletor de nível dessa formação.
const seletorNivel = linhaAtual.querySelector(
    'select[name="educationDegree[]"]'
);

// Restaura o nível anteriormente salvo.
// Formações antigas continuam com "Não informado".
seletorNivel.value =
    formacao.nivel ?? "Não informado";


        });

        // Confere os registros recuperados.
        console.log(
            "Formações recuperadas:",
            formacoes
        );






        // 6. Confirma que a recuperação terminou.
        formMessage.textContent =
            "Suas preferências foram recuperadas!";

        console.log(
            "Perfil recuperado do Supabase:",
            perfil
        );

        return true;

    } catch (erro) {

        console.error(
            "Erro ao recuperar preferências:",
            erro
        );

        formMessage.textContent =
            "Não foi possível carregar suas preferências.";

        return false;
    }
}












// =========================================================
// 7. CAPTURA DO FORMULÁRIO
// =========================================================

// O async permite consultar o Supabase
// antes de apresentar os resultados.
profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(profileForm);

    const salaryMin = optionalNumber(formData.get("salaryMin"));
    const salaryMax = optionalNumber(formData.get("salaryMax"));

    if (
        (salaryMin !== null && salaryMin < 0) ||
        (salaryMax !== null && salaryMax < 0)
    ) {
        formMessage.textContent =
            "Os valores de salário não podem ser negativos.";

        return;
    }

    if (
        salaryMin !== null &&
        salaryMax !== null &&
        salaryMin > salaryMax
    ) {
        formMessage.textContent =
            "O salário mínimo não pode ser maior que o salário máximo.";

        return;
    }

 
/* ==========================================
   ETAPA 15.3 - VALIDAÇÃO DAS FORMAÇÕES
   ========================================== */

// Recupera todas as linhas de formação.
const linhasFormacao = educationList.querySelectorAll(
    "[data-dynamic-row]"
);

// Armazena as formações já encontradas
// para identificar possíveis duplicações.
const formacoesEncontradas = new Set();

// Analisa cada formação individualmente.
for (const linha of linhasFormacao) {

    // Recupera o nome do curso.
    const campoCurso = linha.querySelector(
        'input[name="education[]"]'
    );

    // Recupera o nível acadêmico.
    const campoNivel = linha.querySelector(
        'select[name="educationDegree[]"]'
    );

    const curso = campoCurso.value.trim();
    const nivel = campoNivel.value;

    // CASO 1:
    // Nível selecionado, mas sem nome do curso.
    if (!curso && nivel !== "Não informado") {

        formMessage.textContent =
            "Informe o nome do curso correspondente " +
            "ao nível acadêmico selecionado.";

        campoCurso.focus();
        return;
    }

    // CASO 2:
    // Linha completamente vazia.
    // Como a formação é opcional, ignoramos.
    if (!curso && nivel === "Não informado") {
        continue;
    }

    // CASO 3:
    // Curso informado, mas nível não selecionado.
    if (curso && nivel === "Não informado") {

        formMessage.textContent =
            "Selecione o nível acadêmico da formação: " +
            curso + ".";

        campoNivel.focus();
        return;
    }

    // CASO 4:
    // Verifica formações repetidas.
    // Permite o mesmo nome de curso em níveis
    // diferentes, mas não a mesma combinação.
    const identificador =
        `${normalizeText(curso)}|${normalizeText(nivel)}`;

    if (formacoesEncontradas.has(identificador)) {

        formMessage.textContent =
            "A formação " + curso + " (" + nivel +
            ") foi cadastrada mais de uma vez.";

        campoCurso.focus();
        return;
    }

    // Registra essa combinação para comparar
    // com as próximas formações.
    formacoesEncontradas.add(identificador);
}
   









const profile = {

    // Lista simples de formações, utilizada
    // pelo algoritmo de matching.
    educations: formData
        .getAll("education[]")
        .map((value) => value.trim())
        .filter(Boolean),

    // Lista completa de formações e níveis,
    // utilizada para salvar no Supabase.
    educationDetails: Array.from(
        educationList.querySelectorAll("[data-dynamic-row]")
    )
        .map((linha) => {

            // Recupera o curso e seu nível
            // na mesma linha do formulário.
            const campoCurso = linha.querySelector(
                'input[name="education[]"]'
            );

            const campoNivel = linha.querySelector(
                'select[name="educationDegree[]"]'
            );

            return {
                curso: campoCurso.value.trim(),
                nivel: campoNivel.value
            };

        })
        // Ignora formações sem nome.
        .filter((formacao) => formacao.curso !== ""),

    // Mantém as demais preferências.
    interests: formData.getAll("interest[]"),

        regions: formData.getAll("region[]"),
        institutions: formData.getAll("institution[]"),
        governmentLevels: formData.getAll("governmentLevel[]"),
        employmentRegimes: formData.getAll("employmentRegime[]"),
        educationLevels: formData.getAll("educationLevel[]"),

        salaryRange: {
            min: salaryMin,
            max: salaryMax
        },

        targetRoles: formData
            .getAll("targetRole[]")
            .map((value) => value.trim())
            .filter(Boolean)
    };



// ==========================================
// IDENTIFICA QUAL BOTÃO FOI CLICADO
// ==========================================

// event.submitter identifica o botão responsável
// pelo envio do formulário.
const apenasSalvar =
    event.submitter?.id === "saveProfileButton";



if (apenasSalvar) {

    // Identifica o botão responsável pelo salvamento.
    const botaoSalvar =
        document.getElementById("saveProfileButton");

    // Evita iniciar outro salvamento simultâneo.
    if (botaoSalvar.disabled) {
        return;
    }

    // Bloqueia novos cliques enquanto a operação ocorre.
    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    // Exibe uma mensagem de carregamento.
    formMessage.dataset.status = "loading";
    formMessage.textContent =
        "Aguarde, estamos salvando suas preferências.";

    try {

        // Executa o salvamento completo no Supabase.
        const perfilSalvo =
            await salvarPreferenciasPerfil(profile);

        if (perfilSalvo) {

            // Exibe a confirmação de sucesso.
            formMessage.dataset.status = "success";
            formMessage.textContent =
                "✓ Seu perfil foi salvo com sucesso!";

        } else {

            // Informa quando não existe sessão autenticada.
            formMessage.dataset.status = "error";
            formMessage.textContent =
                "Entre na sua conta para salvar o perfil.";
        }

    } catch (erro) {

        // Registra o erro para facilitar a depuração.
        console.error("Erro ao salvar perfil:", erro);

        // Apresenta uma mensagem amigável.
        formMessage.dataset.status = "error";
        formMessage.textContent =
            "Não foi possível salvar seu perfil. Tente novamente.";

    } finally {

        // Restaura o botão, mesmo se ocorrer algum erro.
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Salvar meu perfil";
    }

    // Impede que o botão Salvar execute o matching.
    return;
}









    // ==========================================
    // CONSULTA DAS VAGAS NO SUPABASE
    // ==========================================

    console.log("Perfil capturado:", profile);

    // Informa ao usuário que estamos consultando
    // o banco de dados.
    formMessage.textContent =
        "Buscando vagas no Supabase...";

    try {

        // Busca as vagas cadastradas e os dados
        // dos concursos aos quais pertencem.
        const { data, error } = await clienteSupabase
            .from("vagas")
            .select(`
                id,
                cargo,
                salario,
                estado,
                cidade,
                area,
                escolaridade,
                regime,
                formacao_exigida,
                concursos (
                    nome,
                    instituicao,
                    categoria_instituicao,
                    esfera
                )
            `);

        // Se houver erro na consulta, interrompe.
        if (error) {
            throw error;
        }

        // Converte as vagas do Supabase para
        // o formato utilizado pelo matching.
        const concursosDoBanco =
            data.map(adaptarVagaSupabase);

        // Marca as vagas como originadas do banco.
        // Os requisitos acadêmicos ainda
        // precisarão de validação posterior.
        concursosDoBanco.forEach((concurso) => {
            concurso.fromSupabase = true;
        });

        // Mostra no Console o resultado da consulta.
        console.log(
            "Vagas carregadas do Supabase:",
            concursosDoBanco.length
        );



// ==========================================
// EXECUÇÃO DO MATCHING
// ==========================================

// Os dados do formulário já foram capturados
// e validados anteriormente.

// Apresenta os concursos compatíveis com
// as preferências informadas.
renderResults(profile, concursosDoBanco);

// Informa que a busca foi concluída.
// Nenhuma alteração é salva no perfil.
formMessage.textContent =
    "Consulta realizada! Veja os resultados abaixo.";



    } catch (erro) {

        // Se a consulta falhar, não mostramos
        // os concursos antigos como se fossem
        // resultados atuais do banco.
        console.error(
            "Erro ao consultar o Supabase:",
            erro
        );

        formMessage.textContent =
            "Não foi possível consultar o banco. Tente novamente.";

        resultsGrid.innerHTML = "";

        resultsSummary.textContent =
            "A consulta ao Supabase falhou.";
    }

});


updateRemoveButtons(educationList);
updateRemoveButtons(targetRoleList);
