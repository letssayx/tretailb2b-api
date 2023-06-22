package com.example.quartz.components;

import org.quartz.Scheduler;
import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.quartz.job.AnlyticsJob; 

@Component
class AnalyticsRun implements CommandLineRunner {

    private Scheduler scheduler;

    public AnalyticsRun( Scheduler scheduler ) {
        this.scheduler = scheduler;
    }


    @Override
    public void run(String... args) {

        try {
            String job_name = "analytics_generate_job";
            String trigger_name = "analytics_generate_trigger";

            TriggerKey triggerKey = new TriggerKey(trigger_name);
            JobKey jobKey = new JobKey(job_name);

            if( !scheduler.checkExists(jobKey) ) {
                JobDetail newJobDetail = JobBuilder
                .newJob( AnlyticsJob.class )
                .withIdentity( jobKey )
                .build();

                Trigger newTrigger =  TriggerBuilder
                .newTrigger()
                .withIdentity( triggerKey )
                .withSchedule(
                    CronScheduleBuilder.dailyAtHourAndMinute(0, 0)
                )
                .build();
                this.scheduler.scheduleJob( newJobDetail, newTrigger );
            } else {
                scheduler.resumeTrigger( triggerKey );
            }
        } catch (Exception e) {
            System.out.println( e.getMessage() );
        }
    }
}