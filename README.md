## 1. Visão Geral

A solução apresentada implementa um sistema de venda de ingressos projetado para operar com múltiplas instâncias da aplicação simultaneamente, evitando race conditions e a venda duplicada de um mesmo assento.  
Além disso, o sistema foi pensado para manter boa performance nas consultas de disponibilidade, utilizando mecanismos de cache e processamento assíncrono como suporte às operações críticas.

## 2. Tecnologias

**Banco Relacional**  
Foi utilizado o PostgreSQL por conveniência e familiaridade.
O PostgreSQL permite o uso de operações essenciais para garantir concorrência segura, como:

- `FOR UPDATE` (lock pessimista de linha)
- `SKIP LOCKED` (processamento concorrente em lote sem contenção)

Esses recursos são fundamentais para assegurar que reservas ocorram de forma consistente mesmo sob alta concorrência.

**Banco Distribuído (Cache)**  
O Redis foi escolhido como camada de cache distribuído, permitindo leitura rápida e centralizada das sessões criadas em tempo real, bem como a verificação da disponibilidade atual de assentos, reduzindo a carga de leitura no banco relacional.

**Mensageria**  
O RabbitMQ foi selecionado por oferecer funcionalidades nativas importantes, como Dead Letter Queue (DLQ), que auxiliam no tratamento de mensagens expiradas e permitem lidar com expirações automáticas de reservas e retentativas de processamento de forma resiliente.

## 3. Como Executar

A aplicação possui dois arquivos `docker-compose` distintos: um para execução da aplicação e outro para execução dos testes unitários e de integração.

### Pré-requisitos

- Docker
- Docker Compose
- NPM (Opcional para executar o container de forma mais prática)

---

### Executar a aplicação

Na pasta raiz do projeto, copie o conteúdo do arquivo .env.example e replique ele em um novo arquivo chamado ".env". Feito isso, basta executar pelo terminal:

```bash
npm run docker:prod "OU" docker compose -f prod.yml up
```

Após a inicialização e exibição dos logs do NestJS, a aplicação estará disponível em:

```
http://localhost:3000/api-docs
```

---

### Executar os testes

Na pasta raiz do projeto:

```bash
npm run docker:test "OU" docker compose -f test.yml up
```

Após alguns instantes, os logs detalhados dos testes serão exibidos no terminal.

---

### Como Popular Dados Iniciais (via `/api-docs`)

O sistema possui dois tipos de usuários para demonstração:

- `MANAGER`
- `CUSTOMER`

---

#### 1. Criar um usuário Manager

Acesse a rota:

```
POST /sign-up
```

Exemplo de payload:

```json
{
  "password": "@Senha123",
  "email": "manager@email.com",
  "name": "Dalton Gomes",
  "role": "MANAGER"
}
```

Um token será retornado na resposta.  
Utilize-o no cabeçalho **Bearer Token** disponível na interface Swagger/Scalar.

---

#### 2. Criar Sessões de Cinema

Acesse:

```
POST /manager/create
```

Preencha os dados da sessão conforme o exemplo exibido na interface.

---

#### 3. Criar um usuário Customer

Repita o processo de cadastro em `/sign-up`, agora com a propriedade role como `CUSTOMER`, e utilize o token retornado.

---

#### 4. Consultar Sessões Disponíveis

```
GET /customer/list-sessions
```

Essa rota permite visualizar sessões criadas e os assentos disponíveis.

---

#### 5. Reservar um Assento

```
POST /customer/book/{seatId}
```

Após a reserva, o sistema concede uma janela de **30 segundos** para confirmação do pagamento.

---

#### 6. Confirmar o Pagamento

Utilize o `bookID` retornado na reserva:

```
PUT /customer/pay/{reservationId}
```

#### 7. Consultar histórico de compras

Acesse a rota para verificar todas as compras já realizadas

```
GET	 /customer/list-history
```

#### 8. Consultar assentos em tempo real

Esta rota mostra os assentos e informações em "tempo real" de uma dada sessão (utilizando do redis)

```
GET	 /customer/session/{sessionId}
```

## 4. Estratégias implementadas

- Como foram tratadas as race conditions?

O principal risco identificado estava na tentativa de reservar o mesmo assento simultaneamente por múltiplos usuários e na atualização concorrente das informações de sessão armazenadas no Redis (por exemplo, atualizar o status de um assento dentro do objeto JSON que representa a sessão).
Para o primeiro cenário, a solução adotada foi o uso de um row-level lock pessimista do banco de dados durante a transação de criação da reserva.  
Toda operação que altera a disponibilidade de um assento é executada dentro de uma transação protegida por pessimistic_write, garantindo que apenas uma instância possa modificar aquele registro por vez. Isso evita sobrescritas indevidas e leituras inconsistentes.
Para o segundo cenário (sincronização do cache), foi utilizado um lock distribuído no Redis, por meio da biblioteca RedisLock, que permite adquirir locks baseados em uma chave específica compartilhada entre múltiplas instâncias.  
Sempre que há atualização dos dados de uma sessão no cache, a aplicação tenta adquirir um lock baseado no sessionId, garantindo que apenas um processo realize a modificação daquele estado em memória distribuída.

- Como foi garantida a coordenação entre múltiplas instâncias?

A coordenação entre instâncias foi alcançada combinando três mecanismos complementares:

1.  **Banco relacional como fonte única de verdade**, garantindo consistência forte por meio de transações ACID e locks pessimistas.
2.  **Redis como cache sincronizado**, com uso de locks distribuídos para evitar que múltiplas instâncias atualizem simultaneamente a mesma representação de sessão.
3.  **Mensageria com RabbitMQ**, responsável por propagar eventos de alteração de estado, permitindo que todas as instâncias reajam de forma assíncrona e mantenham seus dados derivados atualizados.
    Essa combinação elimina a necessidade de coordenação manual entre serviços, delegando o controle de concorrência ao banco e aos mecanismos de lock apropriados para cada camada.

- Como foram prevenidos deadlocks?

A arquitetura foi projetada para minimizar a possibilidade de deadlocks através de granularidade fina de lock, sempre associado a um único assento no banco relacional ou a uma única sessão no Redis, adoções de ordem determinística de acesso aos recursos e processos de reconciliação e expiração executados em lote utilizando estratégias como `SKIP LOCKED`, que ignoram registros já bloqueados por outra transação, evitando contenção.
Como cada operação crítica atua sobre um recurso bem definido e isolado, não há cenários onde duas transações precisem esperar mutuamente por múltiplos recursos, o que reduz significativamente o risco de deadlocks.

### 5. Listagem de endpoints

A listagem com exemplos de uso podem ser encontradas ao rodar a aplicação na secção 3 por: http://localhost:3000/api-docs

### 6. Decisões Técnicas

Uma das principais decisões técnicas foi gerenciar o ciclo de vida das reservas no banco relacional, em vez de utilizar o Redis com TTL para controlar sua expiração automática.

Embora o uso dessa abordagem seja comum para dados temporários, ele não oferece garantias transacionais nem executa regras de negócio ao expirar uma chave. Como a reserva representa um estado crítico do domínio, optou-se por mantê-la persistida no banco relacional. Tanto que com isso é possível manter até mesmo um histórico confiável de tentativas de reserva, prevenção inconsistências como cenários de indisponibilidade do redis e até mesmo processamento em batch no banco com prevenção de race conditions.

Nesse modelo, o Redis é utilizado apenas como camada complementar de cache e coordenação leve, enquanto o banco de dados permanece como a fonte única de verdade do estado das reservas. Isso proporciona maior robustez e previsibilidade ao sistema, especialmente em ambientes distribuídos.

### 7. O que ficou faltando

Uma das funcionalidades que não foi implementada foi o processamento em batch das mensagens recebidas pelo RabbitMQ  
Por se tratar de um tópico mais avançado e ainda não explorado em profundidade, optou-se por manter o consumo individual das mensagens. Considerando o tempo disponível para a entrega, a implementação desse mecanismo poderia adicionar complexidade e falhas no escopo atual do projeto.

### 8. Melhorias Futuras

Como evolução natural do projeto, seria interessante:

- Implementar processamento em batch de mensagens, permitindo maior eficiência no consumo e melhor throughput em cenários de alta carga.
- Refinar a organização das operações e entidades do TypeORM, tornando o código um pouco mais coeso e de fácil manutenção.
- Evoluir a arquitetura para padrões adicionais de confiabilidade, como maior observabilidade e ajustes finos de performance conforme a escala de uso.
