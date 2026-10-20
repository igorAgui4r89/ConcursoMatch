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
   SALVAMENTO DO PERFIL NO SUPABASE
   ========================================================= */

async function salvarPreferenciasPerfil(profile) {

    // 1. Identifica o usuário autenticado.
    const { data, error: erroAuth } =
        await clienteSupabase.auth.getUser();

    if (erroAuth) {
        throw erroAuth;
    }

    const usuario = data.user;

    // Se não houver usuário conectado,
    // o matching continua funcionando,
    // mas o perfil não será salvo.
    if (!usuario) {
        return false;
    }

    // 2. Organiza as informações recebidas
    // do formulário para o formato do banco.
    const dadosPerfil = {

        // Relaciona o perfil ao usuário logado.
        usuario_id: usuario.id,

        // Recupera o nome informado no cadastro.
        nome: usuario.user_metadata?.full_name ?? null,

        // Preferências salariais.
        salario_minimo: profile.salaryRange.min,
        salario_maximo: profile.salaryRange.max,

        // Listas de preferências.
        areas_interesse: profile.interests,
        regioes: profile.regions,
        instituicoes: profile.institutions,
        esferas: profile.governmentLevels,
        regimes: profile.employmentRegimes,
        niveis_escolaridade: profile.educationLevels,
        cargos_desejados: profile.targetRoles,

        // Registra o momento da atualização.
        atualizado_em: new Date().toISOString()
    };

    // 3. Insere ou atualiza o perfil.
    const { error } = await clienteSupabase
        .from("perfis")
        .upsert(dadosPerfil, {
            onConflict: "usuario_id"
        });

    // 4. Verifica se o Supabase retornou erro.
    if (error) {
        throw error;
    }

    
    // ==========================================
    // SALVAR AS FORMAÇÕES ACADÊMICAS
    // ==========================================

    // Envia ao Supabase a lista de formações
    // que o usuário informou no formulário.
    const { error: erroFormacoes } =
        await clienteSupabase.rpc(
            "sincronizar_formacoes",
            {
                p_cursos: profile.educations
            }
        );

    // Interrompe se houver erro ao salvar
    // as formações acadêmicas.
    if (erroFormacoes) {
        throw erroFormacoes;
    }

    // Confirma que as preferências e as
    // formações foram salvas corretamente.
    console.log(
        "Perfil e formações salvos no Supabase!"
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
            .select("curso")
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
// MATCHING E SALVAMENTO DAS PREFERÊNCIAS
// ==========================================

// Primeiro, apresenta normalmente os resultados
// do algoritmo de matching.
renderResults(profile, concursosDoBanco);

// Depois, tenta salvar as preferências do usuário.
// Um erro no salvamento não deve impedir
// a visualização dos concursos encontrados.

try {

    const perfilSalvo =
        await salvarPreferenciasPerfil(profile);

    if (perfilSalvo) {

        formMessage.textContent =
            "Recomendações atualizadas! " +
            "Suas preferências foram salvas.";

    } else {

        formMessage.textContent =
            "Recomendações atualizadas! " +
            "Entre na sua conta para salvar " +
            "suas preferências.";

    }

} catch (erroSalvamento) {

    // Mantém os resultados exibidos,
    // mesmo quando o salvamento falhar.
    console.error(
        "Erro ao salvar preferências:",
        erroSalvamento
    );

    formMessage.textContent =
        "Recomendações atualizadas, mas não " +
        "foi possível salvar suas preferências.";

}


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
