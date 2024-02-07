<!-- 1. npm i
2. copy the envrc.example and get the env params
3. npm start (obsolete) -->

importing projet dependencies:

yarn install
or
yarn import

running locally:

1. DB stuff
   `yarn db:migrate` to migrate the db by the schema
   `yarn db:gen:migration` after change in prisma schema
   `yarn db:reset` to delete the db
2. . bin/start
   options: --v or --verbose: print alerts, regardless of DB status, don't update alert time and status in DB

TEST:

for discordBot test (first one) discordBot must run (. bin/discordBot)
. bin/discordBot
. bin/test
to run spesific test add it to envrc SUITE_TO_RUN, if empty all tests will run
