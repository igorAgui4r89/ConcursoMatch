# Regras de Negócio — ConcursoMatch

## RN01 — Formação

Um usuário pode possuir uma ou mais formações.

Uma formação não deve ser comparada apenas por igualdade literal de texto. O modelo futuro deverá considerar categorias mais amplas de área profissional.

Exemplo:

- Análise e Desenvolvimento de Sistemas
- Sistemas de Informação
- Ciência da Computação

podem pertencer à área ampla de Tecnologia da Informação.

---

## RN02 — Áreas de interesse

O usuário pode selecionar múltiplas áreas.

A correspondência de área aumenta a relevância do concurso.

---

## RN03 — Faixa salarial

A faixa salarial possui:

- valor mínimo;
- valor máximo.

O valor mínimo não pode ser maior que o valor máximo.

A primeira versão poderá considerar o salário do concurso compatível quando estiver dentro do intervalo informado.

Posteriormente, será possível flexibilizar essa regra.

---

## RN04 — Cargo desejado

Cargo desejado não é um filtro obrigatório.

Exemplo:

Usuário informa:

> Gerente de Projetos de TI

O sistema deve destacar oportunidades próximas desse cargo, mas ainda pode recomendar:

- Analista de TI;
- Analista de Sistemas;
- Especialista em Governança;
- Coordenador de Projetos;

caso os demais requisitos sejam compatíveis.

---

## RN05 — Localidade

Preferência de estado ou região deverá influenciar a pontuação.

Na primeira versão, localização poderá ser usada como critério simples.

Posteriormente, o usuário poderá configurar:

- qualquer localidade;
- apenas seu estado;
- estados específicos;
- regiões;
- possibilidade de mudança.

---

## RN06 — Critério obrigatório x preferência

O sistema deverá separar:

### Requisito eliminatório

Critério que determina se o candidato pode ou não concorrer.

Exemplo:

- formação obrigatória;
- registro profissional;
- escolaridade mínima.

### Preferência

Critério que aumenta ou reduz relevância, mas não necessariamente elimina.

Exemplo:

- salário desejado;
- estado preferido;
- cargo dos sonhos.

Essa distinção será central para o algoritmo de matching.

---

## RN07 — Pontuação

O matching deverá evoluir para uma pontuação ponderada.

Exemplo inicial, ainda não definitivo:

- formação/requisito obrigatório: maior peso;
- área de interesse: peso alto;
- salário: peso médio;
- localização: peso médio;
- cargo desejado: bônus.

Os pesos deverão ser documentados e testáveis.

---

## RN08 — Transparência

O sistema deverá explicar por que um concurso foi recomendado.

Não basta mostrar apenas um percentual.

---

## RN09 — Fonte dos concursos

Concursos reais deverão manter vínculo com fonte oficial.

Nunca tratar uma publicação secundária como única fonte de verdade quando a informação oficial estiver disponível.

---

## RN10 — Alertas

Quando os alertas forem implementados, o sistema deverá evitar envio repetido do mesmo concurso ao mesmo usuário sem motivo.


---

## RN11 — Filtros opcionais

Os filtros de:

- região;
- instituição;
- esfera;
- regime;
- escolaridade da vaga;
- área de interesse;

são opcionais.

Quando o usuário não selecionar nenhuma opção em um desses grupos, o motor de matching deverá considerar o critério indiferente.

Exemplo:

```text
governmentLevels = []
```

significa:

> aceitar concursos federais, estaduais e municipais.

Não significa:

> rejeitar todos os concursos.

---

## RN12 — Múltiplas regiões

Regiões devem funcionar como uma lista.

Exemplo:

```text
["Sul", "Sudeste"]
```

permite recomendar concursos de ambas as regiões.

---

## RN13 — Instituições

Preferência institucional poderá funcionar inicialmente como filtro opcional.

Em uma evolução futura, poderá haver diferença entre:

- "somente estas instituições";
- "priorizar estas instituições".

---

## RN14 — Regime

O regime deverá ser armazenado como atributo estruturado do concurso.

Valores iniciais:

- Estatutário;
- CLT;
- Temporário.

Caso a informação não esteja clara no edital, o concurso deverá ser marcado como "não informado" até revisão.


---

## RN15 — Matching do MVP

A primeira versão do matching segue duas etapas:

1. aplicar apenas os filtros que o usuário ativou;
2. ordenar os resultados restantes por pontuação de compatibilidade.

Filtros vazios não eliminam concursos.

---

## RN16 — Cargo desejado como bônus

Cargos desejados não são filtros eliminatórios.

Uma correspondência de cargo aumenta a pontuação, mas a ausência de correspondência não impede a recomendação.

---

## RN17 — Formação no protótipo

Nesta fase, formação é comparada por palavras-chave normalizadas.

Essa é uma solução temporária.

A versão futura deverá utilizar uma taxonomia estruturada de cursos e áreas para reduzir falsos positivos e falsos negativos.

---

## RN18 — Transparência do score

Todo percentual de compatibilidade deverá ser acompanhado por motivos legíveis.

O usuário não deverá receber apenas um número sem explicação.
