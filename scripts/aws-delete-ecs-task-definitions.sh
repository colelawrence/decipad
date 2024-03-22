# Delete ALL ecs task defs
aws ecs list-task-definitions \
    | \
jq -r ' .taskDefinitionArns[] | [.] | @tsv ' | \
  while IFS=$'\t' read -r serviceArn; do
    aws ecs deregister-task-definition \
      --task-definition $serviceArn \
      --output text
  done

aws ecs list-task-definitions --status INACTIVE \
    | \
jq -r ' .taskDefinitionArns[] | [.] | @tsv ' | \
  while IFS=$'\t' read -r serviceArn; do
    aws ecs delete-task-definitions \
      --task-definitions $serviceArn \
      --output text
  done
