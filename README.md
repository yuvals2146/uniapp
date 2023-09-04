1. npm i
2. copy the .env.example and get the env params
3. npm start

running locally:

1. DB stuff
   `yarn db:migrate` to migrate the db by the schema 
   `yarn db:gen:migration` after change in prisma schema
   `yarn db:reset` to delete the db


TEST:

. .bin/test 
to run spesific test add it to envrc SUITE_TO_RUN
if empty will run all
