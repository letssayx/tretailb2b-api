package com.example.quartz.controller;

import com.example.quartz.job.BTestJob;
import com.example.quartz.job.InventorySync;
import com.example.quartz.job.FlipkartOrderSync;
import com.example.quartz.job.AmazonOrderSync;
import com.example.quartz.components.DBConfig;
import com.example.quartz.job.AmazonFilpkartInventorySync;
import lombok.extern.slf4j.Slf4j;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.hibernate.Session;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import org.hibernate.Transaction;
import com.example.quartz.model.ClientReq;
import com.example.quartz.model.Client;
import com.example.quartz.model.Log;

@RestController
@RequestMapping("/jobs")
@Slf4j
public class JobController {

    private final Scheduler scheduler;

    @Autowired
    private DBConfig dbConfig;

    public JobController(Scheduler scheduler) {
        this.scheduler = scheduler;
    }
    

    @GetMapping
    public String newJob() {
        try {
            JobDetail jobDetail =
                    JobBuilder.newJob(BTestJob.class).withIdentity("BTestJob")
                            .build();

            Trigger trigger = TriggerBuilder
                    .newTrigger().withIdentity("BTestJobTrigger")
                    //.withSchedule(SimpleScheduleBuilder.repeatSecondlyForever(1).withIntervalInSeconds(30).withRepeatCount(5))
                    .withSchedule(CronScheduleBuilder.cronSchedule("0/5 * * ? * * *"))
                    .startNow().build();

            scheduler.scheduleJob(jobDetail, trigger);

            return "BTestJob";
        } catch (SchedulerException e) {
            log.error(e.getMessage(), e);
            return "Error";
        }
    }
    @PostMapping
    public ResponseEntity<?> ScheduleJob(@RequestBody String body) throws JSONException {
        try {
            //JobDetail jobDetail =
            //        JobBuilder.newJob(BTestJob.class).withIdentity("BTestJob")
            //                .build();

            //scheduler.pauseJob(jobDetail.getKey());
            //log.info(body);
            JSONObject payload = new JSONObject(body);
            Integer client_id= payload.getInt("client_id");
            //log.info(client_id.toString());
            for(Integer i=0; i< payload.getJSONArray("jobs").length();i++) {
                JSONObject job= payload.getJSONArray("jobs").getJSONObject(i);
                String job_name= job.getString("job_name");
                String job_type= job.getString("job_type");
                Boolean job_start = job.getBoolean("job_start");
                Integer job_interval = job.getInt("interval");
                //log.info(job_interval.toString());
                String job_interval_unit = job.getString("interval_unit");
                if(client_id==null || job_name==null || job_type==null || job_start==null || job_interval==null ) {
                    throw new Exception("invalid request");
                }
                //log.warn("test1");
                JobDetail jobDetail = JobBuilder.newJob(InventorySync.class).withIdentity("InventorySync").build();
                Trigger jobTrigger = TriggerBuilder.newTrigger().withIdentity(job_name+"-Trigger").build();
                //TriggerKey jobTrigger= TriggerKey.triggerKey(job_name+"-Trigger");
                //log.warn("test2");
                if(scheduler.checkExists(jobTrigger.getKey())) {
                    //log.warn("test3");
                    // update job
                    if(job_start) {
                        //JobDataMap dataMap = jobTrigger.getJobDataMap();
                        //log.info(scheduler.getTrigger(jobTrigger.getKey()).getJobDataMap().getString("job_type"));
                        //log.warn(jobTrigger.getJobDataMap().getString("job_type"));
                        Integer new_interval= scheduler.getTrigger(jobTrigger.getKey()).getJobDataMap().getInt("job_interval");
                        //log.warn(new_interval.toString());
                        if(new_interval!=job_interval) {
                            // change interval will work on it later
                        }
                        log.warn("resume trigger");
                        scheduler.resumeTrigger(jobTrigger.getKey());
                    }
                    else {
                        log.warn("pause trigger");
                        scheduler.pauseTrigger(jobTrigger.getKey());
                    }
                }
                else {
                    log.info("creating job");
                    // create job if job start is true
                    if(job_start) {
                        Trigger trigger = TriggerBuilder
                                .newTrigger().withIdentity(job_name+"-Trigger")
                                .usingJobData("client_id",client_id)
                                .usingJobData("job_type",job_type)
                                .usingJobData("job_interval",job_interval)
                                .withSchedule(CronScheduleBuilder.cronSchedule("0/"+job_interval+" * * ? * * *").inTimeZone(TimeZone.getTimeZone("Asia/Calcutta")))
                                .build();
                        //log.info("creating job222");
                        // build cron based on schedule. makes interval always in minute
                        scheduler.scheduleJob(jobDetail, trigger);
                    }
                    else {
                        // Do nothing skip
                    }
                }

            }
            JSONObject success_output=new JSONObject();
            success_output.put("status","success");
            success_output.put("message","Successfully updated");
            return new ResponseEntity<>(success_output.toString(), HttpStatus.OK);
        } catch (Exception ex) {
            JSONObject error_output=new JSONObject();
            error_output.put("status","fail");
            error_output.put("message",ex.getMessage());
            ex.printStackTrace();
            return new ResponseEntity<>(error_output.toString(), HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping(value="/flipkart-order-sync",produces = "application/json")
    public ResponseEntity<?> FlipkartOrderSyncJob(@RequestBody ClientReq client_req) throws JSONException{
            //System.out.println("mworking");
            try{
                
                if(client_req.getInterval()==null){
                    client_req.setInterval(20); // set dafault interval
                }
                if(client_req.getStart()==null || client_req.getId()==null){
                    throw new Exception("start or id value not set");
                }
                String client_id = String.valueOf(client_req.getId());
                String state = null;
                String job_name= "FLIPKART_ORDER_SYNC";
                log.info("id:"+client_id);
                
                JobDetail jobDetail=JobBuilder
                .newJob(FlipkartOrderSync.class)
                .withIdentity("flipkart_order_sync_job_new_"+client_id)
                .build();
         
                Trigger trigger = TriggerBuilder
                .newTrigger().withIdentity("flipkart_order_sync_job_trigger_new_"+client_id)
                .build();
                if(scheduler.checkExists(trigger.getKey())) {
                    if(client_req.getStart()==true){
                         Trigger oldTrigger= scheduler
                                 .getTrigger(TriggerKey.triggerKey("flipkart_order_sync_job_trigger_new_"+client_id));
                         TriggerBuilder tb=oldTrigger.getTriggerBuilder();
                         Trigger newTrigger=tb.withSchedule(
                                 SimpleScheduleBuilder
                                         .simpleSchedule()
                                         .withIntervalInMinutes(client_req.getInterval())
                                         .repeatForever()
                                         .withMisfireHandlingInstructionNowWithExistingCount()
                         )
                         .build();
                         scheduler.rescheduleJob(oldTrigger.getKey(),newTrigger);
                         state="restarted";
                         log.info("flipkart-order-sync job restarted");
                    }else{
                         scheduler.pauseTrigger(trigger.getKey());
                         state="paused";
                         log.warn("flipkart-order-sync job paused");
                    }
                }else{
                    if(client_req.getStart()==true){
                         Trigger newTrigger=TriggerBuilder
                         .newTrigger()
                         .withIdentity("flipkart_order_sync_job_trigger_new_"+client_id)
                         .usingJobData("client_id",client_id)
                         .usingJobData("job_name",job_name)
                         .withSchedule(
                             SimpleScheduleBuilder
                             .simpleSchedule()
                             .withIntervalInMinutes(client_req.getInterval())
                             .repeatForever()
                             .withMisfireHandlingInstructionNowWithExistingCount()
                         )
                         .build();
                         scheduler.scheduleJob(jobDetail, newTrigger);
                         state="started";
                         log.info("flipkart-order-sync job created");
                    }else{
                           
                          //do nothing
                    }
                }
                JSONObject success_output=new JSONObject();
                success_output.put("status","success");
                success_output.put("message","Successfully updated");
                success_output.put("state",state);
                return new ResponseEntity<>(success_output.toString(), HttpStatus.OK);
            }catch(Exception ex){
                // log.error(e.getMessage(), e);
                JSONObject error_output=new JSONObject();
                error_output.put("status","fail");
                error_output.put("message",ex.getMessage());
                //log.info("errok");
                ex.printStackTrace();
                return new ResponseEntity<>(error_output.toString(), HttpStatus.BAD_REQUEST);      
                
            }

    }
    @PostMapping(value="/amazon-order-sync",produces = "application/json")
    public ResponseEntity<?> AmazonOrderSyncJob(@RequestBody ClientReq client_req) throws JSONException{
            //System.out.println("mworking");
            try{

                
                if(client_req.getInterval()==null){
                    client_req.setInterval(15); // set dafault interval
                }
                if(client_req.getStart()==null || client_req.getId()==null){
                    throw new Exception("start or id value not set");
                }
                String client_id = String.valueOf(client_req.getId());
                String state = null;
                String job_name= "AMAZON_ORDER_SYNC";
                log.info("id:"+client_id);
                JobDetail jobDetail=JobBuilder
                .newJob(AmazonOrderSync.class)
                .withIdentity("amazon_order_sync_job_"+client_id)
                .build();
         
                Trigger trigger = TriggerBuilder
                .newTrigger().withIdentity("amazon_order_sync_job_trigger_"+client_id)
                .build();
                if(scheduler.checkExists(trigger.getKey())) {
                    if(client_req.getStart()==true){
                          Trigger oldTrigger= scheduler
                                  .getTrigger(TriggerKey.triggerKey("amazon_order_sync_job_trigger_"+client_id));
                          TriggerBuilder tb=oldTrigger.getTriggerBuilder();
                          Trigger newTrigger=tb.withSchedule(
                                  SimpleScheduleBuilder
                                          .simpleSchedule()
                                          .withIntervalInMinutes(client_req.getInterval())
                                          .repeatForever()
                                          .withMisfireHandlingInstructionNowWithExistingCount()
                          )
                          .build();
                          scheduler.rescheduleJob(oldTrigger.getKey(),newTrigger);
                          state="restarted";
                          log.info("amazon-order-sync job restarted");
                    }else{
                        scheduler.pauseTrigger(trigger.getKey());
                        state="paused";
                        log.warn("amazon-order-sync job paused");   //pause trigger
                    }
                }else{
                    if(client_req.getStart()==true){
                          Trigger newTrigger=TriggerBuilder
                          .newTrigger()
                          .withIdentity("amazon_order_sync_job_trigger_"+client_id)
                          .usingJobData("client_id",client_id)
                          .usingJobData("job_name",job_name)
                          .withSchedule(
                              SimpleScheduleBuilder
                              .simpleSchedule()
                              .withIntervalInMinutes(client_req.getInterval())
                              .repeatForever()
                              .withMisfireHandlingInstructionNowWithExistingCount()
                          )
                          .build();
                          scheduler.scheduleJob(jobDetail, newTrigger);
                          state="started";
                          log.info("amazon-order-sync job created");
                    }else{
                        //do nothing
                    }
                }
                JSONObject success_output=new JSONObject();
                success_output.put("status","success");
                success_output.put("message","Successfully updated");
                success_output.put("state",state);
                return new ResponseEntity<>(success_output.toString(), HttpStatus.OK);
            }catch(Exception ex){
                // log.error(e.getMessage(), e);
                JSONObject error_output=new JSONObject();
                error_output.put("status","fail");
                error_output.put("message",ex.getMessage());
                //log.info("errok");
                ex.printStackTrace();
                return new ResponseEntity<>(error_output.toString(), HttpStatus.BAD_REQUEST);      
                
            }

    }
    @PostMapping(value="/amazon-flipkart-inventory-sync",produces = "application/json")
    public ResponseEntity<?> AmazonFlipkartInventorySyncJob(@RequestBody ClientReq client_req) throws JSONException{
            //System.out.println("mworking");
            try{
                if(client_req.getInterval()==null){
                    client_req.setInterval(10); // set dafault interval
                }
                if(client_req.getStart()==null || client_req.getId()==null){
                    throw new Exception("start or id value not set");
                }
                String client_id = String.valueOf(client_req.getId());
                String state = null;
                String job_name= "AMAZON_FLIPKART_INVENTORY_SYNC";
                log.info("id:"+client_id);
                JobDetail jobDetail=JobBuilder
                .newJob(AmazonFilpkartInventorySync.class)
                .withIdentity("amazon_flipkart_inventory_sync_job_"+client_id)
                .build();
         
                Trigger trigger = TriggerBuilder
                .newTrigger().withIdentity("amazon_flipkart_inventory_sync_trigger_"+client_id)
                .build();
                if(scheduler.checkExists(trigger.getKey())) {
                    if(client_req.getStart()==true){
                         Trigger oldTrigger= scheduler
                                 .getTrigger(TriggerKey.triggerKey("amazon_flipkart_inventory_sync_trigger_"+client_id));
                         TriggerBuilder tb=oldTrigger.getTriggerBuilder();
                         Trigger newTrigger=tb.withSchedule(
                                 SimpleScheduleBuilder
                                         .simpleSchedule()
                                         .withIntervalInMinutes(client_req.getInterval())
                                         .repeatForever()
                                         .withMisfireHandlingInstructionNowWithExistingCount()
                         )
                         .build();
                         scheduler.rescheduleJob(oldTrigger.getKey(),newTrigger);
                         state="restarted";
                         log.info("amazon-flipkart-inventory-sync job restarted");
                    }else{
                         scheduler.pauseTrigger(trigger.getKey());
                         state="paused";
                         log.warn("amazon-flipkart-inventory-sync job paused");
                    }

                }else{
                    if(client_req.getStart()==true){
                         Trigger newTrigger=TriggerBuilder
                        .newTrigger()
                        .withIdentity("amazon_flipkart_inventory_sync_trigger_"+client_id)
                        .usingJobData("client_id",client_id)
                        .usingJobData("job_name",job_name)
                        .withSchedule(
                            SimpleScheduleBuilder
                            .simpleSchedule()
                            .withIntervalInMinutes(client_req.getInterval())
                            .repeatForever()
                            .withMisfireHandlingInstructionNowWithExistingCount()
                        )
                        .build();
                        scheduler.scheduleJob(jobDetail, newTrigger);
                        state="started";
                        log.info("amazon-flipkart-inventory-sync job created");
                   }else{
                        //do nothing
                   }
                }
                JSONObject success_output=new JSONObject();
                success_output.put("status","success");
                success_output.put("message","Successfully updated");
                success_output.put("state",state);
                return new ResponseEntity<>(success_output.toString(), HttpStatus.OK);
            }catch(Exception ex){
                // log.error(e.getMessage(), e);
                JSONObject error_output=new JSONObject();
                error_output.put("status","fail");
                error_output.put("message",ex.getMessage());
                //log.info("errok");
                ex.printStackTrace();
                return new ResponseEntity<>(error_output.toString(), HttpStatus.BAD_REQUEST);      
                
            }
    }

    @PostMapping(value="/remove-sync",produces = "application/json")
    public ResponseEntity<?> DeleteJobSync(@RequestBody String body) throws JSONException{
        try{
            JSONObject payload =  new JSONObject(body);
            Integer client_id = payload.getInt("client_id");
            scheduler.deleteJob(JobKey.jobKey("amazon_flipkart_inventory_sync_job_"+client_id.toString()));
            scheduler.unscheduleJob(TriggerKey.triggerKey("amazon_flipkart_inventory_sync_trigger_"+client_id.toString()));
            scheduler.deleteJob(JobKey.jobKey("amazon_order_sync_job_"+client_id.toString()));
            scheduler.unscheduleJob(TriggerKey.triggerKey("amazon_order_sync_job_trigger_"+client_id.toString()));
            scheduler.deleteJob(JobKey.jobKey("flipkart_order_sync_job_new"+client_id.toString()));
            scheduler.unscheduleJob(TriggerKey.triggerKey("flipkart_order_sync_job_trigger_new_"+client_id.toString()));
            JSONObject success_obj = new JSONObject();
            success_obj.put("status", "success");
            success_obj.put("message", "All sync removed");
            return new ResponseEntity<>("ok", HttpStatus.OK);

        }catch(Exception e){
            e.printStackTrace();
            JSONObject err_obj = new JSONObject();
            err_obj.put("status","fail");
            err_obj.put("message", e.getMessage());
            return new ResponseEntity<>(err_obj.toString(),HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value="/job-state", produces = "application/json" )
    public ResponseEntity<?> getJobState(@RequestBody String body) throws JSONException{
        try {

            JSONObject payload = new JSONObject(body);
            String job    = payload.getString("job");
            int client_id = payload.getInt("client_id");
            TriggerKey triggerKey = null;
            String state = null;
                      
            switch (job) {
                case "FLIPKART_ORDER_SYNC":
                    triggerKey = new TriggerKey("flipkart_order_sync_job_trigger_new_" + client_id);
                    break;
                case "AMAZON_ORDER_SYNC":
                    triggerKey = new TriggerKey("amazon_order_sync_job_trigger_" + client_id);
                    break;
                case "AMAZON_FLIPKART_INVENTORY_SYNC":
                    triggerKey = new TriggerKey("amazon_flipkart_inventory_sync_trigger_"  + client_id);
                    break;
                default:
                    break;
            }

            if(triggerKey != null){
                if( scheduler.checkExists(triggerKey) ){
                    if( scheduler.getTriggerState(triggerKey) == Trigger.TriggerState.PAUSED){
                       state = "paused";
                    }else{
                       state = "normal";
                    }
                }else{
                    state = "notexist";
                }
            }else{
                state = "notexist";
            }
            

            JSONObject obj = new JSONObject();
            obj.put("jobName", job );
            obj.put("state", state );
            return new ResponseEntity<>( obj.toString(), HttpStatus.OK);

        } catch (Exception e) {

            e.printStackTrace();
            JSONObject err_obj = new JSONObject();
            err_obj.put("status","fail");
            err_obj.put("message", e.getMessage());
            return new ResponseEntity<>(err_obj.toString(),HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value="/sync-interval-set-job", produces = "application/json" )
    public ResponseEntity<?> UpdateSyncIntervalSetJob(@RequestBody String body) throws JSONException{

        try {
            JSONObject payload = new JSONObject(body);
            int interval    = payload.getInt("interval");
            boolean start   = payload.getBoolean("start");
            TriggerKey triggerKey = new TriggerKey("sync_process_interval_set_trigger");
            JobKey jobKey = new JobKey("sync_process_interval_set_job");

            if( this.scheduler.checkExists(triggerKey)){

                if( start == true ){

                         Trigger oldTrigger= scheduler
                                 .getTrigger( triggerKey );
                         Trigger newTrigger = TriggerBuilder.newTrigger()
                                              .withIdentity(triggerKey)
                                              .withSchedule(
                                                      SimpleScheduleBuilder
                                                              .simpleSchedule()
                                                              .withIntervalInHours(interval)
                                                              .repeatForever()
                                              )
                                              .build();
                         scheduler.rescheduleJob( oldTrigger.getKey(), newTrigger);
                }else{
                    this.scheduler.pauseTrigger( triggerKey );
                }
            }

            JSONObject obj = new JSONObject();
            obj.put("status", "success");
            obj.put("message", "job updated successfully");
            return new ResponseEntity<>( obj.toString(), HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            JSONObject err_obj = new JSONObject();
            err_obj.put("status","fail");
            err_obj.put("message", e.getMessage());
            return new ResponseEntity<>(err_obj.toString(),HttpStatus.BAD_REQUEST);

        }

    }

    @PostMapping(value="/job-triggers", produces = "application/json" )
    public ResponseEntity<?> getJobTriggers(@RequestBody String body) throws JSONException {

        try {
            JSONObject payload = new JSONObject(body);
            String job         = payload.getString("job");
            JobKey jobKey      = new JobKey((payload.has("client_id") ? job + payload.getInt("client_id"): job));

            List<Trigger> jobTriggers = (List<Trigger>)this.scheduler.getTriggersOfJob(jobKey);

            if(!this.scheduler.checkExists(jobKey)){
                throw new Exception("Job Doesn't Exist");
            }

            JSONArray resp_array = new JSONArray();
            for (int i = 0; i < jobTriggers.size(); i++) {
                
                JSONObject resp_obj = new JSONObject();
                Trigger trigger = jobTriggers.get(i);
                Long interval = trigger.getNextFireTime().getTime() - trigger.getPreviousFireTime().getTime();
                resp_obj.put( "name",   trigger.getKey());
                resp_obj.put("interval", interval);
                resp_obj.put("job", jobKey.toString());
                resp_array.put( resp_obj );
            }

            return new ResponseEntity<>( resp_array.toString(), HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            JSONObject err_obj = new JSONObject();
            err_obj.put("status","fail");
            err_obj.put("message", e.getMessage());
            return new ResponseEntity<>(err_obj.toString(),HttpStatus.BAD_REQUEST);
        }

    }

    @PostMapping(value="/temporary-job", produces = "application/json" )
    public ResponseEntity<?> AmazonProductApiCache(@RequestBody String body) throws JSONException {

        SessionFactory sessionFactory1  = null, sessionFactory2 = null;
        Session session1 = null, session2 = null;
        Transaction tx1 = null, tx2 = null;

        try {
            JSONObject payload = new JSONObject(body);
            int log_id         = payload.getInt("log_id");
            int client_id      = payload.getInt("client_id");
            String jobKey      = this.getRandStr( 20 );
            String triggerKey  = this.getRandStr(20);
            int min            = payload.getInt("min");
            String topic       = payload.getString("topic");
            Boolean start      = payload.getBoolean("start");
            int delay          = payload.has("delay")? payload.getInt("delay"): 0;
            Boolean onetime    = payload.has("onetime")? payload.getBoolean("onetime"): false;
           
            SimpleScheduleBuilder simpleScheduleBuilder   =  SimpleScheduleBuilder
                                                 .simpleSchedule()
                                                 .withIntervalInMinutes(min);
            Date triggerTime = null;

            if(onetime == false){
                simpleScheduleBuilder  = simpleScheduleBuilder.repeatForever();
            }else{
                simpleScheduleBuilder  = simpleScheduleBuilder.withRepeatCount(0);
            }
            if(delay != 0){
                triggerTime = new Date((new Date().getTime() + (delay * 1000 * 60)));
            }else{
                triggerTime = new Date((new Date().getTime() +  (1000 * 60) ));;
            }
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
                     Log log = session2.load(Log.class,  BigInteger.valueOf((long) log_id));
                     tx2.commit();
                     tx2 = null;
                     if(log != null){
                        if(payload.has("job_key") && payload.has("trigger_key")){
                            jobKey     = payload.getString("job_key");
                            triggerKey = payload.getString("trigger_key");
                        }
            
                        if( start == true &&
                            !payload.has("job_key") &&
                            !payload.has("trigger_key")
                        ){
                            JobDetail jobDetail=JobBuilder
                           .newJob(com.example.quartz.job.TemporaryJob.class)
                           .withIdentity(jobKey)
                           .build();
                       
                           Trigger trigger = TriggerBuilder
                           .newTrigger().withIdentity( triggerKey )
                           .usingJobData("client_id", client_id)
                           .usingJobData("log_id", log_id)
                           .usingJobData("job_key", jobKey)
                           .usingJobData("trigger_key", triggerKey)
                           .usingJobData("min", min)
                           .usingJobData("topic", topic)
                           .usingJobData("delay", delay)
                           .usingJobData("onetime", onetime)
                           .withSchedule(
                              simpleScheduleBuilder 
                           )
                           .startAt( triggerTime )
                           .build();
                           scheduler.scheduleJob(jobDetail, trigger);
                           payload.put("job_key", jobKey);
                           payload.put("trigger_key", triggerKey);
                           return new ResponseEntity<>( payload.toString(), HttpStatus.OK);

                       }else if( start == false &&
                        payload.has("job_key") && 
                        payload.has("trigger_key") 
                       ){
           
                           scheduler.deleteJob(new JobKey( jobKey ));
                           scheduler.unscheduleJob(new TriggerKey( triggerKey ));
                           payload.put("job_key", jobKey);
                           payload.put("trigger_key", triggerKey);
                           return new ResponseEntity<>( payload.toString(), HttpStatus.OK);
           
                       }

                     }else{
                        JSONObject err_obj = new JSONObject();
                        err_obj.put("status","fail");
                        err_obj.put("message", "log not found");
                        return new ResponseEntity<>(err_obj.toString(),HttpStatus.BAD_REQUEST);
                     }
                 }else{
                    JSONObject err_obj = new JSONObject();
                    err_obj.put("status","fail");
                    err_obj.put("message", "client not found");
                    return new ResponseEntity<>(err_obj.toString(),HttpStatus.BAD_REQUEST);
                 }
                 
                 payload.put("job_key", jobKey);
                 payload.put("trigger_key", triggerKey);
                 return new ResponseEntity<>( payload.toString(), HttpStatus.OK);
            
            
        } catch (Exception e) {
            e.printStackTrace();
            JSONObject err_obj = new JSONObject();
            err_obj.put("status","fail");
            err_obj.put("message", e.getMessage());
            return new ResponseEntity<>(err_obj.toString(),HttpStatus.BAD_REQUEST);
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

    public String getRandStr(int n)
    {
        String AlphaNumericString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                    + "0123456789"
                                    + "abcdefghijklmnopqrstuvxyz";
        StringBuilder sb = new StringBuilder(n);
  
        for (int i = 0; i < n; i++) {
            int index
                = (int)(AlphaNumericString.length()
                        * Math.random());
            sb.append(AlphaNumericString
                          .charAt(index));
        }
        return sb.toString();
    }
}


