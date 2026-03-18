package com.luvina.pos.provider.config.aws;

import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.UnsynchronizedAppenderBase;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.*;

import java.time.LocalDate;
import java.util.Collections;

public class CloudWatchAppender extends UnsynchronizedAppenderBase<ILoggingEvent> {

    private String logGroup;
    private String logStreamPrefix;
    private String region;

    private LocalDate currentDate = LocalDate.now();
    private String nextSequenceToken;
    private CloudWatchLogsClient cloudWatchLogsClient;
    private PatternLayoutEncoder encoder;

    public void setLogGroup(String logGroup) {
        this.logGroup = logGroup;
    }

    public void setLogStreamPrefix(String logStreamPrefix) {
        this.logStreamPrefix = logStreamPrefix;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public void setEncoder(PatternLayoutEncoder encoder) {
        this.encoder = encoder;
    }

    @Override
    public void start() {
        if (logGroup == null || logStreamPrefix == null) {
            addError("Log group name and log stream name must be set");
            return;
        }

        cloudWatchLogsClient = CloudWatchLogsClient.builder()
                .region(Region.of(region))
                .build();

        if (encoder != null) {
            encoder.start();
        }
        addInfo("Log Group: " + logGroup);
        initLogGroupAndStream();
        super.start();
    }

    private void initLogGroupAndStream() {
        String todayStreamName = logStreamPrefix + "_" + currentDate.toString().replace("-", "");

        try {
            // 1. Tạo log group nếu chưa có
            DescribeLogGroupsResponse logGroupsResponse = cloudWatchLogsClient.describeLogGroups(
                    DescribeLogGroupsRequest.builder().logGroupNamePrefix(logGroup).build()
            );
            boolean groupExists = logGroupsResponse.logGroups().stream()
                    .anyMatch(g -> g.logGroupName().equals(logGroup));

            if (!groupExists) {
                cloudWatchLogsClient.createLogGroup(
                        CreateLogGroupRequest.builder().logGroupName(logGroup).build()
                );
            }

            // 2. Tạo log stream nếu chưa có
            DescribeLogStreamsResponse logStreamsResponse = cloudWatchLogsClient.describeLogStreams(
                    DescribeLogStreamsRequest.builder()
                            .logGroupName(logGroup)
                            .logStreamNamePrefix(todayStreamName)
                            .build()
            );

            if (logStreamsResponse.logStreams().isEmpty()) {
                cloudWatchLogsClient.createLogStream(
                        CreateLogStreamRequest.builder()
                                .logGroupName(logGroup)
                                .logStreamName(todayStreamName)
                                .build()
                );
                nextSequenceToken = null; // reset token
            } else {
                nextSequenceToken = logStreamsResponse.logStreams().get(0).uploadSequenceToken();
            }

        } catch (Exception e) {
            addError("Error initializing CloudWatch log group/stream", e);
        }
    }

    /**
     * flush events send log
     */
    private void flushEvents() {
        try {
            // Retrieve the existing log events
            DescribeLogGroupsResponse logGroupsResponse = cloudWatchLogsClient.describeLogGroups(
                    DescribeLogGroupsRequest.builder().logGroupNamePrefix(logGroup).build()
            );
            String currentStreamName = logStreamPrefix + "_" + currentDate.toString().replace("-", "");
            if (logGroupsResponse.logGroups().stream().noneMatch(g -> g.logGroupName().equals(logGroup))) {
                cloudWatchLogsClient.createLogGroup(CreateLogGroupRequest.builder().logGroupName(logGroup).build());
            }

            DescribeLogStreamsResponse logStreamsResponse = cloudWatchLogsClient.describeLogStreams(
                    DescribeLogStreamsRequest.builder()
                            .logGroupName(logGroup)
                            .logStreamNamePrefix(currentStreamName)
                            .build()
            );

            if (logStreamsResponse.logStreams().isEmpty()) {
                cloudWatchLogsClient.createLogStream(CreateLogStreamRequest.builder()
                        .logGroupName(logGroup)
                        .logStreamName(currentStreamName)
                        .build()
                );
            } else {
                nextSequenceToken = logStreamsResponse.logStreams().get(0).uploadSequenceToken();
            }
        } catch (Exception e) {
            addError("Error initializing CloudWatch log group/stream", e);
        }
    }

    private void checkAndRotateLogStream() {
        LocalDate today = LocalDate.now();
        if (!today.equals(currentDate)) {
            currentDate = today;
            initLogGroupAndStream();
        }
    }

    @Override
    protected void append(ILoggingEvent eventObject) {
        if (!isStarted() || cloudWatchLogsClient == null) {
            return;
        }

        //rotate
        checkAndRotateLogStream();

        String logMessage = encoder != null ? encoder.getLayout().doLayout(eventObject) : eventObject.getFormattedMessage();
        String currentStreamName = logStreamPrefix + "_" + currentDate.toString().replace("-", "");

        InputLogEvent logEvent = InputLogEvent.builder()
                .message(logMessage)
                .timestamp(System.currentTimeMillis())
                .build();

        PutLogEventsRequest.Builder requestBuilder = PutLogEventsRequest.builder()
                .logGroupName(logGroup)
                .logStreamName(currentStreamName)
                .logEvents(Collections.singletonList(logEvent));

        if (nextSequenceToken != null) {
            requestBuilder.sequenceToken(nextSequenceToken);
        }

        try {
            PutLogEventsResponse response = cloudWatchLogsClient.putLogEvents(requestBuilder.build());
            nextSequenceToken = response.nextSequenceToken();
        } catch (Exception e) {
            addError("Error sending log to CloudWatch", e);
        }
    }

    @Override
    public void stop() {

        // Flush any remaining events before stopping
        flushEvents();

        super.stop();

        // Clean up the AWS CloudWatchLogs client
        if (cloudWatchLogsClient != null) {
            cloudWatchLogsClient.close();
        }
    }

}

