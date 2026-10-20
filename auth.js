
/* =========================================================
   CONCURSOMATCH
   AUTENTICAÇÃO DE USUÁRIOS - SUPABASE AUTH
   ========================================================= */

// Reutiliza o cliente Supabase que já foi criado
// no arquivo script.js.
// Não precisamos criar outra conexão.


// =========================================================
// 1. ELEMENTOS DA INTERFACE
// =========================================================

// Botões de alternância entre cadastro e login
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// Formulários
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

// Mensagens de autenticação
const authMessage = document.getElementById("authMessage");

// Área que aparece depois do login
const userSession = document.getElementById("userSession");
const loggedUser = document.getElementById("loggedUser");
const logoutButton = document.getElementById("logoutButton");


// =========================================================
// 2. FUNÇÕES AUXILIARES
// =========================================================

// Mostra mensagens de sucesso ou erro ao usuário.
function mostrarMensagemAuth(mensagem, erro = false) {

    authMessage.textContent = mensagem;

    authMessage.style.color = erro
        ? "#b42318"
        : "#2f7d5b";
}


// Alterna entre o formulário de cadastro e login.
function mostrarFormularioAuth(tipo) {

    const cadastroAtivo = tipo === "cadastro";

    // Controla qual formulário fica visível.
    registerForm.hidden = !cadastroAtivo;
    loginForm.hidden = cadastroAtivo;

    // Atualiza o destaque dos botões.
    showRegister.classList.toggle(
        "active",
        cadastroAtivo
    );

    showLogin.classList.toggle(
        "active",
        !cadastroAtivo
    );

    // Limpa mensagens anteriores.
    mostrarMensagemAuth("");
}


// Atualiza a interface de acordo com a sessão.
function atualizarInterfaceAuth(usuario) {

    const estaLogado = Boolean(usuario);

    // Oculta os formulários quando existe sessão.
    registerForm.hidden = estaLogado;
    loginForm.hidden = estaLogado;

    // Oculta as abas quando o usuário está logado.
    document.querySelector(".auth-tabs").hidden =
        estaLogado;

    // Exibe a área de usuário autenticado.
    userSession.hidden = !estaLogado;

    if (estaLogado) {

        // Recupera o nome informado no cadastro.
        const nome =
            usuario.user_metadata?.full_name ||
            usuario.email;

        // Usa textContent para inserir o texto
        // sem interpretá-lo como HTML.
        loggedUser.textContent =
            `Você está conectado como: ${nome}`;

    } else {

        // Limpa informações da sessão encerrada.
        loggedUser.textContent = "";

    }
}


// =========================================================
// 3. ALTERNÂNCIA DOS FORMULÁRIOS
// =========================================================

showRegister.addEventListener("click", () => {
    mostrarFormularioAuth("cadastro");
});

showLogin.addEventListener("click", () => {
    mostrarFormularioAuth("login");
});


// =========================================================
// 4. CADASTRO DE NOVOS USUÁRIOS
// =========================================================

registerForm.addEventListener("submit", async (event) => {

    // Impede o recarregamento da página.
    event.preventDefault();

    // Recupera as informações digitadas.
    const nome = document
        .getElementById("registerName")
        .value.trim();

    const email = document
        .getElementById("registerEmail")
        .value.trim();

    const senha = document
        .getElementById("registerPassword")
        .value;

    // Valida a quantidade mínima de caracteres.
    if (senha.length < 8) {

        mostrarMensagemAuth(
            "A senha deve ter pelo menos 8 caracteres.",
            true
        );

        return;
    }

    const botao = registerForm.querySelector(
        'button[type="submit"]'
    );

    botao.disabled = true;

    mostrarMensagemAuth("Criando sua conta...");

    try {

        // Solicita o cadastro ao Supabase Auth.
        const { data, error } =
            await clienteSupabase.auth.signUp({

                email: email,

                password: senha,

                options: {

                    // Guarda o nome nos metadados
                    // do usuário autenticado.
                    data: {
                        full_name: nome
                    },

                    // Endereço permitido no Supabase
                    // para retornar após confirmar o e-mail.
                    emailRedirectTo:
                        `${window.location.origin}/index.html`
                }
            });

        // Interrompe o processo em caso de erro.
        if (error) {
            throw error;
        }

        // Se existe sessão, o cadastro já autenticou.
        // Caso contrário, o usuário precisa conferir
        // o e-mail antes de entrar.
        if (data.session) {

            mostrarMensagemAuth(
                "Conta criada e sessão iniciada!"
            );

        } else {

            mostrarMensagemAuth(
                "Solicitação recebida! Confira seu e-mail " +
                "para confirmar o cadastro."
            );
        }

        // Limpa os campos após o envio.
        registerForm.reset();

    } catch (erro) {

        console.error("Erro no cadastro:", erro);

        mostrarMensagemAuth(
            erro.message ||
            "Não foi possível criar a conta.",
            true
        );

    } finally {

        // Reabilita o botão após a solicitação.
        botao.disabled = false;
    }

});


// =========================================================
// 5. LOGIN DE USUÁRIOS
// =========================================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document
        .getElementById("loginEmail")
        .value.trim();

    const senha = document
        .getElementById("loginPassword")
        .value;

    const botao = loginForm.querySelector(
        'button[type="submit"]'
    );

    botao.disabled = true;

    mostrarMensagemAuth("Entrando na sua conta...");

    try {

        // Autentica o usuário com e-mail e senha.
        const { error } =
            await clienteSupabase.auth.signInWithPassword({
                email: email,
                password: senha
            });

        if (error) {
            throw error;
        }

        // A sessão será reconhecida automaticamente
        // pelo listener configurado mais abaixo.
        mostrarMensagemAuth(
            "Login realizado com sucesso!"
        );

        // Remove a senha digitada do formulário.
        loginForm.reset();


// Recupera as preferências do usuário
// que acabou de entrar na conta.
await carregarPreferenciasPerfil();


    } catch (erro) {

        console.error("Erro no login:", erro);

        mostrarMensagemAuth(
            "Não foi possível entrar. Verifique " +
            "seus dados e a confirmação do e-mail.",
            true
        );

    } finally {

        botao.disabled = false;
    }

});


// =========================================================
// 6. LOGOUT
// =========================================================

logoutButton.addEventListener("click", async () => {

    mostrarMensagemAuth("Encerrando sessão...");

    try {

        // Solicita ao Supabase o encerramento
        // da sessão atual.
        const { error } =
            await clienteSupabase.auth.signOut();

        if (error) {
            throw error;
        }

        // Volta a exibir o formulário de login.
        mostrarFormularioAuth("login");


// Limpa as preferências da conta anterior,
// evitando que permaneçam visíveis após sair.
limparFormularioPerfil();


        mostrarMensagemAuth(
            "Você saiu da sua conta."
        );

    } catch (erro) {

        console.error("Erro no logout:", erro);

        mostrarMensagemAuth(
            "Não foi possível encerrar a sessão.",
            true
        );
    }

});


// =========================================================
// 7. VERIFICAÇÃO DA SESSÃO
// =========================================================

// Escuta mudanças de autenticação.
// Ex.: login, logout ou confirmação de e-mail.
clienteSupabase.auth.onAuthStateChange(
    (_evento, sessao) => {

        // Apenas atualizamos a interface aqui.
        // Não fazemos outras consultas ao Supabase
        // dentro deste callback.
        atualizarInterfaceAuth(sessao?.user ?? null);

    }
);


// Verifica se já existe uma sessão salva
// quando o usuário abre a página.
async function verificarSessaoAuth() {

    const { data, error } =
        await clienteSupabase.auth.getSession();

    if (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

        return;
    }

    atualizarInterfaceAuth(
        data.session?.user ?? null
    );


// Se já existe uma sessão autenticada,
// recupera as preferências salvas no banco.
if (data.session?.user) {

    await carregarPreferenciasPerfil();

}


}


// Executa a verificação inicial.
verificarSessaoAuth();
