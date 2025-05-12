#!/bin/bash
aws --endpoint-url=http://localhost:4566 sns create-topic --name fcp_sfd_comms_gateway
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name fcp_sfd_comms_request-deadletter
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name fcp_sfd_comms_request --attributes "{\"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"arn:aws:sqs:eu-west-2:000000000000:fcp_sfd_comms_request-deadletter\\\",\\\"maxReceiveCount\\\":\\\"10\\\"}\"}"

aws --endpoint-url=http://localhost:4566 sns subscribe --topic-arn arn:aws:sns:eu-west-2:000000000000:fcp_sfd_comms_gateway --protocol sqs --notification-endpoint arn:aws:sqs:eu-west-2:000000000000:fcp_sfd_comms_request
