package com.example.quartz.service;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

import java.util.HashMap;

@Slf4j
@Service
public final class ProducerService {
    private static final Logger logger = LoggerFactory.getLogger(ProducerService.class);
    @Autowired
    private Environment env;
    private final KafkaTemplate<String, String> kafkaTemplate;
    //private final String TOPIC = env.getProperty("spring.kafka.topic");
    //private final String TOPIC = "gcp.store.inventory.all.sync.0";

    public ProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    public void sendMessage(String message, String topic) {
        //logger.info(String.format("$$$$ => Producing message: %s", message));
        //log.info(message);

        ListenableFuture<SendResult<String, String>> future = this.kafkaTemplate.send(topic, message);
        future.addCallback(new ListenableFutureCallback<>() {
            @Override
            public void onFailure(Throwable ex) {
                //logger.info("Unable to send message=[ {} ] due to : {}", message, ex.getMessage());
                log.info("unable to process message : "+ex.getMessage());
            }

            @Override
            public void onSuccess(SendResult<String, String> result) {
                log.info("Sent message=[ {} ] with offset=[ {} ]", message, result.getRecordMetadata().offset());
            }
        });
    }
    public void sendMessageToTopic(String message,Integer topicId) {
        //logger.info(String.format("$$$$ => Producing message: %s", message));
        //log.info(message);
        HashMap<Integer,String> kafkaTopics=new HashMap<>();
        kafkaTopics.put(1,"gcp.store.order.flipkart.sync.0");
        kafkaTopics.put(2,"gcp.store.order.amazon.sync.0");
        kafkaTopics.put(3,"gcp.store.inventory.amazon_flipkart.sync.0");
        kafkaTopics.put(4,"gcp.store.system.sync.interval.set.0");

        ListenableFuture<SendResult<String, String>> future = this.kafkaTemplate.send(kafkaTopics.get(topicId), message);
        future.addCallback(new ListenableFutureCallback<>() {
            @Override
            public void onFailure(Throwable ex) {
                //logger.info("Unable to send message=[ {} ] due to : {}", message, ex.getMessage());
                log.info("unable to process message : "+ex.getMessage());
            }

            @Override
            public void onSuccess(SendResult<String, String> result) {
                log.info("Sent message=[ {} ] with offset=[ {} ]", message, result.getRecordMetadata().offset());
            }
        });
    }

    public void sendMessageToTopic(String message,String topic) {
        //logger.info(String.format("$$$$ => Producing message: %s", message));
        //log.info(message);
        // HashMap<Integer,String> kafkaTopics=new HashMap<>();
        // kafkaTopics.put(1,"gcp.store.order.flipkart.sync.0");
        // kafkaTopics.put(2,"gcp.store.order.amazon.sync.0");
        // kafkaTopics.put(3,"gcp.store.inventory.amazon_flipkart.sync.0");
        // kafkaTopics.put(4,"gcp.store.system.sync.interval.set.0");

        ListenableFuture<SendResult<String, String>> future = this.kafkaTemplate.send(topic, message);
        future.addCallback(new ListenableFutureCallback<>() {
            @Override
            public void onFailure(Throwable ex) {
                //logger.info("Unable to send message=[ {} ] due to : {}", message, ex.getMessage());
                log.info("unable to process message : "+ex.getMessage());
            }

            @Override
            public void onSuccess(SendResult<String, String> result) {
                log.info("Sent message=[ {} ] with offset=[ {} ]", message, result.getRecordMetadata().offset());
            }
        });
    }
}