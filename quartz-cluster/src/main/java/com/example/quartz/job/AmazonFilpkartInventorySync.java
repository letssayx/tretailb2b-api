package com.example.quartz.job;

import com.example.quartz.model.Client;
import com.example.quartz.model.Log;
import com.example.quartz.model.Setting;
import com.example.quartz.service.ProducerService;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.hibernate.query.Query;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;
import java.util.Date;
import java.util.Calendar;
import java.util.List;
import java.text.SimpleDateFormat;
import static java.lang.Thread.sleep;
import java.text.SimpleDateFormat;
import org.quartz.*;

@Slf4j
@Component
public class AmazonFilpkartInventorySync extends QuartzJobBean{

    @Autowired
    private final ProducerService producerService;
    public AmazonFilpkartInventorySync(ProducerService producerService) {
        this.producerService = producerService;
    }

    @Autowired
    private Environment env;

    @Autowired
    private Scheduler scheduler;

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
    protected void executeInternal(JobExecutionContext jobExecutionContext){
        try{
           SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
           String id = jobExecutionContext.getJobDetail().getKey().getName();
           String client_id = jobExecutionContext.getTrigger().getJobDataMap().getString("client_id");
           String job_type = jobExecutionContext.getTrigger().getJobDataMap().getString("job_name");
           String current_date = java.time.LocalDateTime.now(ZoneId.of("Asia/Kolkata")).toString().replaceAll("\\.[1-9]{6}","").replaceAll("T"," "); 
           Date d1 = null;
		   Date d2 = format.parse(current_date);
           Boolean should_run = true;
           SimpleDateFormat queryDateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
           java.time.LocalDateTime current_time = java.time.LocalDateTime.now();
           java.time.LocalDateTime time_4hours_ago = current_time.minusHours(6);
           String time_4hours_ago_text = time_4hours_ago.toString().split("T")[0] + " "
                                         + time_4hours_ago.toString().split("T")[1].split("\\.")[0]; 
           
           log.info("Amazon flipkart inventory sync has stared");
           log.info("job id:"+id);
           log.info("client: "+client_id);
           Configuration configuration = new Configuration();
           configuration.configure();
            // set master db from env setup
            configuration.setProperties(this.SetMasterDB());
            SessionFactory sessionFactory = configuration.buildSessionFactory();
            Session session = sessionFactory.openSession();
            Transaction tx = null;
            Boolean client_valid = false;
            Boolean key_exist=false;
            tx = session.beginTransaction();
            Client client = (Client) session.get(Client.class, new BigInteger(client_id));
            if (client != null) {
                // Set client as valid
                client_valid = true;
                this.LogMessageInfo("client found");
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
                  
                  Setting setting=(Setting) session1.bySimpleNaturalId(Setting.class).load("amazon_flipkart_last_sync_time");
                  if (setting != null && !setting.getValue().isEmpty()) {
                     key_exist=true;
                  }
                  if(!key_exist){
                      should_run = false;
                  }

                  Setting amazon_verified = session1.bySimpleNaturalId(Setting.class).load("amazon_verified");
                  Setting flipkart_verified = session1.bySimpleNaturalId(Setting.class).load("flipkart_verified");
                  Setting inventory_automation = session1.bySimpleNaturalId(Setting.class).load("amazon_flipkart_inventory_sync_automation");

                  if(
                    amazon_verified != null &&
                    amazon_verified.getValue().equals("1") &&
                    flipkart_verified != null &&
                    flipkart_verified.getValue().equals("1") &&
                    inventory_automation != null &&
                    inventory_automation.getValue().equals("1")
                  ){
                     Query query1 = session1.createQuery("FROM Log lg where lg.name=:name AND lg.created_at>:max_time_ago ORDER BY lg.created_at DESC");
                     query1.setParameter("name", "FLIPKART_ORDER_SYNC");
                     query1.setParameter("max_time_ago", queryDateFormat.parse(time_4hours_ago_text));
                     query1.setFirstResult(0);
                     query1.setMaxResults(1);
                     List<Log> flipkar_order_sync_logs = query1.list();
   
                     if((flipkar_order_sync_logs.size()!=0) && !flipkar_order_sync_logs.get(0).getStatus().equals("completed") && !flipkar_order_sync_logs.get(0).getStatus().equals("failed") && !flipkar_order_sync_logs.get(0).getStatus().equals("cancelled")){
                         should_run = false;
                     }
   
                     Query query2 = session1.createQuery("FROM Log lg where lg.name=:name AND lg.created_at>:max_time_ago ORDER BY lg.created_at DESC");
                     query2.setParameter("name", "AMAZON_FLIPKART_INVENTORY_SYNC");
                     query2.setParameter("max_time_ago", queryDateFormat.parse(time_4hours_ago_text));
                     query2.setFirstResult(0);
                     query2.setMaxResults(1);
                     List<Log> marketplace_inventory_sync_logs = query2.list();
   
                     if((marketplace_inventory_sync_logs.size()!=0) && !marketplace_inventory_sync_logs.get(0).getStatus().equals("completed") && !marketplace_inventory_sync_logs.get(0).getStatus().equals("failed") && !marketplace_inventory_sync_logs.get(0).getStatus().equals("cancelled")){
                        should_run = false;
                     }
   
                     if(should_run){
                        d1 = format.parse(setting.getValue());
                        long diff_time = (d2.getTime() - d1.getTime())/(60 * 1000);
                        System.out.println("updated: "+diff_time+" min ago");
                        if(diff_time>10){
                        Log log = new Log();
                        JSONArray log_description = new JSONArray();
                        JSONObject log_add= new JSONObject();
                        log_add.put("key","event");
                        log_add.put("time", java.time.LocalDateTime.now(ZoneId.of("Asia/Kolkata")).toString());
                        log_add.put("value","Task added in queue");
                        log.setName(job_type);
                        log.setTopic("gcp.store.inventory.amazon_flipkart.sync.0");
        
                        log_description.put(log_add);
                        log.setDescription(log_description.toString());
                        log.setCreated_at(Timestamp.valueOf(java.time.LocalDateTime.now()));
                        log.setUpdated_at(Timestamp.valueOf(java.time.LocalDateTime.now()));
                        log.setStatus("pending"); // default
                        session1.persist(log);
                        // send message to kafka
                        JSONObject body = new JSONObject();
                        JSONObject message = new JSONObject();
                        message.put("client_id",client_id);
                        message.put("log_id" , log.getId());
                        message.put("job_type",job_type);
                        body.put("body",message);
                        producerService.sendMessageToTopic(body.toString(),Integer.valueOf(3));
        
                        this.LogMessageInfo("Amazon Flipkart Inventory Sync Job processed : "+client.getName());
                        sleep(100);
                        this.LogMessageInfo("Amazon Flipkart Inventory Sync Job End ");
                        }
                     }
                  }else{
                        this.scheduler.unscheduleJob(new TriggerKey( "amazon_flipkart_inventory_sync_trigger_" + client_id ));
                        this.scheduler.deleteJob(new JobKey( "amazon_flipkart_inventory_sync_job_" + client_id ));
                        if(inventory_automation != null){
                            inventory_automation.setValue("0");
                            session1.update(inventory_automation);
                        }
                        this.LogMessageInfo("sync job removed");
                  }
                  tx1.commit();
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
        }catch(Exception e){
            this.LogMessageWarning(e.getMessage());
        }

    }


}