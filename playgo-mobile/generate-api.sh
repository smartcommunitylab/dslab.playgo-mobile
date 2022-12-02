#! /bin/sh

# Generate the API documentation.
# We don't want to constantly and manually keep typescript intefraces in sync
# with the API. So we generate the typescript interfaces from api definitions,
# that are part of swagger.
#
# Swagger has special .json file (https://backenddev.playngo.it/playandgo/v3/api-docs)
# that contains all the information about the API. We use this file to generate
# typescript interfaces.
#
# To generate api we use tool called swagger-codegen
# https://github.com/swagger-api/swagger-codegen/tree/3.0.0
# This tool is super powerful and can generate a lot of different things in a
# lot of different languages and is highly configurable. But it could be little hard
# to use, or to find some documentation on how to configure it for some specific language.
#
# Normally swagger-codegen is used to generate whole npm module containg "lib"
# for the api. With reasoning that if you want to  use new version of api, you would
# just increase version of this generated "api lib" in package.json. We don't need
# something so complex, and we just want to generate interfaces of java
# classes ("model" folder) and rest api methods ("controllers" folder).
#
# As base of our generation we use "typescript-angular" template, which generates
# typescript interfaces for models and controllers. Generated controllers were
# way too complex for our needs, so we provided custom template for controllers.
# (src\app\core\api\templates\api.service.mustache). Default template is here:
# https://github.com/swagger-api/swagger-codegen-generators/tree/master/src/main/resources/handlebars/typescript-angular
#
# In our workflow we commit generated api to git, which is not ideal, but it's
# convinient. Another option would be to generate api in "before-build" npm script
# and leave it out of git. But this would be longer and more complex workflow.

# clear generated files
rm -rf ./src/app/core/api/generated
rm -rf ./src/app/core/api/generated-hsc


# download the swagger codegen jar from maven if needed. (it is in gitignore)
if [ ! -f ./swagger-codegen-cli.jar ]; then
  curl -fL\
    -o swagger-codegen-cli.jar \
    http://search.maven.org/remotecontent?filepath=io/swagger/codegen/v3/swagger-codegen-cli/3.0.33/swagger-codegen-cli-3.0.33.jar
fi

# generate using custom template. We are overriding just one file.
java -jar \
  swagger-codegen-cli.jar \
  generate \
  -i https://backenddev.playngo.it/playandgo/v3/api-docs \
  -l typescript-angular \
  --template-dir ./src/app/core/api/templates/ \
  -o ./src/app/core/api/generated \
  --type-mappings Date=number \
  --additional-properties modelPropertyNaming=original \
;

# generate using custom template. We are overriding just one file.
java -jar \
  swagger-codegen-cli.jar \
  generate \
  -i https://hscdev.playngo.it:443/playandgo-hsc/v3/api-docs \
  -l typescript-angular \
  --template-dir ./src/app/core/api/templates-hsc/ \
  -o ./src/app/core/api/generated-hsc \
  --type-mappings Date=number \
  --additional-properties modelPropertyNaming=original \
;

# clean unwanted files

rm ./src/app/core/api/generated/*.*
rm ./src/app/core/api/generated/.gitignore
rm ./src/app/core/api/generated/.npmignore
rm -rf ./src/app/core/api/generated/.swagger-codegen/
rm ./src/app/core/api/generated/api/api.ts
rm ./src/app/core/api/generated/model/models.ts

rm ./src/app/core/api/generated-hsc/*.*
rm ./src/app/core/api/generated-hsc/.gitignore
rm ./src/app/core/api/generated-hsc/.npmignore
rm -rf ./src/app/core/api/generated-hsc/.swagger-codegen/
rm ./src/app/core/api/generated-hsc/api/api.ts
rm ./src/app/core/api/generated-hsc/model/models.ts

# this file can be used if we want to keep some changes in generated files
rm ./src/app/core/api/generated/.swagger-codegen-ignore
rm ./src/app/core/api/generated-hsc/.swagger-codegen-ignore

# better folder name
mv ./src/app/core/api/generated/api ./src/app/core/api/generated/controllers
mv ./src/app/core/api/generated-hsc/api ./src/app/core/api/generated-hsc/controllers

# formatting
npm run prettier ./src/app/core/api/generated/ -- --write
# npm run eslint ./src/app/core/api/generated/ -- --fix
npm run prettier ./src/app/core/api/generated-hsc/ -- --write
# npm run eslint ./src/app/core/api/generated-hsc/ -- --fix
