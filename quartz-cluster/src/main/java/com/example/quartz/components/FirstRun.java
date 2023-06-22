package com.example.quartz.components;

import org.quartz.Scheduler;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.quartz.job.SyncIntervalSet; 

@Component
class FirstRun implements CommandLineRunner {


    private Scheduler scheduler;

    public FirstRun( Scheduler scheduler) {
        this.scheduler = scheduler;
    }

    @Override
    public void run(String... args) {
        /* 
        try {

            TriggerKey triggerKey = new TriggerKey("sync_process_interval_set_trigger");
            JobKey jobKey = new JobKey("sync_process_interval_set_job");

            if(!scheduler.checkExists(jobKey) ) {
                JobDetail newJobDetail = JobBuilder
                .newJob( SyncIntervalSet.class)
                .withIdentity("sync_process_interval_set_job")
                .build();

                Trigger newTrigger =  TriggerBuilder
                .newTrigger()
                .withIdentity("sync_process_interval_set_trigger")
                .withSchedule(
                    SimpleScheduleBuilder
                    .simpleSchedule()
                    .withIntervalInHours(6)
                    .repeatForever()
                )
                .build();
                this.scheduler.scheduleJob( newJobDetail, newTrigger );
            } else {
                scheduler.resumeTrigger(triggerKey);
            }
        } catch (Exception e) {
            System.out.println( e.getMessage() );
        }
        */
    }
}