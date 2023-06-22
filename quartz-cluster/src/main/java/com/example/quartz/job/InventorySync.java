package com.example.quartz.job;


import com.example.quartz.model.Client;
import com.example.quartz.model.Log;
import com.example.quartz.service.ProducerService;
import com.example.quartz.service.TestService;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.json.JSONArray;
import org.json.JSONObject;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

import static java.lang.Thread.sleep;

@Slf4j
@Component
public class InventorySync  extends QuartzJobBean {

    @Autowired
    private final ProducerService producerService;
    public InventorySync(ProducerService producerService) {
        this.producerService = producerService;
    }
    @Autowired
    private Environment env;

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
        try {
            log.info("Sync Job Started ");
            String id = jobExecutionContext.getJobDetail().getKey().getName();
            log.info("Job ID : "+ id);
            //log.info(String.valueOf(jobExecutionContext.getJobDetail().getJobDataMap().getInt("client_id")));
            BigInteger client_id= BigInteger.valueOf(jobExecutionContext.getTrigger().getJobDataMap().getInt("client_id"));
            String job_type=jobExecutionContext.getTrigger().getJobDataMap().getString("job_type");
            log.info(String.valueOf(client_id));
            log.info(String.valueOf(job_type));
            // Create Log & push message to kafka cluster

            //log.info(message.toString());
            // Search DB to get client DB access details
            Configuration configuration = new Configuration();
            configuration.configure();
            // set master db from env setup
            configuration.setProperties(this.SetMasterDB());
            SessionFactory sessionFactory = configuration.buildSessionFactory();
            Session session = sessionFactory.openSession();
            Transaction tx = null;
            Boolean client_valid = false;

            tx = session.beginTransaction();
            Client client = (Client) session.get(Client.class, client_id);
            if (client != null) {
                // Set client as valid
                client_valid = true;
            } else {
                this.LogMessageWarning("Client not found : ");
            }
            tx.commit();
            if (client_valid) {
                // Switch to client DB
                // <!-- Database connection settings -->
                configuration.setProperties(this.SetClientDB(client.getDb_host(), client.getDb_port(), client.getDb_name(), client.getDb_user(), client.getDb_pass()));
                SessionFactory sessionFactory1 = configuration.buildSessionFactory();
                Session session1 = sessionFactory1.openSession();
                Transaction tx1 = null;
                try {
                    tx1 = session1.beginTransaction();
                    Log log = new Log();
                    JSONArray log_description = new JSONArray();
                    JSONObject log_add= new JSONObject();
                    log_add.put("key","event");
                    log_add.put("time", java.time.LocalDateTime.now(ZoneId.of("Asia/Kolkata")).toString());
                    log_add.put("value","Task added in queue");
                    log.setName(job_type);
                    log.setTopic("gcp.store.inventory.all.sync.0");

                    log_description.put(log_add);
                    log.setDescription(log_description.toString());
                    log.setCreated_at(Timestamp.valueOf(java.time.LocalDateTime.now()));
                    log.setUpdated_at(Timestamp.valueOf(java.time.LocalDateTime.now()));
                    log.setStatus("pending"); // default
                    session1.persist(log);
                    tx1.commit();
                    // send message to kafka
                    JSONObject message = new JSONObject();
                    message.put("client_id",client_id);
                    message.put("log_id" , log.getId());
                    message.put("job_type",job_type);
                    producerService.sendMessage(message.toString(),"gcp.store.inventory.all.sync.0");

                    this.LogMessageInfo("processed : "+client.getName());
                    sleep(100);
                    this.LogMessageInfo("Sync Job End ");
                }
                catch (Exception ex) {
                    if (tx1 != null) tx1.rollback();
                    session.close();
                    sessionFactory.close();
                    session1.close();
                    sessionFactory1.close();
                }
                finally {
                    session.close();
                    sessionFactory.close();
                    session1.close();
                    sessionFactory1.close();
                }

            }else{
                session.close();
                sessionFactory.close();
            }

        } catch (Exception e) {
            this.LogMessageWarning(e.getMessage());
            //throw new JobExecutionException(e);
        }
    }
}
