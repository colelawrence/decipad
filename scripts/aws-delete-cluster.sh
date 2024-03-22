for CLUSTER_NAME in "${@:-}"
do
  echo "Deleting cluster $CLUSTER_NAME"
  # Delete ecs services #
  aws ecs list-services \
    --cluster $CLUSTER_NAME | \
  jq -r ' .serviceArns[] | [.] | @tsv ' | \
    while IFS=$'\t' read -r serviceArn; do
      aws ecs delete-service \
        --cluster $CLUSTER_NAME \
        --service $serviceArn \
        --force \
        --output text
    done

  echo "Stopping all running tasks..."

  # Stop ecs tasks #
  aws ecs list-tasks \
    --cluster $CLUSTER_NAME | \
  jq -r ' .taskArns[] | [.] | @tsv' | \
    while IFS=$'\t' read -r taskArn; do
      aws ecs stop-task --cluster $CLUSTER_NAME --task $taskArn --output text;
    done

  echo "delete the cluster"
  # Define variables #

  # Delete the ecs cluster #
  aws ecs delete-cluster --cluster $CLUSTER_NAME --output text


done

