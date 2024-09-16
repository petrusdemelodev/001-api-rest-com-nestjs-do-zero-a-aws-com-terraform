# API REST com NestJS do Zero à AWS com Terraform e GitHub Actions

Obrigado por aparecer!

**Este conteúdo não é para iniciantes!** 😊

Neste vídeo, vou te ensinar a desenvolver uma API REST com autenticação, utilizando **NestJS** e **TypeScript**. Além disso, vamos provisionar a infraestrutura na **AWS** utilizando **Terraform** e **GitHub Actions**. E o melhor: tudo do absoluto zero, instalando todas as ferramentas necessárias. **#VAMOSCODAR**

## Descrição

Este é o repositório do vídeo **API REST com NestJS do Zero à AWS com Terraform e GitHub Actions**.  
[Assista ao vídeo](https://youtu.be/csWHIujcbKI)

Se gostou, não se esqueça de **se inscrever no canal, deixar like e compartilhar com outros devs**.

## Sumário

- [Ferramentas Necessárias](#ferramentas-necessárias)
- [Clonar o Projeto](#clonar-o-projeto)
- [Iniciar o Projeto](#iniciar-o-projeto)
- [Executar os Testes](#executar-os-testes)
- [Deploy da Infraestrutura](#deploy-da-infraestrutura)
- [Dúvidas](#dúvidas)

## Ferramentas Necessárias

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node Version Manager (NVM)**
```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

- **Node.js versão 20**
```bash
  nvm install 20
  nvm use 20
```

- **NestJS CLI**
```bash
  npm install -g @nestjs/cli
```

- **AWS CLI**
(Documentação de Instalação)[https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html]

- **DynamoDB Local**
```bash
docker run -d -p 8000:8000 amazon/dynamodb-local
```

- **DynamoDB Admin**
```bash
npm install -g dynamodb-admin
```

- **Terraform**
(Documentação de Instalação)[https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli]

- **CDKTF**
```bash
npm install --global cdktf-cli@latest
```

## Clonar o Projeto
Clone o repositório para a sua máquina local:

```bash
git clone git@github.com:petrusdemelodev/001-api-rest-com-nestjs-do-zero-a-aws-com-terraform.git
cd 001-api-rest-com-nestjs-do-zero-a-aws-com-terraform
```

## Iniciar o Projeto
Navegue até a pasta da API, instale as dependências e inicie o servidor de desenvolvimento:

```bash
cd api
npm install
npm run start
```

## Executar os Testes
Para rodar os testes, execute:

```bash
npm run test
```

## Deploy da Infraestrutura
Para provisionar a infraestrutura na AWS, execute:

```bash
cd infra
cdktf apply dev-project-stack
```

# Dúvidas
Deixe seu comentário no vídeo! 😊

Se este repositório foi útil para você, por favor, deixe uma estrela ⭐ nele no GitHub. Isso ajuda a divulgar o projeto e motiva a criação de mais conteúdos como este.