# Private Markets API

Thanks for making it this far, and your consideration.

I like to think I'm a pretty good developer. If you think you can offer me any pointers, or don't quite agree with that, I'm even more eager to receive any feedback you might have. :)

## How to run the application

### Install NodeJS / npm

Install NodeJS here, and add it to your path:

https://nodejs.org/en

### Install Docker

Install docker globally, and make sure that the docker daemon is up and running on your machine (on MacOS, open the desktop app).

ChatGPT assures me that "docker compose" ships with Docker on most versions, but if you're running an old version, you may need to upgrade to use docker compose.

https://docs.docker.com/desktop/

### Install TypeScript Globally

```
npm i -g typescript
```

(assuming npm is your package manager of choice)

### Install DBMate Globally

I decided to use a DB migration tool to maintain the schema. I like DBMate, it is a lightweight tool written in Go which is ideal for a task like this.

Install it globally by running:

```
npm i -g dbmate
```

If you are struggling with DBMate, you could just copy and paste the SQL statements from the db folder into your PostgreSQL client of choice.

### Install The Dependencies

```
npm i
```

### Run The Application

```
npm run dev
```

This will get everything up and running.

This will build the Postgres docker container (on Port 5434), run all of the pending DB migrations, transpile the typescript, and start the server.

I have included a piece of seed data so that the GET endpoints aren't completely empty when the application is first run.

If everything goes well then:

GET localhost:3000/funds

Should return something like:

```
[{"id":"c027f208-80bb-451b-a687-25d388035893","name":"Brownfield Fund","vintage_year":2007,"target_size_usd":30000000.00,"status":"Investing","created_at":"2025-10-24T14:09:48Z"}]
```

### Run The Tests

```
npm run test
```

OR

```
npm run test:coverage
```

will run the tests and (optionally) produce a test coverage report. A test Docker container is running on Port 5433 to facilitate the integration tests.

I didn't test absolutely everything, but all of the application-specific logic is tested, with 95% coverage throughout the whole app.

### (Optional) Install a linter for inline SQL

I have written some inline SQL in the application so you might see things like:

```
/* sql */ `SELECT foo FROM bar ...`
```

This is because I'm indicating to a VSCode extension called "SQL Tagged Template Literals" that I would like my query to be in pretty colours. If you would also like your SQL to look nice in your IDE, it would be a good idea to install this, or something similar.

## Design Decisions and Assumptions

The app is fully compliant with the specification provided: https://storage.googleapis.com/interview-api-doc-funds.wearebusy.engineering/index.html

It is a layered application adhering to good separation of concerns principles.

src/index.ts - entry point \
api/handlers - responsible for routing and coodinating validation, business logic, and presentation concerns \
api/presenters - responsible for presenting the output in accordance with the specification \
api/validators - responsible for validating user input \
services - responsible for all business logic and database access (no separate repository layer, this would be a bit overkill)

I have not used any frameworks or ORMs. Just 3 direct dependencies: "yup", "decimal.js" and "pg". My style is to keep things simple, until they aren't simple any more.

The separation of concerns means that this can flexibly be deployed as both a standalone, monolithic application, or a serverless application (each handler can be deployed independently as a lambda function, with its own scaling and throttling concerns).

For all application handlers, presenters, validators and services, there are tests. These are mostly integration tests with a minimal level of mocking where necessary.

Some things, for me, were unusual in the spec, but not dealbreakers.

Firstly, currency figures serialized as numbers in JSON format is risky. JSON.parse() -> number will not always result in precise figures. Early in the valiation layer I have deserlialized these into Decimal constructs. If I were to have influence over the API spec, I would recommend communicating currency using strings. In JavaScript there is risk of developer error here, especially if future business logic involves multiplication or division.

The API spec requires a created_at field, but no updated_at field. I have written business logic for maintaining updated_at fields "under the hood", but this is currently hidden to the API consumer. If the API needs to be expanded in the future to include this, only the presentation layer needs to change.

Errors which are down to the user of the API are responded to with the correct HTTP 4XX code. Errors which are internal are responded to with a 500 Internal Server Error and logged internally.

I guess that's it, if you've got any further questions feel free to get in touch. If you've made it this far, it would definitely be nice to get some feedback.
