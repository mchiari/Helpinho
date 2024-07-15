Olá avaliadores!

Antes de tudo, gostaria de agradecer a oportunidade de participar do processo seletivo. Desde já, deixo claro que não estou familiarizado com algumas tecnologias propostas. Nunca havia mexido com Angular ou Serverless(framework) anteriormente, muito embora trabalhe com frontend e AWS diariamente. Resolvi tentar aceitar o desafio pois acredito que a vaga é uma boa oportunidade e, por ser advogado e desenvolvedor, posso contribuir com a equipe de diversas formas.

Iniciei pelo backend que foi feito em node. Criei um servidor simples em express.js com 3 rotas contendo APIs em HTTP que dariam conta de toda a lógica de negócio e operações. Certa centralização do código das APIs pode facilitar a manutenção. São basicamente 3 grandes rotas - usuários, requisições de ajuda e envio de ajuda. A estrutura está dividida em arquivos diferentes para cada setor.

Users - GET, PUT, POST, DELETE
Requests - GET, GET All, GET By Id, POST
Helps - GET, POST

A arquitetura é event-driven e está funcionando da seguinte forma:

O backend inteiro está feito na AWS utilizando o framework Serverless. O usuário vai consumir APIs diretamente para CRUD de usuário. Não me preocupei em incluir muitos procedimentos de segurança (dupla senha, validações, salt, token...) pois não era o foco. Para as outras operações, os GETs são consultas diretas ao dynamo (pensando na performance na entrega da experiencia para o usuario) e os POSTs são na verdade a publicação de mensagens para os respectivos tópicos do SNS. Duas filas SQS FIFO  separadas estão subscritas aos tópicos de SNS, processando as mensagens. Workers independentes em lambda inserem os valores passados na mensagem no banco. As filas tem DLQs com processadores separados para evitar sobrecarga e a perda de eventos. As requisições só podem ser criadas se vinculadas a um usuário - a ajuda também. O sistema foi feito pensando em escala, segurança e consistencia. Foram observados princípios de clean code e clean architecture.

Tendo em vista que o projeto é relativamente simples, no meu orçamento inicial acreditei que conseguiria aprender e aplicar o Angular mas vi que é uma tecnologia bem diferente do React e, por mais que também trabalhe com a noção de componentes, tem princípios e sintaxes completamente diferentes. Eu precisaria de mais tempo do que o disponível para realizar o projeto. Sendo assim, quando percebi que demoraria mais do que o tempo que tinha disponível, escolhi não continuar. 

Como ainda não tivemos nenhuma conversa, eu não sabia se valeria a pena o tempo que eu teria que investir para aprender a tecnologia e participar do processo. Sendo assim, escolhi não finalizar e enviar como está - somente o backend está "completo". Isso não significa que eu não estou disposto a aprender Angular, apenas não haveria tempo hábil dentro do prazo.

Para executar, certificar que existem credenciais AWS válidas na máquina, navegar para backend > helpinho e rodar "npm install && serverless dev"

Log do deploy do serverless template:
endpoints:
  POST - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/users
  GET - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/users/{userId}
  PUT - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/users/{userId}
  DELETE - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/users/{userId}
  GET - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/requests
  GET - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/requests/{requestId}
  POST - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/requests
  GET - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/requests/user/{userId}
  GET - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/helps/{requestId}
  POST - https://2o2iosmikl.execute-api.us-east-1.amazonaws.com/dev/helps
  
functions:
  processor: helpinho-dev-processor (99 kB)
  dlqProcessor: helpinho-dev-dlqProcessor (99 kB)
  users: helpinho-dev-users (99 kB)
  requests: helpinho-dev-requests (99 kB)
  helps: helpinho-dev-helps (99 kB)