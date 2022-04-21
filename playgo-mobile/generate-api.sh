#! /bin/sh

# Generate the API documentation.
# https://github.com/swagger-api/swagger-codegen/tree/3.0.0

# clear generated files
rm -rf ./src/app/core/api/generated


# download the swagger codegen jar from maven if needed. (it is in gitignore)
if [ ! -f ./swagger-codegen-cli.jar ]; then
  curl -fL\
    -o swagger-codegen-cli.jar \
    http://search.maven.org/remotecontent?filepath=io/swagger/codegen/v3/swagger-codegen-cli/3.0.33/swagger-codegen-cli-3.0.33.jar
fi

# generate using custom template. We are overriding just one file. Default template is here: https://github.com/swagger-api/swagger-codegen-generators/tree/master/src/main/resources/handlebars/typescript-angular
java -jar \
  swagger-codegen-cli.jar \
  generate \
  -i https://backenddev.playngo.it/playandgo/v3/api-docs \
  -l typescript-angular \
  --template-dir ./src/app/core/api/templates/ \
  -o ./src/app/core/api/generated \

# clean unwanted files

rm ./src/app/core/api/generated/*.*
rm ./src/app/core/api/generated/.gitignore
rm ./src/app/core/api/generated/.npmignore
rm -rf ./src/app/core/api/generated/.swagger-codegen/
rm ./src/app/core/api/generated/api/api.ts
rm ./src/app/core/api/generated/model/models.ts

# this file can be used if we want to keep some changes in generated files
rm ./src/app/core/api/generated/.swagger-codegen-ignore

# better folder name
mv ./src/app/core/api/generated/api ./src/app/core/api/generated/controllers

# formatting
npm run prettier ./src/app/core/api/generated/ -- --write
npm run eslint ./src/app/core/api/generated/ -- --fix
