#! /bin/sh

# clear generated files
rm -rf ./src/app/core/api/generated

# generate using custom template
java -jar ../../swagger-codegen/modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate \
      -i https://backenddev.playngo.it/playandgo/v3/api-docs \
      -l typescript-angular \
      --template-dir ../../swagger-codegen/templates/typescript-angular/ \
      -o ./src/app/core/api/generated \
      -Dapis -Dmodel -DmodelDocs=false

# clean unwanted files
rm ./src/app/core/api/generated/*.*
rm ./src/app/core/api/generated/.gitignore
rm ./src/app/core/api/generated/.npmignore

# formatting
npm run prettier ./src/app/core/api/generated/ -- --write
npm run eslint ./src/app/core/api/generated/ -- --fix

