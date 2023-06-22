package com.example.quartz.job;

import com.example.quartz.service.ProducerService;
import lombok.extern.slf4j.Slf4j;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

import org.hibernate.query.Query;
import org.hibernate.Transaction;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.springframework.core.env.Environment;
import org.json.JSONArray;
import org.json.JSONObject;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import com.example.quartz.model.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import static java.lang.Thread.sleep;

import java.math.BigInteger;
import java.sql.Timestamp;

public class AnlyticsJob extends QuartzJobBean{
    
    private ProducerService producerService;
    @Autowired
    private Environment env;

    public AnlyticsJob(ProducerService producerService){
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

    public Properties SetMasterDB(){
        Properties properties = new Properties();
        properties.put("hibernate.connection.url", "jdbc:mysql://"+env.getProperty("spring.db.host")+":" + env.getProperty("spring.db.port") + "/" + env.getProperty("spring.db.database"));
        properties.put("hibernate.connection.username",env.getProperty("spring.db.user"));
        properties.put("hibernate.connection.password",env.getProperty("spring.db.pass"));
        properties.put("show_sql",env.getProperty("spring.db.show"));
        properties.put("format_sql",env.getProperty("spring.db.format"));
        properties.put("use_sql_comments",env.getProperty("spring.db.comments"));
        return properties;
    }
    public Properties SetClientDB(String host, String port, String db_name, String user, String pass){
        Properties properties = new Properties();
        //if(env.getActiveProfiles()[0]=="prod") {
        //   properties.put("hibernate.connection.url", "jdbc:mysql://" + host + ":" + port + "/" + db_name); // for production docker container
        //}
        //else {
        properties.put("hibernate.connection.url", "jdbc:mysql://"+env.getProperty("spring.db.host")+":" + env.getProperty("spring.db.port") + "/" + db_name);
        //}
        properties.put("hibernate.connection.username", user);//Here your connection username
        properties.put("hibernate.connection.password", pass); //Here your connection password
        properties.put("show_sql",env.getProperty("spring.db.show"));
        properties.put("format_sql",env.getProperty("spring.db.format"));
        properties.put("use_sql_comments",env.getProperty("spring.db.comments"));
        return properties;
    }
    
    @Override
    protected void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {


          SessionFactory sessionFactory1 = null, sessionFactory2 = null;
          Session session1 = null, session2 = null;
          Transaction tx1 = null;
          Transaction tx2 = null;
          DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
          try {
              Configuration configuration = new Configuration();
              configuration.configure();
              // set master db from env setup
              configuration.setProperties(this.SetMasterDB());
              SessionFactory sessionFactory = configuration.buildSessionFactory();
              session1 = sessionFactory.openSession();
              Query client_query =session1.createQuery("From Client");
              List<Client> client_list = client_query.list();
              for (int i = 0; i < client_list.size(); i++) {
                Client client = client_list.get(i);
                try{
                  configuration.setProperties(this.SetClientDB(client.getDb_host(), client.getDb_port(), client.getDb_name(), client.getDb_user(), client.getDb_pass()));
                  sessionFactory2 = configuration.buildSessionFactory();
                  session2 = sessionFactory2.openSession();
                  tx2 = session2.beginTransaction();
                  List<BigInteger> order_data = session2.createSQLQuery("SELECT COUNT(*) as order_count FROM orders").list();
                  BigInteger order_count = order_data.get(0);
                  if(order_count.signum() == 1){
                        String current_datetime = LocalDateTime.now(ZoneId.of("Asia/Kolkata")).format(formatter);
                        Log log = new Log();
                        log.setName("ANALYTICS UPDATE");
                        JSONArray log_description = new JSONArray();
                        log_description.put( new JSONObject()
                                             .put("key", "event")
                                             .put("time", current_datetime)
                                             .put("value", "task queued")
                                             );
                        log.setDescription(log_description.toString());
                        log.setStatus("queued");
                        log.setTopic("gcp.store.analytics.process.0");
                        log.setCreated_at(Timestamp.valueOf(LocalDateTime.now()));
                        log.setUpdated_at(Timestamp.valueOf(LocalDateTime.now()));
                        session2.persist(log);
                        tx2.commit();
                        tx2 = null;
                        String kafka_message = new JSONObject()
                        .put("body", new JSONObject()
                                          .put("client_id", client.getId())
                                          .put("log_id", log.getId()))
                        .toString();
                        this.producerService.sendMessage(kafka_message, "gcp.store.analytics.process.0");
                        this.LogMessageInfo("Analytics job tigggered");
                        this.LogMessageInfo("Client: " + client.getId());
                        this.LogMessageInfo("Log: " + log.getId());
                  }else{
                      this.LogMessageInfo("No orders. Analytic job aborted");
                      this.LogMessageInfo("client: " + client.getId());
                  }    
                }catch(Exception ex){
                    //ex.printStackTrace();
                    this.LogMessageInfo("Client: " + client.getId() );
                    this.LogMessageInfo("Analytics job failed: " + ex.getMessage());
                }finally{
                     if(tx2 != null){
                        tx2.rollback();
                     }
                     if(session2 != null){
                       session2.close();
                     }
                     if(sessionFactory2 != null){
                       sessionFactory2.close();
                     }
                }
                sleep(1000 * 60 * 1);

              }


          } catch (Exception e) {

             this.LogMessageError("Failed to trigger analytics job");
             e.printStackTrace();
             if(tx2 != null){
                tx2.rollback();
             }
          }finally{

              if(sessionFactory1 != null){
                sessionFactory1.close();
              }
              if(sessionFactory1 != null){
                sessionFactory1.close();
              }
              if(session1 != null){
                session1.close();
              }
              if(session2 != null){
                session2.close();
              }
          }
    }
}
