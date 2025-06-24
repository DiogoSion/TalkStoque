# TalkStoque - Frontend

Este é o frontend do sistema **TalkStoque**, desenvolvido em **React** com **TypeScript**, responsável pela interface do sistema de gerenciamento de estoque de bebidas.

> ⚠️ **Importante:** Para o correto funcionamento do sistema, é necessário que o backend da aplicação esteja em execução **antes** de iniciar o frontend.

## 🔗 Link para o Backend
[Repositório do Backend - TalkStoque](https://github.com/DiogoSion/TalkStoque_API)

---

## 🚀 Como rodar o projeto

Siga os passos abaixo para executar o frontend em sua máquina local:

### 1. Clone o repositório

```bash
git clone https://github.com/DiogoSion/TalkStoque
cd talkstoque
```

### 2. Instale as dependências

É necessário ter o **Node.js** instalado (versão recomendada: 18+).

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com a seguinte variável (ajuste conforme o endereço da sua API):

```env
VITE_API_URL=http://localhost:8000
```

### 4. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível no navegador acessando:

```
http://localhost:5173
```

---

## 📦 Tecnologias utilizadas

- React
- TypeScript
- Vite
- TailwindCSS
- ShadCN UI
- Lucide Icons

---

## 📌 Observações

- Certifique-se de que o backend esteja rodando corretamente antes de iniciar o frontend.
- Em caso de erro de CORS, verifique se o backend está liberando o acesso à origem do frontend.