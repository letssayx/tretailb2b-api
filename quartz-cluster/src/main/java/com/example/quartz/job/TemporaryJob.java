package com.example.quartz.job;


import com.example.quartz.components.DBConfig;
import com.example.quartz.model.Client;
import com.example.quartz.model.Log;
import com.example.quartz.service.ProducerService;
import lombok.extern.slf4j.Slf4j;

import java.math.BigInteger;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.json.JSONObject;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class TemporaryJob  extends QuartzJobBean {

    private ProducerService producerService;

    @Autowired
    private DBConfig dbConfig;

    public TemporaryJob(ProducerService producerService){
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

        SessionFactory sessionFactory1  = null, sessionFactory2 = null;
        Session session1 = null, session2 = null;
        Transaction tx1 = null, tx2 = null;
        
        try {

            // JSONObject message = new JSONObject();
            // JSONObject body    = new JSONObject();
            
            JobDataMap jobDataMap = jobExecutionContext.getTrigger().getJobDataMap();
            int    client_id      = jobDataMap.getInt("client_id");
            int    log_id         = jobDataMap.getInt("log_id");
            String job_key        = jobDataMap.getString("job_key");
            String trigger_key    = jobDataMap.getString("trigger_key");
            int    min            = jobDataMap.getInt("min");
            String topic          = jobDataMap.getString("topic");
            int    delay          = jobDataMap.getInt("delay");
            Boolean onetime       = jobDataMap.getBoolean("onetime");

                 Configuration configuration = new Configuration();
                 configuration.configure();
                  // set master db from env setup
                 configuration.setProperties(dbConfig.SetMasterDB());
                 sessionFactory1 = configuration.buildSessionFactory();
                 session1 = sessionFactory1.openSession();
                 tx1 = session1.beginTransaction();
                 Client client = session1.load(Client.class, BigInteger.valueOf((long) client_id));
                 tx1.commit();
                 tx1 = null;

                 if(client != null ){
                     configuration.setProperties(dbConfig.SetClientDB(client.getDb_host(), client.getDb_port(), client.getDb_name(), client.getDb_user(), client.getDb_pass()));
                     sessionFactory2 = configuration.buildSessionFactory();
                     session2 = sessionFactory2.openSession();
                     tx2 = session2.beginTransaction();
                     Log log = session2.load(Log.class, BigInteger.valueOf((long) log_id));
                   
                     if( log != null ){
                        if( log.getJob_running()== null ){
                            JSONObject json       = new JSONObject();
                            json.put("client_id", client_id);
                            json.put("log_id", log_id);
                            json.put("job_key", job_key);
                            json.put("trigger_key", trigger_key);
                            json.put("min",min);
                            json.put("topic", topic);
                            json.put("delay", delay);
                            json.put("onetime", onetime);
                
                            JSONObject body = new JSONObject();
                            body.put("body", json);
                            producerService.sendMessageToTopic( body.toString(), topic);
                            log.setJob_running(true);
                            this.LogMessageInfo("Tempory Job pushed: " + json.toString() + ".");
                        }else if(log.getJob_running()== false){
                            JSONObject json       = new JSONObject();
                            json.put("client_id", client_id);
                            json.put("log_id", log_id);
                            json.put("job_key", job_key);
                            json.put("trigger_key", trigger_key);
                            json.put("min",min);
                            json.put("topic", topic);
                            json.put("delay", delay);
                            json.put("onetime", onetime);
                
                            JSONObject body = new JSONObject();
                            body.put("body", json);
                            producerService.sendMessageToTopic( body.toString(), topic);
                            log.setJob_running(true);
                            this.LogMessageInfo("Tempory Job pushed: " + json.toString() + ".");
                        }else{
                            this.LogMessageInfo("job is already running");
                        }
                        session2.update(log);
                        tx2.commit();
                        tx2 = null;
                     }else{
                        this.LogMessageInfo("Log not found.");
                     }
                 }else{
                    this.LogMessageInfo("Client not found.");
                 }

            
            
        } catch (Exception e) {
            e.printStackTrace();
            this.LogMessageError("Error: " + e.getMessage() );
        }finally{
              if(tx1 != null){
                 tx1.rollback();
              }
              if(tx2 != null){
                tx2.rollback();
              }
              if(session1 != null){
                 session1.close();
              }
              if(session2 != null){
                 session2.close();
              }
              if(sessionFactory1 != null){
                 sessionFactory1.close();
              }
              if(sessionFactory2 != null){
                 sessionFactory2.close();
              }
        }
    }

}