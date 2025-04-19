# shoulder-arthoplasty - BackEnd

## 🚀 Getting Started

### Prerequisites

To clone and run this application, you'll need _Git_ and _Docker_ installed on your computer.

### Installation

```sh
git clone https://github.com/afif1731/shoulder-arthoplasty-backend.git
```

2. Go into the repository

```sh
cd shoulder-arthoplasty-backend
```

3. Install dependencies

```sh
pnpm install
```

4. Copy .env.examples to .env.development and fill in the configuration

```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_NAME=
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_NAME}?schema=public"
PORT=
BASE_URL="http://localhost:${PORT}"
REDIS_PORT=
ENV=
```

5. Run Docker

```sh
pnpm docker:up:dev
```

If there is an error in dotenv, run the following command

```sh
npm install dotenv -g
```

6. Run migrations

```sh
pnpm migrate:dev
```

7. Start the program

```sh
pnpm start:dev
```

8. Run the seeder

```sh
pnpm seed:dev
```

### Creating Module

1. Install nest-cli

```sh
npm install -g @nestjs/cli
```

2. To create module, run

```sh
nest g module your_module_name
```

This will create a new folder with `your_module_name.module.ts` inside

3. To create controller, run

```sh
nest g controller your_module_name
```

This will create a new controller file inside your module directory, `your_module_name.controller.ts`

4. To create service, run

```sh
nest g service your_module_name
```

This will create a new service file inside your module directory, `your_module_name.service.ts`

> **Note**
> If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### How to Use Pagination

> Check `Get All Users` in **/src/users**

### Pull Procedure

1. run `git stash`, it will save all your change in a stash

2. run `git pull origin branch-to-pull --rebase`, it will rebase your branch with some new commit from that branch

3. run `git stash pop`, it will restore all your change from stash

4. if there is conflict, check the file and resolve it. [reference on how to resolve conflict on vscode](https://www.youtube.com/watch?v=lz5OuKzvadQ)

### Push Procedure

1. make sure you're not in Main branch

2. run `pnpm lint --fix`, this will run linter and prettier
```bash
pnpm lint --fix
```

3. edit manually all lint error

4. repeat step 2 and 3 until there is no lint error

5. run `git add .`
```bash
git add .
```

6. run `git commit -m "your commit message"`, check [this link](https://www.baeldung.com/ops/git-commit-messages#4-conventional-commits) for better commit message
```bash
git commit -m "your commit message"
```

7. run `git push origin your-branch`
```bash
git push origin your-branch
```


### Notes

1. If there is an error like below, follow the steps

```
stringWidth = require('string-width') in node_modules\wrap-ansi\index.js:2 not supported
```

- Stop the program

- Delete `node_modules` and `pnpm.lock`

- Then, run `pnpm install`
