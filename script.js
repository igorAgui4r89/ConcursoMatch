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
// TESTE DE CONSULTA AO BANCO
// =========================================================

async function testarConexaoSupabase() {

    try {

        // Busca cargos e os concursos relacionados
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
                    esfera
                )
            `);

        // Interrompe em caso de erro
        if (error) {
            throw error;
        }

        // Mostra os registros recebidos
        console.log(
            "ConcursoMatch - Vagas do Supabase:",
            data
        );

        console.log(
            "Total de vagas encontradas:",
            data.length
        );



// ==========================================
// TESTE DA CONVERSÃO DOS DADOS
// ==========================================

// Converte cada vaga para o formato
// utilizado pelo algoritmo do ConcursoMatch.
const vagasAdaptadas = data.map(adaptarVagaSupabase);

// Mostra os dados convertidos no Console.
console.log(
    "Vagas adaptadas para o matching:",
    vagasAdaptadas
);

// Exibe uma tabela para facilitar a conferência.
console.table(vagasAdaptadas);


    } catch (erro) {

        // Exibe detalhes do problema no console
        console.error(
            "Erro na integração com Supabase:",
            erro
        );

    }

}



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

        // Nome da instituição responsável.
        // Ainda precisaremos classificar a categoria
        // institucional utilizada nos filtros.
        institution: vaga.concursos?.instituicao ?? "",

        // Nome exibido nos resultados.
        agency: vaga.concursos?.instituicao ?? "",

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


// Executa o teste quando o site é carregado
testarConexaoSupabase();














const educationList = document.getElementById("educationList");
const addEducationButton = document.getElementById("addEducation");

const targetRoleList = document.getElementById("targetRoleList");
const addTargetRoleButton = document.getElementById("addTargetRole");

const profileForm = document.getElementById("profileForm");
const formMessage = document.getElementById("formMessage");

const resultsGrid = document.getElementById("resultsGrid");
const resultsSummary = document.getElementById("resultsSummary");


// =========================================================
// 1. DADOS FICTÍCIOS
// =========================================================
//
// Na etapa futura, este array será substituído por dados
// carregados do banco (Supabase/PostgreSQL).

const concursos = [
    {
        id: 1,
        institution: "Receita Federal",
        agency: "Receita Federal — demonstração",
        role: "Analista Tributário de Tecnologia",
        area: "Tecnologia da Informação",
        region: "Sudeste",
        governmentLevel: "Federal",
        employmentRegime: "Estatutário",
        educationLevel: "Superior",
        salary: 16800,
        formationKeywords: [
            "tecnologia",
            "sistemas",
            "computacao",
            "computação",
            "informatica",
            "informática",
            "analise e desenvolvimento",
            "análise e desenvolvimento"
        ]
    },
    {
        id: 2,
        institution: "Tribunais",
        agency: "Tribunal Regional Modelo — demonstração",
        role: "Analista Judiciário — Área Jurídica",
        area: "Tribunais",
        region: "Sul",
        governmentLevel: "Federal",
        employmentRegime: "Estatutário",
        educationLevel: "Superior",
        salary: 14200,
        formationKeywords: ["direito", "juridico", "jurídico"]
    },
    {
        id: 3,
        institution: "Universidades e Institutos Federais",
        agency: "Universidade Federal Modelo — demonstração",
        role: "Professor Universitário — Tecnologia",
        area: "Educação e Professor Universitário",
        region: "Sudeste",
        governmentLevel: "Federal",
        employmentRegime: "Estatutário",
        educationLevel: "Mestrado ou Doutorado",
        salary: 13100,
        formationKeywords: [
            "tecnologia",
            "sistemas",
            "computacao",
            "computação",
            "informatica",
            "informática"
        ]
    },
    {
        id: 4,
        institution: "Tribunais de Contas e Controladorias",
        agency: "Controladoria Estadual Modelo — demonstração",
        role: "Auditor de Controle Interno",
        area: "Controle e Auditoria",
        region: "Sudeste",
        governmentLevel: "Estadual",
        employmentRegime: "Estatutário",
        educationLevel: "Superior",
        salary: 20500,
        formationKeywords: ["*"]
    },
    {
        id: 5,
        institution: "INSS",
        agency: "INSS — demonstração",
        role: "Analista do Seguro Social",
        area: "Previdenciária e Seguridade Social",
        region: "Sudeste",
        governmentLevel: "Federal",
        employmentRegime: "Estatutário",
        educationLevel: "Superior",
        salary: 10900,
        formationKeywords: ["*"]
    },
    {
        id: 6,
        institution: "Bancos Públicos",
        agency: "Banco Público Modelo — demonstração",
        role: "Analista de Dados",
        area: "Dados e Inteligência Artificial",
        region: "Sul",
        governmentLevel: "Federal",
        employmentRegime: "CLT",
        educationLevel: "Superior",
        salary: 9700,
        formationKeywords: [
            "tecnologia",
            "sistemas",
            "computacao",
            "computação",
            "estatistica",
            "estatística",
            "dados",
            "matematica",
            "matemática"
        ]
    },
    {
        id: 7,
        institution: "Prefeituras",
        agency: "Prefeitura Municipal Modelo — demonstração",
        role: "Administrador Público",
        area: "Administrativa",
        region: "Sudeste",
        governmentLevel: "Municipal",
        employmentRegime: "Estatutário",
        educationLevel: "Superior",
        salary: 7200,
        formationKeywords: [
            "administracao",
            "administração",
            "gestao",
            "gestão"
        ]
    },
    {
        id: 8,
        institution: "Agências Reguladoras e Autarquias",
        agency: "Agência Reguladora Modelo — demonstração",
        role: "Gerente de Projetos de TI",
        area: "Gestão e Projetos",
        region: "Centro-Oeste",
        governmentLevel: "Federal",
        employmentRegime: "Estatutário",
        educationLevel: "Superior",
        salary: 22400,
        formationKeywords: [
            "tecnologia",
            "sistemas",
            "computacao",
            "computação",
            "informatica",
            "informática",
            "gestao",
            "gestão"
        ]
    }
];


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

    field.append(label, input);
    row.append(field, removeButton);
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
    if (profile.educations.length > 0) {
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


// =========================================================
// 6. RENDERIZAÇÃO DOS RESULTADOS
// =========================================================

function createResultCard(result) {
    const { contest, score, reasons } = result;

    const card = document.createElement("article");
    card.className = "result-card";

    const reasonsHtml = reasons
        .slice(0, 5)
        .map((reason) => `<li>${reason}</li>`)
        .join("");

    card.innerHTML = `
        <div class="result-card-top">
            <div class="result-card-title">
                <span>${contest.agency}</span>
                <h3>${contest.role}</h3>
            </div>

            <div class="score-badge" aria-label="${score}% de compatibilidade">
                <strong>${score}%</strong>
                <span>match</span>
            </div>
        </div>

        <div class="result-meta">
            <div class="result-meta-item">
                <span>Área</span>
                <strong>${contest.area}</strong>
            </div>

            <div class="result-meta-item">
                <span>Salário</span>
                <strong>${formatCurrency(contest.salary)}</strong>
            </div>

            <div class="result-meta-item">
                <span>Região</span>
                <strong>${contest.region}</strong>
            </div>

            <div class="result-meta-item">
                <span>Esfera / Regime</span>
                <strong>${contest.governmentLevel} • ${contest.employmentRegime}</strong>
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


function renderResults(profile) {
    resultsGrid.innerHTML = "";

    // Primeiro aplicamos os filtros ativos.
    const filteredContests = concursos.filter(
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


// =========================================================
// 7. CAPTURA DO FORMULÁRIO
// =========================================================

profileForm.addEventListener("submit", (event) => {
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

    const profile = {
        educations: formData
            .getAll("education[]")
            .map((value) => value.trim())
            .filter(Boolean),

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

    console.log("Perfil capturado:", profile);

    formMessage.textContent =
        "Perfil processado. As recomendações foram atualizadas abaixo.";

    renderResults(profile);
});


updateRemoveButtons(educationList);
updateRemoveButtons(targetRoleList);
