package com.example.quartz.job;


import com.example.quartz.service.ProducerService;
import lombok.extern.slf4j.Slf4j;

import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

import org.json.JSONObject;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class SyncIntervalSet extends QuartzJobBean {

    private ProducerService producerService;

    public SyncIntervalSet(ProducerService producerService){
        this.producerService = producerService;
    }

    public void LogMessageWarning(String message){
        LogManager lgmngr = LogManager.getLogManager();
        Logger lg = lgmngr.getLogger(Logger.GLOBAL_LOGGER_NAME);
        lg.log(Level.WARNING, message);
    }
    public void LogMessageInfo(String message){
        LogManager lgmngr = LogManager.getLogManager();
        Logger lg = lgmngr.getLogger(Logger.GLOBAL_LOGGER_NAME);
        lg.log(Level.INFO, message);
    }
    public void LogMessageError(String message){
        LogManager lgmngr = LogManager.getLogManager();
        Logger lg = lgmngr.getLogger(Logger.GLOBAL_LOGGER_NAME);
        lg.log(Level.SEVERE, message);
    }

    @Override
    protected void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {

            JSONObject message = new JSONObject();
            JSONObject body = new JSONObject();
            body.put("message", message);
            producerService.sendMessageToTopic(body.toString(),Integer.valueOf(4));
            this.LogMessageInfo("Sync Process Interval Set Job End");
            
        } catch (Exception e) {
            this.LogMessageError("Error: " + e.getMessage() );
        }
    }

}