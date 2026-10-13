# Levantamento de Requisitos — ConcursoMatch

## 1. Identificação

**Projeto:** ConcursoMatch  
**Tipo:** Plataforma web de recomendação de concursos públicos  
**Objetivo inicial:** criar um MVP capaz de comparar o perfil do usuário com concursos cadastrados e apresentar oportunidades compatíveis.

---

## 2. Problema

Candidatos a concursos públicos precisam acompanhar diferentes fontes, editais e publicações. Isso aumenta o esforço de busca e o risco de perder oportunidades relevantes.

Além disso, um mesmo candidato pode:

- possuir mais de uma formação;
- interessar-se por áreas profissionais diferentes;
- aceitar diferentes faixas salariais;
- possuir cargos específicos de interesse;
- considerar diferentes localidades.

Uma busca baseada apenas em um filtro simples não representa bem esse perfil.

---

## 3. Objetivo geral

Desenvolver uma plataforma que permita ao usuário cadastrar seu perfil e receber recomendações de concursos compatíveis com suas características e preferências.

---

## 4. Objetivos específicos

1. Permitir o cadastro de múltiplas formações.
2. Permitir a seleção de múltiplas áreas de interesse.
3. Permitir o cadastro de uma faixa salarial.
4. Permitir a indicação de cargos desejados sem transformá-los em filtros excludentes.
5. Permitir preferência geográfica.
6. Cadastrar concursos com requisitos estruturados.
7. Criar um mecanismo de compatibilidade.
8. Exibir resultados ordenados por relevância.
9. Futuramente, enviar alertas quando novos concursos forem compatíveis.

---

## 5. Atores

### 5.1 Candidato

Usuário que cadastra seu perfil e recebe recomendações.

### 5.2 Administrador

Responsável por revisar, cadastrar ou corrigir concursos durante as primeiras fases do produto.

### 5.3 Sistema

Responsável por comparar perfis com concursos e gerar recomendações.

---

## 6. Requisitos Funcionais

### RF01 — Cadastro de perfil

O sistema deverá permitir o cadastro do perfil do candidato.

### RF02 — Múltiplas formações

O sistema deverá permitir que o candidato informe uma ou mais formações.

### RF03 — Múltiplas áreas de interesse

O sistema deverá permitir que o candidato selecione mais de uma área de interesse.

### RF04 — Faixa salarial

O sistema deverá permitir informar salário mínimo e salário máximo desejados.

### RF05 — Cargos desejados

O sistema deverá permitir que o candidato informe um ou mais cargos de interesse.

Esses cargos deverão aumentar a relevância de uma recomendação, mas não impedir que outros concursos compatíveis sejam apresentados.

### RF06 — Preferência geográfica

O sistema deverá permitir informar preferência de região e/ou estado.

### RF07 — Cadastro de concursos

O sistema deverá possuir uma estrutura para armazenar concursos com:

- órgão;
- cargo;
- escolaridade;
- formação exigida;
- área;
- salário;
- localidade;
- data limite de inscrição;
- link da fonte oficial;
- situação do concurso.

### RF08 — Compatibilidade

O sistema deverá comparar o perfil do candidato com os requisitos dos concursos.

### RF09 — Pontuação

O sistema deverá ser capaz de gerar uma pontuação de compatibilidade.

### RF10 — Resultado

O sistema deverá apresentar os concursos mais compatíveis primeiro.

### RF11 — Justificativa da recomendação

O usuário deverá conseguir entender os principais motivos da recomendação, por exemplo:

- formação compatível;
- faixa salarial compatível;
- área de interesse correspondente;
- localização compatível.

### RF12 — Persistência

Em fase posterior, os dados do usuário deverão ser armazenados em banco de dados.

### RF13 — Autenticação

Em fase posterior, o usuário deverá criar uma conta e autenticar-se.

### RF14 — Alertas

Em fase posterior, o sistema deverá enviar alertas por e-mail quando um novo concurso compatível for cadastrado.

---

## 7. Requisitos Não Funcionais

### RNF01 — Responsividade

A interface deverá funcionar adequadamente em desktop, tablet e dispositivos móveis.

### RNF02 — Usabilidade

O processo de criação de perfil deverá ser simples e compreensível.

### RNF03 — Acessibilidade

Os elementos principais deverão utilizar HTML semântico, labels de formulário e navegação por teclado.

### RNF04 — Desempenho

A página inicial deverá carregar rapidamente e evitar dependências desnecessárias.

### RNF05 — Manutenibilidade

O código deverá ser organizado, comentado e versionado com Git.

### RNF06 — Segurança

Dados pessoais e autenticação deverão ser tratados com mecanismos apropriados quando o backend for implementado.

### RNF07 — LGPD

O projeto deverá considerar princípios de minimização, transparência, finalidade e controle do usuário quando dados pessoais forem persistidos.

### RNF08 — Rastreabilidade

Dados de concursos reais deverão guardar referência para a fonte oficial.

---

## 8. Escopo do MVP

O MVP deverá possuir:

- página de apresentação;
- criação de perfil;
- concursos fictícios ou cadastrados manualmente;
- primeiro algoritmo de matching;
- lista de recomendações;
- explicação básica do motivo da compatibilidade.

---

## 9. Fora do escopo inicial

Não fazem parte da primeira versão:

- aplicativo mobile nativo;
- inteligência artificial generativa;
- scraping massivo de todas as fontes;
- pagamentos;
- plano premium;
- publicidade;
- integração com dezenas de portais;
- notificações push.

---

## 10. Critérios de sucesso do MVP

O MVP será considerado funcional quando:

1. um usuário puder cadastrar pelo menos duas formações;
2. selecionar várias áreas;
3. informar faixa salarial;
4. indicar cargos desejados;
5. comparar seu perfil com concursos de teste;
6. receber resultados ordenados por compatibilidade;
7. visualizar os critérios que contribuíram para a recomendação.

---

## 11. Riscos iniciais

### R1 — Interpretação de requisitos dos editais

Editais podem descrever formações de maneiras diferentes.

**Mitigação:** começar com classificações estruturadas e regras explícitas.

### R2 — Qualidade dos dados

Informações de concursos podem estar desatualizadas.

**Mitigação:** armazenar fonte oficial e data de atualização.

### R3 — Complexidade do matching

Formações equivalentes nem sempre possuem nomes iguais.

**Mitigação:** separar formação específica de área ampla e evoluir a taxonomia gradualmente.

### R4 — Escopo excessivo

O produto possui muitas possibilidades.

**Mitigação:** construir incrementalmente e validar cada etapa antes de adicionar novas funcionalidades.


---

## 12. Ampliação dos filtros opcionais

### RF15 — Múltiplas regiões

O candidato poderá selecionar uma ou mais regiões do Brasil.

Se nenhuma região for selecionada, a localização regional deverá ser considerada indiferente.

### RF16 — Instituições

O candidato poderá selecionar instituições ou grupos de instituições de interesse.

Exemplos:

- INSS;
- Receita Federal;
- Universidades e Institutos Federais;
- Tribunais;
- Polícias;
- SEFAZ;
- Tribunais de Contas;
- Legislativo;
- Bancos Públicos;
- Prefeituras;
- Agências e Autarquias.

Se nenhuma opção for selecionada, a instituição não deverá restringir os resultados.

### RF17 — Esfera

O candidato poderá escolher uma ou mais esferas:

- federal;
- estadual;
- municipal.

Sem seleção significa qualquer esfera.

### RF18 — Regime

O candidato poderá informar preferência por:

- estatutário;
- celetista (CLT);
- temporário.

Sem seleção significa qualquer regime.

### RF19 — Escolaridade da vaga

O candidato poderá filtrar oportunidades por nível:

- fundamental;
- médio;
- técnico;
- superior;
- pós-graduação;
- mestrado/doutorado.

Sem seleção significa qualquer nível.

### Regra geral dos filtros opcionais

Uma lista opcional vazia deverá significar **critério indiferente**.

Ela nunca deverá ser interpretada como ausência de resultados permitidos.
