#!/bin/bash

rm ./libs/graphqlserver-types/src/generated/typedefs.ts 2> /dev/null
touch ./libs/graphqlserver-types/src/generated/typedefs.ts

echo '
import { gql } from "apollo-server-lambda";

export default gql`' >> ./libs/graphqlserver-types/src/generated/typedefs.ts

for file in ./libs/graphqlserver/src/**/*.graphql; do
  cat $file >> ./libs/graphqlserver-types/src/generated/typedefs.ts
done

echo '`;' >> ./libs/graphqlserver-types/src/generated/typedefs.ts
