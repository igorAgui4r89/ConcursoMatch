# ConcursoMatch

Projeto de estudo e portfólio para recomendar concursos públicos de acordo com o perfil do usuário.

## Visão do produto

A proposta do ConcursoMatch é reduzir o tempo gasto procurando editais e diminuir a chance de o candidato perder uma oportunidade relevante.

O usuário poderá informar, entre outros dados:

- mais de uma formação;
- múltiplas áreas de interesse;
- faixa salarial desejada;
- região/estado de preferência;
- cargos específicos que gostaria de acompanhar;
- instituições de interesse;
- esfera federal, estadual e/ou municipal;
- regime estatutário, celetista ou temporário;
- nível de escolaridade da vaga.

O sistema deverá cruzar esse perfil com os requisitos dos concursos e apresentar oportunidades compatíveis.

## Status atual

**Fase 1 — protótipo de interface**

Implementado:

- landing page responsiva;
- apresentação do serviço;
- espaço reservado para logo;
- formulário de perfil;
- múltiplas formações;
- múltiplas áreas de interesse;
- faixa salarial mínima e máxima;
- múltiplos cargos desejados;
- múltiplas regiões de interesse;
- JavaScript inicial para adicionar/remover campos;
- leitura dos dados do formulário no console.

Ainda não implementado:

- autenticação;
- banco de dados;
- motor de matching;
- cadastro real de concursos;
- coleta/importação de editais;
- alertas por e-mail;
- painel do usuário;
- monetização.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Git
- GitHub

Tecnologias previstas para fases posteriores:

- Supabase
- PostgreSQL
- serviço de envio de e-mail
- backend/Edge Functions quando necessário

## Estrutura

```text
ConcursoMatch/
├── assets/
│   └── logo-placeholder.svg
├── docs/
│   ├── levantamento-de-requisitos.md
│   ├── regras-de-negocio.md
│   └── roadmap.md
├── .gitignore
├── index.html
├── style.css
├── script.js
└── README.md
```

## Como executar

1. Clone ou baixe o projeto.
2. Abra a pasta no Visual Studio Code.
3. Abra `index.html` no navegador.

Se usar a extensão Live Server:

1. abra `index.html`;
2. clique com o botão direito;
3. selecione **Open with Live Server**.

## Primeiro teste

No formulário:

1. adicione duas formações, por exemplo:
   - Direito
   - Análise e Desenvolvimento de Sistemas
2. marque mais de uma área de interesse;
3. defina a faixa salarial;
4. adicione um cargo desejado, por exemplo:
   - Gerente de Projetos de TI
5. clique em **Salvar perfil**;
6. abra o console do navegador.

O objeto do perfil será exibido no console.

## Próxima etapa recomendada

Criar uma pequena lista de concursos fictícios em JavaScript e desenvolver o primeiro algoritmo de compatibilidade entre:

- formação;
- área;
- salário;
- localização;
- cargo desejado.

## Documentação

A documentação de requisitos e regras de negócio está na pasta `docs/`.

## Objetivo de portfólio

Este projeto será desenvolvido de forma incremental e documentada no GitHub, permitindo demonstrar:

- levantamento de requisitos;
- modelagem do problema;
- experiência do usuário;
- front-end responsivo;
- lógica de matching;
- persistência de dados;
- autenticação;
- automações;
- integração com serviços externos;
- versionamento com Git.

## Observação

Os concursos exibidos no protótipo são fictícios. Dados reais e fontes oficiais serão tratados em fases posteriores do projeto.


## Matching demonstrativo

A versão atual inclui 8 concursos fictícios apenas para testar o motor de matching.

Fluxo atual:

```text
Perfil do usuário
        ↓
Filtros opcionais
        ↓
Concursos fictícios
        ↓
Cálculo de compatibilidade
        ↓
Ordenação por relevância
        ↓
Cards de recomendação
```

### Regra importante

Filtros opcionais vazios significam **critério indiferente**.

Exemplo:

```javascript
regions: []
```

significa que qualquer região é aceita.

O campo de cargo desejado funciona como **bônus de relevância**, e não como filtro eliminatório.

### Dados de demonstração

Os concursos exibidos nesta fase são fictícios. A próxima fase de dados reais deverá utilizar fonte oficial e data de atualização.
